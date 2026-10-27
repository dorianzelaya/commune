"""Undo the verse-number shifts, keep the verse splits.

Splitting Torres Amat's merged blocks was right: it recovered 1,137 verses
that existed only inside other verses, 2 Macabeos 12:46 among them, and the
result numbers consecutively because the inline markers do.

Shifting verse numbers to match the Douay was wrong. The module carries no
superscription text, so aligning a psalm to Douay numbering leaves verse 1
with nothing in it, and 56 psalms ended up starting at verse 2 with Salmo 50
starting at 3. The same applies to Ageo 2, Eclesiastes 7, Jonas 2 and
Numeros 13, and the mid-chapter merge points left holes like Josue 4:24.
Torres Amat numbers consecutively from 1 and that is what a Spanish reader
expects, so its own numbering stands.

This replays the rollback files the shift scripts wrote.
"""
import os
import re
import sys
from sqlalchemy import text
from database import engine

APPLY = '--apply' in sys.argv
FILES = [
    '/Users/dorianzelaya/catholic-companion/tools/psalm_rollback.sql',
    '/Users/dorianzelaya/catholic-companion/tools/merge_rollback.sql',
    '/Users/dorianzelaya/catholic-companion/tools/tail_rollback.sql',
]


def main():
    stmts = []
    for path in FILES:
        if not os.path.exists(path):
            print('MISSING:', path)
            return
        with open(path) as f:
            body = f.read()
        n = 0
        for line in body.splitlines():
            line = line.strip()
            if not line or line.startswith('--'):
                continue
            stmts.append(line)
            n += 1
        dels = len(re.findall(r'^delete ', body, re.M))
        print('%-52s %5d statements, %3d chapters' % (os.path.basename(path), n, dels))

    print()
    print('total statements:', len(stmts))

    with engine.connect() as c:
        print()
        print('=== before ===')
        print('chapters not starting at verse 1:', c.execute(text('''
            select count(*) from (select book_slug, chapter_num from bible_verses_es
              group by 1,2 having min(verse_num) > 1) x''')).scalar())
        print('spanish verse rows              :', c.execute(text(
            'select count(*) from bible_verses_es')).scalar())

    if not APPLY:
        print()
        print('DRY RUN. nothing written. re-run with --apply to write.')
        return

    with engine.begin() as c:
        for s in stmts:
            c.execute(text(s))

    with engine.connect() as c:
        print()
        print('=== after ===')
        print('spanish verse rows              :', c.execute(text(
            'select count(*) from bible_verses_es')).scalar())
        bad = c.execute(text('''
            select book_slug, chapter_num, min(verse_num) from bible_verses_es
              group by 1,2 having min(verse_num) > 1 order by 1,2''')).all()
        print('chapters not starting at verse 1:', len(bad))
        for b, ch, mn in bad:
            print('   %-16s %3d starts at %d' % (b, ch, mn))
        print()
        print('=== holes left inside chapters, which are Torres Amat groupings ===')
        holes = c.execute(text('''
            select book_slug, chapter_num, count(*) n, max(verse_num) mx
              from bible_verses_es group by 1,2 having count(*) <> max(verse_num)
             order by 1,2''')).all()
        for b, ch, n, mx in holes:
            print('   %-16s %3d  %3d rows, runs to %3d' % (b, ch, n, mx))
        print('   total:', len(holes))
        print()
        print('=== spot checks ===')
        for b, ch, lo, hi in [('psalms', 50, 1, 3), ('josue', 4, 23, 25),
                              ('jonas', 2, 1, 2), ('2-machabees', 12, 37, 38)]:
            print('  %s %d' % (b, ch))
            for v, t in c.execute(text('select verse_num, text from bible_verses_es '
                                       'where book_slug=:b and chapter_num=:c '
                                       'and verse_num between :lo and :hi order by verse_num'),
                                  {'b': b, 'c': ch, 'lo': lo, 'hi': hi}):
                print('    %2d  %s' % (v, t[:92]))


main()
