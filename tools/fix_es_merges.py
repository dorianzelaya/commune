"""A chapter one verse short of the Douay, with no inline markers, means two
Douay verses were merged into one Spanish verse somewhere inside it. The
chapter is correct up to that point and one number low after it.

Shifting the whole chapter would be wrong, so this locates the merge point.
For every candidate position p it maps Spanish 1..p-1 onto Douay 1..p-1,
Spanish p onto Douay p and p+1, and the rest onto p+2..m, then scores the
mapping by shared proper names and numerals, with word counts as tie-break.
A chapter is renumbered only when the best position beats every other by a
clear margin; otherwise it is listed and left alone.

Where the Douay's last verse is simply absent because Torres Amat opens the
next chapter with it (Marcos 8:39 is its 9:1), no position scores well and
the chapter is correctly left alone.
"""
import re
import sys
import unicodedata
from collections import defaultdict
from sqlalchemy import text
from database import engine

APPLY = '--apply' in sys.argv
ROLLBACK = '/Users/dorianzelaya/catholic-companion/tools/merge_rollback.sql'
MARGIN = 6.0


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


def main():
    with engine.connect() as c:
        en, es = defaultdict(dict), defaultdict(dict)
        for b, ch, v, t in c.execute(text('select book_slug, chapter_num, verse_num, text from bible_verses')):
            en[(b, ch)][v] = t
        for b, ch, v, t in c.execute(text('select book_slug, chapter_num, verse_num, text from bible_verses_es')):
            es[(b, ch)][v] = t

    plan, held = {}, []
    for key in sorted(es):
        if key[0] == 'psalms':
            continue
        E, S = en.get(key, {}), es[key]
        if not E:
            continue
        m, n = max(E), max(S)
        if m <= n:
            continue
        if m - n != 1 or sorted(S) != list(range(1, n + 1)):
            held.append((key, m, n, 'gap of %d, not a single merge' % (m - n)))
            continue

        ew = {v: len(t.split()) for v, t in E.items()}
        ea = {v: anchors(t) for v, t in E.items()}
        scores = []
        for p in range(1, n + 1):
            hit = pen = 0.0
            for i in sorted(S):
                if i < p:
                    rng = [i]
                elif i == p:
                    rng = [p, p + 1]
                else:
                    rng = [i + 1]
                if any(r not in E for r in rng):
                    pen += 50
                    continue
                a = anchors(S[i])
                b = set().union(*(ea[r] for r in rng))
                hit += len(a & b) * 10
                pen += abs(len(S[i].split()) - sum(ew[r] for r in rng)) * 0.5
            scores.append((pen - hit, p))
        scores.sort()
        best, second = scores[0], scores[1] if len(scores) > 1 else (1e9, 0)
        if second[0] - best[0] < MARGIN:
            held.append((key, m, n, 'merge point unclear, best p=%d cost %.1f vs next %.1f'
                         % (best[1], best[0], second[0])))
        else:
            plan[key] = best[1]

    print('=== chapters to renumber, with the merge point found ===')
    for key, p in sorted(plan.items()):
        print('  %-22s %3d   spanish verse %d covers douay %d and %d' % (key[0], key[1], p, p, p + 1))
    print('  total:', len(plan))
    print()
    print('=== left alone ===')
    for key, m, n, why in held:
        print('  %-22s %3d   es ends %3d, douay ends %3d  ->  %s' % (key[0], key[1], n, m, why))
    print('  total:', len(held))

    if not plan:
        return
    if not APPLY:
        print()
        print('DRY RUN. nothing written. re-run with --apply to write.')
        return

    with open(ROLLBACK, 'w') as f:
        f.write('-- rollback for fix_es_merges.py\n')
        for (b, ch) in sorted(plan):
            f.write("delete from bible_verses_es where book_slug='%s' and chapter_num=%d;\n" % (b, ch))
            for v in sorted(es[(b, ch)]):
                t = es[(b, ch)][v].replace("'", "''")
                f.write("insert into bible_verses_es (book_slug, chapter_num, verse_num, text) "
                        "values ('%s', %d, %d, '%s');\n" % (b, ch, v, t))
    print()
    print('rollback written to', ROLLBACK)

    with engine.begin() as c:
        for (b, ch), p in plan.items():
            S = es[(b, ch)]
            c.execute(text('delete from bible_verses_es where book_slug=:b and chapter_num=:c'),
                      {'b': b, 'c': ch})
            for v in sorted(S):
                nv = v if v <= p else v + 1
                c.execute(text('insert into bible_verses_es (book_slug, chapter_num, verse_num, text) '
                               'values (:b, :c, :v, :t)'),
                          {'b': b, 'c': ch, 'v': nv, 't': S[v]})
    print('applied to', len(plan), 'chapters')

    with engine.connect() as c:
        print()
        print('=== final state ===')
        print('spanish verse rows        :', c.execute(text('select count(*) from bible_verses_es')).scalar())
        print('english verse rows        :', c.execute(text('select count(*) from bible_verses')).scalar())
        print('chapters ending short     :', c.execute(text('''
            select count(*) from
              (select book_slug, chapter_num, max(verse_num) mx from bible_verses group by 1,2) e
              join (select book_slug, chapter_num, max(verse_num) mx from bible_verses_es group by 1,2) s
                on s.book_slug=e.book_slug and s.chapter_num=e.chapter_num
             where s.mx < e.mx''')).scalar())
        print('books present in spanish  :', c.execute(text(
            'select count(distinct book_slug) from bible_verses_es')).scalar())
        print()
        print('=== spot check: Josue 4 around the merge ===')
        for v, t in c.execute(text("select verse_num, text from bible_verses_es "
                                   "where book_slug='josue' and chapter_num=4 and verse_num>=23 "
                                   "order by verse_num")):
            print('  %2d  %s' % (v, t[:90]))


main()
