"""Align the marker stream onto the known expected verse sequence.

Also repairs the _fx2 fixture, which an escaping bug in the previous
patch wrote as one literal line instead of six.

All or nothing: nothing is written unless every anchor matches once.
"""
import io

src = io.open("parse.py", encoding="utf-8").read()
assert "def align(" not in src, "already applied"

bad = '"1. uno\\\\n2. dos\\\\n3. tres\\\\n1. uno\\\\n2. dos\\\\n1. uno\\\\n"'
good = '"1. uno\\n2. dos\\n3. tres\\n1. uno\\n2. dos\\n1. uno\\n"'
assert src.count(bad) == 1, "fixture anchor matched %d times" % src.count(bad)
src = src.replace(bad, good)

ADD = '''

def expected_verses(exp_path):
    """[(slug, chapter, verse), ...] for all 5849 verses, in order."""
    out = []
    for slug, ch, mx, n in expected_list(exp_path):
        out.extend((slug, ch, v) for v in range(1, mx + 1))
    return out


def align(marks, want, look=8):
    """Match the observed marker stream onto the expected verse stream.

    Segmenting on the verse reset alone believes every number it sees,
    and the OCR invents them: 6262 markers for 5849 verses, splitting
    Genesis 1 into runs of 1, 6, 2, 22 and 1 where there are 31 verses.

    But the 187 chapter lengths are already known from the database, so
    the expected sequence of verse numbers is known in full. That makes
    this an alignment, not a guess. Walking the expected sequence and
    taking the next observed marker that carries the right number skips
    invented markers instead of breaking a chapter on them, and leaves
    a genuinely missing verse recorded as missing.

    Returns [(slug, chapter, verse, marker_index_or_None), ...].
    """
    out, j = [], 0
    for slug, ch, v in want:
        hit = None
        for d in range(min(look, len(marks) - j)):
            if marks[j + d][1] == v:
                hit = j + d
                break
        if hit is None:
            out.append((slug, ch, v, None))
        else:
            out.append((slug, ch, v, hit))
            j = hit + 1
    return out


def alignreport(body, exp_path):
    lines, marks = markers(body)
    want = expected_verses(exp_path)
    got = align(marks, want)
    hit = [g for g in got if g[3] is not None]
    print("markers in text:  %d" % len(marks))
    print("verses expected:  %d" % len(want))
    print("verses located:   %d  (%.1f%%)"
          % (len(hit), 100.0 * len(hit) / max(1, len(want))))
    print("markers unused:   %d" % (len(marks) - len(hit)))

    per = {}
    for slug, ch, v, idx in got:
        d = per.setdefault((slug, ch), [0, 0])
        d[1] += 1
        if idx is not None:
            d[0] += 1
    whole = [k for k, (h, n) in per.items() if h == n]
    print("chapters fully located: %d of %d" % (len(whole), len(per)))

    print("\\nworst 15 chapters:")
    for (slug, ch), (h, n) in sorted(per.items(),
                                     key=lambda kv: kv[1][0] - kv[1][1])[:15]:
        print("  %-13s %3d  %3d of %3d" % (slug, ch, h, n))
    return 0
'''

anchor = "\n\nFIXTURE ="
assert src.count(anchor) == 1
src = src.replace(anchor, ADD + anchor)

old = '''    if a[0] == "seq" and len(a) >= 3:
        return seqreport(a[1], a[2])'''
assert src.count(old) == 1
src = src.replace(old, '''    if a[0] == "seq" and len(a) >= 3:
        return seqreport(a[1], a[2])
    if a[0] == "align" and len(a) >= 3:
        return alignreport(a[1], a[2])''')

old = '''    ck("boundaries found with no headings present",
       [len(sg) for sg in segments(m2)], [3, 2, 1])'''
assert src.count(old) == 1
src = src.replace(old, '''    ck("boundaries found with no headings present",
       [len(sg) for sg in segments(m2)], [3, 2, 1])

    # Alignment must survive invented markers. This stream carries the
    # real 1..5 of a chapter with three spurious low numbers dropped in,
    # exactly what split Genesis 1 into five pieces.
    noisy = [(0, 1), (1, 2), (2, 1), (3, 3), (4, 2), (5, 4), (6, 5), (7, 1)]
    want = [("genesis", 1, v) for v in range(1, 6)] + [("genesis", 2, 1)]
    res = align(noisy, want)
    ck("every expected verse located despite the noise",
       [i is not None for *_, i in res], [True] * 6)
    ck("alignment picks the right markers",
       [i for *_, i in res], [0, 1, 3, 5, 6, 7])
    # A verse the OCR lost entirely must read as missing, not steal the
    # next verse's marker.
    gone = [(0, 1), (1, 2), (2, 4)]
    res2 = align(gone, [("genesis", 1, v) for v in range(1, 5)], look=2)
    ck("a lost verse reads as missing",
       [i for *_, i in res2], [0, 1, None, 2])''')

io.open("parse.py", "w", encoding="utf-8").write(src)
print("patched")
