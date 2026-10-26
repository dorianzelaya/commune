"""Front-matter trim, and alignment that resists noise markers."""
import io

src = io.open("parse.py", encoding="utf-8").read()
assert "def align2(" not in src, "already applied"

ADD = '''

def trim_front(marks, run=6):
    """Drop title-page junk ahead of the first real verse run.

    The first eleven pages are title and preface, and their OCR garbage
    yields marker-shaped lines: "2. 7", "A 2". Those enter the stream
    before the real verse 1 and desynchronise the start, which is why
    Genesis 1 located only 7 of its 31 verses while later chapters did
    far better. Verse text is not that noisy: the real opening is the
    first place where `run` consecutive numbers ascend from 1.
    """
    for i in range(len(marks)):
        if marks[i][1] != 1:
            continue
        nums = [n for _, n in marks[i:i + run]]
        if nums == list(range(1, len(nums) + 1)) and len(nums) == run:
            return marks[i:]
    return marks


def align2(marks, want, look=24, confirm=4):
    """Alignment that will not lock onto an isolated noise number.

    The plain lookahead located 85.4% of verses. Its weakness is that it
    takes the FIRST marker carrying the right number, and the OCR
    sprinkles the stream with marker-shaped junk: 6262 markers for 5846
    verses. A lone "2." inside chapter 1 is indistinguishable from the
    real verse 2 by number alone.

    What distinguishes them is what FOLLOWS. A real verse marker is
    followed, within a few markers, by the next verse number. A noise
    number is not. So a candidate is accepted only when the next
    expected verse also turns up just after it, which lets the search
    look much further ahead without being derailed by junk.

    The last verse of a chapter has no next verse to confirm it, so it
    falls back to the plain rule.
    """
    out, j = [], 0
    nums = [n for _, n in marks]
    for k, (slug, ch, v) in enumerate(want):
        nxt = want[k + 1][2] if k + 1 < len(want) and want[k + 1][1] == ch else None
        hit = bare = None
        for d in range(min(look, len(nums) - j)):
            if nums[j + d] != v:
                continue
            if bare is None:
                bare = j + d
            if nxt is None or nxt in nums[j + d + 1:j + d + 1 + confirm]:
                hit = j + d
                break
        if hit is None:
            hit = bare
        if hit is None:
            out.append((slug, ch, v, None))
        else:
            out.append((slug, ch, v, hit))
            j = hit + 1
    return out
'''

anchor = "\n\nFIXTURE ="
assert src.count(anchor) == 1
src = src.replace(anchor, ADD + anchor)

old = '''def alignreport(body, exp_path):
    lines, marks = markers(body)
    want = expected_verses(exp_path)
    got = align(marks, want)'''
assert src.count(old) == 1, "alignreport anchor"
src = src.replace(old, '''def alignreport(body, exp_path):
    lines, marks = markers(body)
    kept = trim_front(marks)
    want = expected_verses(exp_path)
    got = align2(kept, want)
    print("front-matter markers dropped: %d" % (len(marks) - len(kept)))
    marks = kept''')

old = '''    ck("a lost verse reads as missing",
       [i for *_, i in res2], [0, 1, None, 2])'''
assert src.count(old) == 1, "selftest anchor"
src = src.replace(old, '''    ck("a lost verse reads as missing",
       [i for *_, i in res2], [0, 1, None, 2])

    # The confirmation rule must do at least as well as the plain one
    # on the same streams, and must still report a lost verse as lost
    # rather than stealing the next verse's marker.
    ck("confirming alignment handles the noise",
       [i for *_, i in align2(noisy, want)], [0, 1, 3, 5, 6, 7])
    ck("confirming alignment reports a lost verse",
       [i for *_, i in align2(gone, [("genesis", 1, v) for v in range(1, 5)])],
       [0, 1, None, 2])
    # Title-page junk ahead of the real opening must be discarded, which
    # is what cost Genesis 1 most of its verses.
    ck("front matter markers trimmed",
       trim_front([(0, 2), (1, 7), (2, 1), (3, 1), (4, 2), (5, 3),
                   (6, 4), (7, 5), (8, 6)]),
       [(3, 1), (4, 2), (5, 3), (6, 4), (7, 5), (8, 6)])
    ck("a clean stream is left alone",
       trim_front([(i, i + 1) for i in range(8)]),
       [(i, i + 1) for i in range(8)])''')

io.open("parse.py", "w", encoding="utf-8").write(src)
print("align2 patched")
