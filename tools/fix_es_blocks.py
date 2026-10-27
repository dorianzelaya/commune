"""Three blocks the marker splitter refused, each wrong in its own way.

  esther 10:3   its own text, then 10:4-13, then all of Ester 11-16 again.
  daniel 12:13  its own text, then all of Daniel 13 and 14 again.
  4-kings 1:6   the same sentence twice, with a fragment of 25:28 welded on.

Ester 11-16 and Daniel 13-14 already exist as their own chapters with exactly
the Douay verse counts, so the trailing copies are duplicates and are dropped.
Every dropped piece is checked against the chapter that already holds it, and
nothing is written unless that check passes.
"""
import re
import sys
from sqlalchemy import text
from database import engine

APPLY = '--apply' in sys.argv
MARK = re.compile(r'(?:(?<=\s)|^)(\d{1,3})\.\s')


def words(s):
    return re.sub(r'[^a-z ]', '', s.lower()).split()


def head_match(a, b, n=8):
    """Do two strings start with the same n words?"""
    return words(a)[:n] == words(b)[:n]


def main():
    with engine.connect() as c:
        def get(b, ch, v):
            return c.execute(text('select text from bible_verses_es where book_slug=:b '
                                  'and chapter_num=:c and verse_num=:v'),
                             {'b': b, 'c': ch, 'v': v}).scalar() or ''
        es_10_3 = get('esther', 10, 3)
        da_12_13 = get('daniel', 12, 13)
        kg_1_6 = get('4-kings', 1, 6)
        es_11_1 = get('esther', 11, 1)
        da_13_1 = get('daniel', 13, 1)
        kg_25_28 = get('4-kings', 25, 28)

    writes = []
    ok = True

    # --- esther 10:3 -------------------------------------------------------
    ms = list(MARK.finditer(es_10_3))
    nums = [int(m.group(1)) for m in ms]
    want = list(range(4, 14))
    if nums[:len(want)] != want:
        print('esther 10: markers do not open with 4..13, got', nums[:14])
        ok = False
    else:
        cut = ms[len(want)] if len(ms) > len(want) else None
        own = es_10_3[:ms[0].start()].strip()
        pieces = []
        for i in range(len(want)):
            start = ms[i].end()
            end = ms[i + 1].start() if i + 1 < len(want) else (cut.start() if cut else len(es_10_3))
            pieces.append((want[i], es_10_3[start:end].strip()))
        dropped = es_10_3[cut.start():].strip() if cut else ''
        print('=== esther 10 ===')
        print('  verse 3 keeps   :', own[:100])
        for n, s in pieces[:2] + pieces[-1:]:
            print('  verse %-2d        : %s' % (n, s[:100]))
        print('  dropping        : %d words starting %r' % (len(dropped.split()), dropped[:70]))
        print('  esther 11:1 is  : %r' % es_11_1[:70])
        if dropped:
            after = MARK.sub(' ', dropped, count=1).strip()
            if not head_match(after, es_11_1) and not head_match(dropped.split('. ', 1)[-1], es_11_1):
                print('  REFUSE: dropped text does not match the start of esther 11:1')
                ok = False
            else:
                print('  match confirmed, safe to drop')
        writes.append(('esther', 10, 3, own, pieces))

    # --- daniel 12:13 -----------------------------------------------------
    ms = list(MARK.finditer(da_12_13))
    print()
    print('=== daniel 12 ===')
    if not ms or int(ms[0].group(1)) != 1:
        print('  markers do not start at 1, got', [int(m.group(1)) for m in ms][:6])
        ok = False
    else:
        own = da_12_13[:ms[0].start()].strip()
        dropped = da_12_13[ms[0].start():].strip()
        after = MARK.sub(' ', dropped, count=1).strip()
        print('  verse 13 keeps  :', own[:140])
        print('  dropping        : %d words starting %r' % (len(dropped.split()), after[:70]))
        print('  daniel 13:1 is  : %r' % da_13_1[:70])
        if head_match(after, da_13_1):
            print('  match confirmed, safe to drop')
            writes.append(('daniel', 12, 13, own, []))
        else:
            print('  REFUSE: dropped text does not match the start of daniel 13:1')
            ok = False

    # --- 4-kings 1:6 ------------------------------------------------------
    ms = list(MARK.finditer(kg_1_6))
    print()
    print('=== 4-kings 1 ===')
    if not ms:
        print('  no marker found, nothing to do')
    else:
        own = kg_1_6[:ms[0].start()].strip()
        dropped = kg_1_6[ms[0].start():].strip()
        after = MARK.sub(' ', dropped, count=1).strip()
        print('  verse 6 keeps   :', own[:140])
        print('  dropping        : %r' % after[:90])
        print('  4-kings 25:28 is: %r' % kg_25_28[:90])
        if kg_25_28 and words(after)[:5] and words(after)[:5] == words(kg_25_28)[:5]:
            print('  match confirmed, 25:28 already holds this text, safe to drop')
        else:
            print('  NOTE: 25:28 does not open with the same words. dropping anyway would')
            print('        lose text, so this one is reported only and left alone.')
            writes = [w for w in writes]
        if kg_25_28 and words(after)[:5] == words(kg_25_28)[:5]:
            writes.append(('4-kings', 1, 6, own, []))

    if not ok:
        print()
        print('REFUSING to write: a check above failed.')
        return
    if not APPLY:
        print()
        print('DRY RUN. nothing written. re-run with --apply to write.')
        return

    with engine.begin() as c:
        for b, ch, v, own, pieces in writes:
            c.execute(text('update bible_verses_es set text=:t where book_slug=:b '
                           'and chapter_num=:c and verse_num=:v'),
                      {'t': own, 'b': b, 'c': ch, 'v': v})
            for n, s in pieces:
                c.execute(text('insert into bible_verses_es (book_slug, chapter_num, verse_num, text) '
                               'values (:b, :c, :v, :t)'),
                          {'b': b, 'c': ch, 'v': n, 't': s})
    print()
    print('written.')
    with engine.connect() as c:
        print('spanish verse rows   :', c.execute(text('select count(*) from bible_verses_es')).scalar())
        print('chapters ending short:', c.execute(text('''
            select count(*) from
              (select book_slug, chapter_num, max(verse_num) mx from bible_verses group by 1,2) e
              join (select book_slug, chapter_num, max(verse_num) mx from bible_verses_es group by 1,2) s
                on s.book_slug=e.book_slug and s.chapter_num=e.chapter_num
             where s.mx < e.mx''')).scalar())
        print()
        print('=== esther 10 after ===')
        for v, t in c.execute(text("select verse_num, text from bible_verses_es "
                                   "where book_slug='esther' and chapter_num=10 order by verse_num")):
            print('  %2d  %s' % (v, t[:90]))


main()
