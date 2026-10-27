"""Torres Amat merges consecutive verses into one block and keeps the verse
numbers inline: 2 Macabeos 12:38 carries '39. ... 40. ... 46. ...' in its text.
This splits those back into real rows so Spanish verse numbers match the Douay.

A block is only split when its inline markers run in strict sequence from
verse_num+1. Anything else is reported and left alone: a lone '28.' in a
narrative verse is a number, not a marker.

Three things this file has to get right, all learned the hard way:

  'id' is excluded from the insert. Every piece of a split block comes from
  the same parent row, so reusing the parent's id inserts duplicates.

  A touched chapter is rebuilt from ALL its rows, not just the split pieces.
  The write deletes the chapter first, so a partial rebuild silently drops
  every verse before the split block.

  A repeated or missing-from-the-start verse number is a bug and blocks the
  write. A GAP is not: Torres Amat really does group Eclesiastico 29:16-18
  into one sentence, so 16 and 17 have no independent text. Gaps are listed
  and allowed.
"""
import re
import sys
from collections import defaultdict
from sqlalchemy import text
from database import engine

MARK = re.compile(r'(?:(?<=\s)|^)(\d{1,3})\.\s')
APPLY = '--apply' in sys.argv


def cols(c):
    rs = c.execute(text("select column_name from information_schema.columns "
                        "where table_name='bible_verses_es' order by ordinal_position"))
    return [r[0] for r in rs]


def main():
    with engine.connect() as c:
        names = cols(c)
        rows = c.execute(text('select %s from bible_verses_es order by book_slug, chapter_num, verse_num'
                              % ', '.join(names))).all()
        enmax = {(b, ch): mx for b, ch, mx in
                 c.execute(text('select book_slug, chapter_num, max(verse_num) from bible_verses group by 1,2'))}

    ix = {n: i for i, n in enumerate(names)}
    iv, it, ib, ic = ix['verse_num'], ix['text'], ix['book_slug'], ix['chapter_num']
    ins = [n for n in names if n != 'id']

    by_ch = defaultdict(list)
    for r in rows:
        by_ch[(r[ib], r[ic])].append(r)

    rebuilt = {}
    blocks = produced = 0
    skipped, empty = [], []

    for key, chap in by_ch.items():
        out, hit = [], False
        for r in chap:
            t = r[it]
            ms = list(MARK.finditer(t))
            v = r[iv]
            nums = [int(m.group(1)) for m in ms]
            if not ms or nums != list(range(v + 1, v + 1 + len(nums))):
                if ms:
                    skipped.append((r[ib], r[ic], v, nums[:10]))
                out.append(list(r))
                continue
            pieces = [(v, t[:ms[0].start()])]
            for i, m in enumerate(ms):
                end = ms[i + 1].start() if i + 1 < len(ms) else len(t)
                pieces.append((nums[i], t[m.end():end]))
            if [n for n, s in pieces if not s.strip()]:
                empty.append((r[ib], r[ic], v))
                out.append(list(r))
                continue
            hit = True
            blocks += 1
            for n, s in pieces:
                row = list(r)
                row[iv] = n
                row[it] = s.strip()
                out.append(row)
                produced += 1
        if hit:
            rebuilt[key] = out

    print('blocks split              :', blocks)
    print('rows produced from them   :', produced)
    print('chapters touched          :', len(rebuilt))
    print('rows in rebuilt chapters  :', sum(len(v) for v in rebuilt.values()))
    print('skipped, markers out of sequence:', len(skipped))
    for s in skipped:
        print('   ', s)
    print('skipped, empty segment    :', len(empty))
    for s in empty:
        print('   ', s)

    print()
    print('=== do touched chapters now end where the Douay ends? ===')
    off = 0
    for (b, ch), g in sorted(rebuilt.items()):
        mx = max(p[iv] for p in g)
        want = enmax.get((b, ch))
        if want is not None and mx != want:
            off += 1
            print('   %-16s %3d   ends %3d, Douay ends %3d' % (b, ch, mx, want))
    print('chapters not matching the Douay:', off, 'of', len(rebuilt))

    print()
    print('=== gaps, allowed: Torres Amat groups some verses into one sentence ===')
    for (b, ch), g in sorted(rebuilt.items()):
        ns = sorted(p[iv] for p in g)
        miss = [n for n in range(1, ns[-1] + 1) if n not in set(ns)]
        if miss:
            print('   %-16s %3d  %d rows, 1..%d, no text for %s' % (b, ch, len(ns), ns[-1], miss))

    print()
    print('=== integrity: no repeated numbers, every chapter starts at 1 ===')
    bad = 0
    for (b, ch), g in sorted(rebuilt.items()):
        ns = sorted(p[iv] for p in g)
        rep = sorted(n for n in set(ns) if ns.count(n) > 1)
        if rep or ns[0] != 1:
            bad += 1
            print('   %-16s %3d  starts %d%s' % (b, ch, ns[0], '  repeats ' + str(rep) if rep else ''))
    print('chapters failing integrity:', bad)

    print()
    print('=== sample: 1 Macabeos 1, first and last rows after rebuild ===')
    g = sorted(rebuilt[('1-machabees', 1)], key=lambda p: p[iv])
    for row in g[:2] + g[-2:]:
        print('  %3d  %s' % (row[iv], row[it][:95]))

    if bad:
        print()
        print('REFUSING to write: integrity checks failed above.')
        return

    if not APPLY:
        print()
        print('DRY RUN. nothing written. re-run with --apply to write.')
        return

    with engine.begin() as c:
        for (b, ch), g in rebuilt.items():
            c.execute(text('delete from bible_verses_es where book_slug=:b and chapter_num=:c'),
                      {'b': b, 'c': ch})
            for row in g:
                c.execute(text('insert into bible_verses_es (%s) values (%s)'
                               % (', '.join(ins), ', '.join(':' + n for n in ins))),
                          {n: row[ix[n]] for n in ins})
    print()
    print('written.')
    with engine.connect() as c:
        print('Spanish verse rows now :', c.execute(text('select count(*) from bible_verses_es')).scalar())
        print('chapters still shorter than the Douay:',
              c.execute(text('''select count(*) from
                 (select book_slug, chapter_num, max(verse_num) mx from bible_verses group by 1,2) e
                 left join (select book_slug, chapter_num, max(verse_num) mx from bible_verses_es group by 1,2) s
                   on s.book_slug=e.book_slug and s.chapter_num=e.chapter_num
                 where coalesce(s.mx,0) < e.mx''')).scalar())


main()
