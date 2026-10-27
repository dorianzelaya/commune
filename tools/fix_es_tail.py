"""The last of the numbering differences, each verified by reading both texts
side by side rather than inferred.

Phase 1, explicit mappings. Each entry is a list of (from_verse, shift): a
verse takes the largest shift whose from_verse it reaches.

  aggeus 2, ecclesiastes 7, jonas 2, numbers 13
      Torres Amat closes the previous chapter with what the Douay numbers as
      verse 1 here, so the whole chapter is one low.
  psalm 17   verse 2 holds Douay 2 and 3; verses 3 on are one low.
  psalm 51   verse 1 holds Douay 2 and 3, and the title is absent.
  psalm 53   same as 51.
  psalm 59   verse 1 holds Douay 1, 2 and 3.
  psalm 64   verse 1 holds Douay 1 and 2.
  psalm 87   same as 64.
  psalm 101  same as 64.
  psalm 4    verse 1 is Douay 2 with no title. One further merge inside it is
             left to phase 2.

Phase 2, for any chapter still exactly one verse short, finds the single
unmarked merge point by shared proper names and numerals and applies it only
when one position beats every other by a clear margin. Psalms included this
time, which phase 1 of the earlier pass deliberately skipped.

Chapters knowingly left alone, because the text is present and only the
chapter boundary differs: mark 8, canticle 5, ecclesiastes 4, apocalypse 12,
1-kings 20, 3-kings 22, osee 2, and job 39 and 40, where Torres Amat opens
chapter 40 with what the Douay numbers 39:31-35.
"""
import re
import sys
import unicodedata
from collections import defaultdict
from sqlalchemy import text
from database import engine

APPLY = '--apply' in sys.argv
ROLLBACK = '/Users/dorianzelaya/catholic-companion/tools/tail_rollback.sql'
MARGIN = 6.0

RULES = {
    ('aggeus', 2):        [(1, 1)],
    ('ecclesiastes', 7):  [(1, 1)],
    ('jonas', 2):         [(1, 1)],
    ('numbers', 13):      [(1, 1)],
    ('psalms', 4):        [(1, 1)],
    ('psalms', 17):       [(3, 1)],
    ('psalms', 51):       [(1, 1), (2, 2)],
    ('psalms', 53):       [(1, 1), (2, 2)],
    ('psalms', 59):       [(2, 2)],
    ('psalms', 64):       [(2, 1)],
    ('psalms', 87):       [(2, 1)],
    ('psalms', 101):      [(2, 1)],
}


def shift_for(v, rules):
    s = 0
    for frm, sh in rules:
        if v >= frm:
            s = sh
    return s


def strip(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if unicodedata.category(c) != 'Mn')


def anchors(txt):
    out = set()
    for w in re.findall(r'(?<![.!?]\s)(?<!^)\b([A-Z][a-zA-Záéíóúñ]{3,})\b', txt):
        out.add(strip(w).lower()[:4])
    for n in re.findall(r'\b\d+\b', txt):
        out.add('#' + n)
    return out


def load():
    with engine.connect() as c:
        en, es = defaultdict(dict), defaultdict(dict)
        for b, ch, v, t in c.execute(text('select book_slug, chapter_num, verse_num, text from bible_verses')):
            en[(b, ch)][v] = t
        for b, ch, v, t in c.execute(text('select book_slug, chapter_num, verse_num, text from bible_verses_es')):
            es[(b, ch)][v] = t
    return en, es


def write(plan, es):
    with open(ROLLBACK, 'a') as f:
        for (b, ch) in sorted(plan):
            f.write("delete from bible_verses_es where book_slug='%s' and chapter_num=%d;\n" % (b, ch))
            for v in sorted(es[(b, ch)]):
                t = es[(b, ch)][v].replace("'", "''")
                f.write("insert into bible_verses_es (book_slug, chapter_num, verse_num, text) "
                        "values ('%s', %d, %d, '%s');\n" % (b, ch, v, t))
    with engine.begin() as c:
        for (b, ch), mapping in plan.items():
            c.execute(text('delete from bible_verses_es where book_slug=:b and chapter_num=:c'),
                      {'b': b, 'c': ch})
            for v, nv in sorted(mapping.items()):
                c.execute(text('insert into bible_verses_es (book_slug, chapter_num, verse_num, text) '
                               'values (:b, :c, :v, :t)'),
                          {'b': b, 'c': ch, 'v': nv, 't': es[(b, ch)][v]})


