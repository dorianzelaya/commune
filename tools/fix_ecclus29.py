"""Eclesiastico 29 is the one chapter left with a hole in it.

Torres Amat groups verses 16, 17 and 18 into a single sentence, so the
inline markers jump from 15 to 18 and the split reproduced that jump. Every
other chapter in the Spanish Bible numbers consecutively from 1, which is
this edition's own convention, so this one closes the gap: what was 18
becomes 16 and the rest of the chapter follows, ending at 33 instead of 35.

No text changes. Only the numbers after verse 15 move, each down by two.
"""
from sqlalchemy import text
from database import engine

ROLLBACK = '/Users/dorianzelaya/catholic-companion/tools/ecclus29_rollback.sql'

with engine.connect() as c:
    rows = c.execute(text("select verse_num, text from bible_verses_es "
                          "where book_slug='ecclesiasticus' and chapter_num=29 "
                          "order by verse_num")).all()

print('before: %d rows, %d..%d' % (len(rows), rows[0][0], rows[-1][0]))
have = {v for v, _ in rows}
print('missing numbers:', [n for n in range(1, rows[-1][0] + 1) if n not in have])

with open(ROLLBACK, 'w') as f:
    f.write('-- rollback for fix_ecclus29.py\n')
    f.write("delete from bible_verses_es where book_slug='ecclesiasticus' and chapter_num=29;\n")
    for v, t in rows:
        f.write("insert into bible_verses_es (book_slug, chapter_num, verse_num, text) "
                "values ('ecclesiasticus', 29, %d, '%s');\n" % (v, t.replace("'", "''")))
print('rollback written to', ROLLBACK)

renum = [(v if v <= 15 else v - 2, t) for v, t in rows]
nums = [v for v, _ in renum]
assert nums == list(range(1, len(nums) + 1)), 'renumbering is not consecutive: %s' % nums[:40]

with engine.begin() as c:
    c.execute(text("delete from bible_verses_es where book_slug='ecclesiasticus' and chapter_num=29"))
    for v, t in renum:
        c.execute(text("insert into bible_verses_es (book_slug, chapter_num, verse_num, text) "
                       "values ('ecclesiasticus', 29, :v, :t)"), {'v': v, 't': t})

with engine.connect() as c:
    after = c.execute(text("select verse_num, text from bible_verses_es "
                           "where book_slug='ecclesiasticus' and chapter_num=29 "
                           "order by verse_num")).all()
    print()
    print('after: %d rows, %d..%d' % (len(after), after[0][0], after[-1][0]))
    for v, t in after:
        if 13 <= v <= 18:
            print('  %2d  %s' % (v, t[:92]))
    print()
    holes = c.execute(text('''
        select book_slug, chapter_num, count(*), max(verse_num) from bible_verses_es
         group by 1,2 having count(*) <> max(verse_num) or min(verse_num) <> 1''')).all()
    print('chapters anywhere with a hole or not starting at 1:', len(holes))
    for h in holes:
        print('  ', h)
