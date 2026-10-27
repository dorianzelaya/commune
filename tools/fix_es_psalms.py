"""The Douay counts a psalm's superscription as verse 1 ('Unto the end, a
psalm for David'); some psalms spend two verses on the title and occasion.
The Spanish module does not number the title at all, so its psalm bodies sit
one or two numbers low: Spanish 50:12 holds Douay 50:13's text.

A psalm is renumbered only when two independent signals agree:

  1. shift = douay_last - spanish_last, and it is 1 or 2.
  2. the first `shift` Douay verses all read as a superscription, and the
     Spanish verse 1 does not.

Anything else is left alone and listed. Every row that changes is dumped as
INSERT statements to tools/psalm_rollback.sql first, so this is reversible.

Renumbering leaves the title's verse number with no row. That is deliberate:
the Spanish text genuinely has no numbered title, and a gap at the top is
honest where putting English or a guess in verse 1 would not be.
"""
import re
import sys
from collections import defaultdict
from sqlalchemy import text
from database import engine

EN_TITLE = re.compile(r'unto the end|a psalm|psalm (of|for|to)|canticle|alleluia'
                      r'|gradual|of david|for david|to david|sons of core|idithun'
                      r'|asaph|understanding|on the eighth|winepresses|instruction'
                      r'|when he|when nathan|at the time|for the sons', re.I)
ES_TITLE = re.compile(r'^al maestro|salmo de david|c[aá]ntico|aleluya|para el fin'
                      r'|^de david|hijos de cor[eé]|^salmo|^oraci[oó]n de', re.I)
ROLLBACK = '/Users/dorianzelaya/catholic-companion/tools/psalm_rollback.sql'


def main():
    with engine.connect() as c:
        names = [r[0] for r in c.execute(text(
            "select column_name from information_schema.columns "
            "where table_name='bible_verses_es' order by ordinal_position"))]
        en = defaultdict(dict)
        for ch, v, t in c.execute(text("select chapter_num, verse_num, text from bible_verses "
                                       "where book_slug='psalms'")):
            en[ch][v] = t
        es = defaultdict(dict)
        for ch, v, t in c.execute(text("select chapter_num, verse_num, text from bible_verses_es "
                                       "where book_slug='psalms'")):
            es[ch][v] = t

    plan, held = {}, []
    for ch in sorted(es):
        E, S = en.get(ch, {}), es[ch]
        if not E:
            continue
        shift = max(E) - max(S)
        if shift <= 0:
            continue
        why = []
        if shift > 2:
            why.append('shift %d too large' % shift)
        else:
            lead = [E.get(i, '') for i in range(1, shift + 1)]
            if not all(EN_TITLE.search(x or '') for x in lead):
                why.append('douay verse 1..%d does not read as a title' % shift)
            if ES_TITLE.search(S.get(1, '')):
                why.append('spanish verse 1 already is a title')
        if why:
            held.append((ch, shift, max(E), max(S), '; '.join(why)))
        else:
            plan[ch] = shift

    print('=== psalms to renumber ===')
    byshift = defaultdict(list)
    for ch, s in plan.items():
        byshift[s].append(ch)
    for s in sorted(byshift):
        print('  shift +%d : %d psalms  %s' % (s, len(byshift[s]), sorted(byshift[s])))
    print()
    print('=== psalms left alone ===')
    for ch, s, em, sm, why in held:
        print('  psalm %3d  douay ends %3d, spanish ends %3d  ->  %s' % (ch, em, sm, why))
    print('  total held:', len(held))

    if not plan:
        print('nothing to do')
        return

    with open(ROLLBACK, 'w') as f:
        f.write('-- rollback for fix_es_psalms.py\n')
        f.write('-- restores the pre-shift rows of the psalms it renumbered\n')
        for ch in sorted(plan):
            f.write("delete from bible_verses_es where book_slug='psalms' and chapter_num=%d;\n" % ch)
            for v in sorted(es[ch]):
                t = es[ch][v].replace("'", "''")
                f.write("insert into bible_verses_es (book_slug, chapter_num, verse_num, text) "
                        "values ('psalms', %d, %d, '%s');\n" % (ch, v, t))
    print()
    print('rollback written to', ROLLBACK)

    with engine.begin() as c:
        for ch, shift in plan.items():
            c.execute(text("delete from bible_verses_es where book_slug='psalms' and chapter_num=:c"),
                      {'c': ch})
            for v in sorted(es[ch]):
                c.execute(text("insert into bible_verses_es (book_slug, chapter_num, verse_num, text) "
                               "values ('psalms', :c, :v, :t)"),
                          {'c': ch, 'v': v + shift, 't': es[ch][v]})
    print('applied to', len(plan), 'psalms')

    with engine.connect() as c:
        bad = c.execute(text('''
            select count(*) from
              (select chapter_num, max(verse_num) mx from bible_verses
                where book_slug='psalms' group by 1) e
              join (select chapter_num, max(verse_num) mx from bible_verses_es
                     where book_slug='psalms' group by 1) s using (chapter_num)
             where s.mx <> e.mx''')).scalar()
        print('psalms whose last verse still differs from the Douay:', bad)
        print('spanish verse rows now :', c.execute(text('select count(*) from bible_verses_es')).scalar())
        print()
        print('=== spot check, psalm 50 (Miserere) verses 1-5 ===')
        for v, t in c.execute(text("select verse_num, text from bible_verses_es "
                                   "where book_slug='psalms' and chapter_num=50 and verse_num<=5 "
                                   "order by verse_num")):
            print('  %2d  %s' % (v, t[:95]))
        print('    douay 50:3 is \"Have mercy on me, O God\" / \"Ten piedad de mi, oh Dios\"')
        print()
        print('=== remaining non-psalm chapters that end short ===')
        rows = c.execute(text('''
            select e.book_slug, e.chapter_num, e.mx, s.mx
              from (select book_slug, chapter_num, max(verse_num) mx from bible_verses group by 1,2) e
              join (select book_slug, chapter_num, max(verse_num) mx from bible_verses_es group by 1,2) s
                on s.book_slug=e.book_slug and s.chapter_num=e.chapter_num
             where s.mx < e.mx and e.book_slug <> 'psalms'
             order by (e.mx - s.mx) desc, 1, 2''')).all()
        for b, ch, em, sm in rows:
            last = c.execute(text('select text from bible_verses_es where book_slug=:b '
                                  'and chapter_num=:c and verse_num=:v'),
                             {'b': b, 'c': ch, 'v': sm}).scalar() or ''
            tail = c.execute(text('select text from bible_verses where book_slug=:b '
                                  'and chapter_num=:c and verse_num=:v'),
                             {'b': b, 'c': ch, 'v': em}).scalar() or ''
            print('  %-22s %3d   es ends %3d, douay ends %3d' % (b, ch, sm, em))
            print('      es last : %s' % last[:88])
            print('      douay   : %s' % tail[:88])
        print('  total:', len(rows))


main()