def main():
    en, es = load()

    print('=== phase 1: verified mappings ===')
    plan = {}
    for key, rules in sorted(RULES.items()):
        S, E = es.get(key, {}), en.get(key, {})
        if not S or not E:
            print('  %-16s %3d   MISSING from one table, skipped' % key)
            continue
        mapping = {v: v + shift_for(v, rules) for v in S}
        newmax, want = max(mapping.values()), max(E)
        tag = 'lands on douay %d' % want if newmax == want else \
              'ends %d, douay ends %d, phase 2 to finish' % (newmax, want)
        if len(set(mapping.values())) != len(mapping):
            print('  %-16s %3d   REFUSED, mapping collides' % key)
            continue
        print('  %-16s %3d   %s' % (key[0], key[1], tag))
        plan[key] = mapping

    if APPLY and plan:
        open(ROLLBACK, 'w').write('-- rollback for fix_es_tail.py\n')
        write(plan, es)
        print('  applied to', len(plan), 'chapters')
        en, es = load()

    print()
    print('=== phase 2: unmarked merge point in what is still one short ===')
    plan2, held = {}, []
    for key in sorted(es):
        S, E = es[key], en.get(key, {})
        if not E:
            continue
        m, n = max(E), max(S)
        if m - n != 1 or sorted(S) != list(range(1, n + 1)):
            continue
        ew = {v: len(t.split()) for v, t in E.items()}
        ea = {v: anchors(t) for v, t in E.items()}
        scores = []
        for p in range(1, n + 1):
            hit = pen = 0.0
            for i in sorted(S):
                rng = [i] if i < p else ([p, p + 1] if i == p else [i + 1])
                if any(r not in E for r in rng):
                    pen += 50
                    continue
                hit += len(anchors(S[i]) & set().union(*(ea[r] for r in rng))) * 10
                pen += abs(len(S[i].split()) - sum(ew[r] for r in rng)) * 0.5
            scores.append((pen - hit, p))
        scores.sort()
        best, second = scores[0], scores[1] if len(scores) > 1 else (1e9, 0)
        if second[0] - best[0] < MARGIN or best[1] == n:
            held.append((key, m, n, best[1], best[0], second[0]))
        else:
            p = best[1]
            plan2[key] = {v: (v if v <= p else v + 1) for v in S}
            print('  %-16s %3d   verse %d covers douay %d and %d' % (key[0], key[1], p, p, p + 1))
    print('  resolved:', len(plan2))
    print()
    print('=== left alone ===')
    for key, m, n, p, b1, b2 in held:
        why = 'merge already at the last verse' if p == n else \
              'no clear merge point, best %.1f vs next %.1f' % (b1, b2)
        print('  %-16s %3d   es ends %3d, douay ends %3d  ->  %s' % (key[0], key[1], n, m, why))

    if APPLY and plan2:
        write(plan2, es)
        print()
        print('  applied to', len(plan2), 'chapters')

    if not APPLY:
        print()
        print('DRY RUN. nothing written. re-run with --apply to write.')
        return

    with engine.connect() as c:
        print()
        print('=== final state ===')
        print('spanish verse rows   :', c.execute(text('select count(*) from bible_verses_es')).scalar())
        print('douay verse rows     :', c.execute(text('select count(*) from bible_verses')).scalar())
        print('books in spanish     :', c.execute(text(
            'select count(distinct book_slug) from bible_verses_es')).scalar())
        rows = c.execute(text('''
            select e.book_slug, e.chapter_num, e.mx, s.mx
              from (select book_slug, chapter_num, max(verse_num) mx from bible_verses group by 1,2) e
              join (select book_slug, chapter_num, max(verse_num) mx from bible_verses_es group by 1,2) s
                on s.book_slug=e.book_slug and s.chapter_num=e.chapter_num
             where s.mx < e.mx order by 1,2''')).all()
        print('chapters ending short:', len(rows))
        for b, ch, m, n in rows:
            print('   %-16s %3d   es %3d, douay %3d' % (b, ch, n, m))
        print()
        print('=== spot check, psalm 50:3 and psalm 101:3 ===')
        for ch, v in [(50, 3), (101, 3)]:
            t = c.execute(text("select text from bible_verses_es where book_slug='psalms' "
                               "and chapter_num=:c and verse_num=:v"), {'c': ch, 'v': v}).scalar()
            print('  %d:%d  %s' % (ch, v, (t or 'MISSING')[:100]))


main()
