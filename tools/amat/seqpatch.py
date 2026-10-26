"""Segment chapters on the verse-number reset instead of headings.

All or nothing: nothing is written unless every anchor matches once.
"""
import io

src = io.open("parse.py", encoding="utf-8").read()
assert "def segments(" not in src, "already applied"

ADD = '''

def markers(path):
    """[(line_index, verse_number), ...] in document order."""
    lines = open(path, encoding="utf-8").read().split("\\n")
    out = []
    for i, raw in enumerate(lines):
        m = MARKER.match(STAMP.sub("", raw.rstrip()))
        if m:
            out.append((i, int(m.group(1))))
    return lines, out


def segments(marks):
    """Split the verse-marker stream into chapters at each reset.

    Chapter HEADINGS cannot carry this. On tomo 1 they yield 150
    chapters where there are 187: Genesis alone loses the headings for
    8, 10, 16, 18, 19, 21, 23 and 28, repeats 6, 17, 26, 38 and 46, and
    one junk line reads as the roman numeral 2931.

    Verse numbers can. There are 4519 of them rather than 150, they
    restart at 1 in every chapter, and a reset is visible without
    trusting any single mark: a number that fails to advance ends the
    chapter. A marker the OCR dropped leaves a gap in the run rather
    than a false boundary, and the gap is itself reportable.
    """
    segs, start = [], 0
    for k in range(1, len(marks)):
        if marks[k][1] <= marks[k - 1][1]:
            segs.append(marks[start:k])
            start = k
    if marks:
        segs.append(marks[start:])
    return segs


def seqreport(body, exp_path):
    lines, marks = markers(body)
    segs = segments(marks)
    exp = expected_list(exp_path)
    print("verse markers found: %d" % len(marks))
    print("chapters by reset:   %d    expected: %d" % (len(segs), len(exp)))
    print("expected verses:     %d" % sum(c for *_, c in exp))

    print("\\nsegment lengths, first 60:")
    print("  " + " ".join(str(len(s)) for s in segs[:60]))
    print("expected lengths, first 60:")
    print("  " + " ".join(str(c) for *_, c in exp[:60]))

    short = sum(1 for s in segs if len(s) < 5)
    print("\\nsegments shorter than 5 verses: %d" % short)
    gaps = 0
    for s in segs:
        nums = [n for _, n in s]
        gaps += sum(1 for a, b in zip(nums, nums[1:]) if b != a + 1)
    print("non-consecutive steps inside segments: %d" % gaps)
    return 0
'''

anchor = "\n\nFIXTURE ="
assert src.count(anchor) == 1
src = src.replace(anchor, ADD + anchor)

old = '''    if a[0] == "report" and len(a) >= 3:
        return report(a[1], a[2])'''
assert src.count(old) == 1
src = src.replace(old, '''    if a[0] == "report" and len(a) >= 3:
        return report(a[1], a[2])
    if a[0] == "seq" and len(a) >= 3:
        return seqreport(a[1], a[2])''')

old = '''    ck("front matter dropped", any("TOMO" in t for t in v.values()), False)'''
assert src.count(old) == 1
src = src.replace(old, '''    ck("front matter dropped", any("TOMO" in t for t in v.values()), False)

    _, marks = markers("_fx.txt")
    segs = segments(marks)
    ck("reset rule finds every chapter without a heading",
       [[n for _, n in sg] for sg in segs],
       [[1, 2, 3], [1, 2], [1], [1]])
    # The headings for these would be missing on the real scan; the
    # reset rule must not care.
    open("_fx2.txt", "w", encoding="utf-8").write(
        "1. uno\\\\n2. dos\\\\n3. tres\\\\n1. uno\\\\n2. dos\\\\n1. uno\\\\n")
    _, m2 = markers("_fx2.txt")
    ck("boundaries found with no headings present",
       [len(sg) for sg in segments(m2)], [3, 2, 1])''')

io.open("parse.py", "w", encoding="utf-8").write(src)
print("patched")
