"""Drop two-line blobs and stop the line-clustering reference drifting.

On the Genesis 2 page the median word box is 20px tall and the worst
boxes are 50 to 57 -- two print lines. Tesseract produces those when
glyphs from adjacent lines touch. Such a box has its centre BETWEEN the
lines, so it chains them into one group, which then sorts by x and
interleaves: "raiso, 11. rio Uno que se desde llama alli Phison" out of
Genesis 2:10 and 2:11. The verse marker opening the second line is
destroyed with it, which is a large part of why only 24117 markers were
found for 35856 verses.

All or nothing: nothing is written unless every anchor matches once.
"""
import io

src = io.open("amat.py", encoding="utf-8").read()
assert "2.0 * h]" not in src, "already applied"


def sub(old, new):
    global src
    assert src.count(old) == 1, "anchor matched %d times: %r" % (
        src.count(old), old[:56])
    src = src.replace(old, new)


sub('''    h = statistics.median(b[3] - b[1] for b, _, _ in words) or 1
    ws = sorted(words, key=lambda p: ((p[0][1] + p[0][3]) / 2, p[0][0]))
    groups, cur, ref = [], [], None
    for box, text, size in ws:
        c = (box[1] + box[3]) / 2
        if ref is None or abs(c - ref) <= 0.6 * h:
            cur.append((box[0], box[1], text, size))
            ref = c if ref is None else (ref + c) / 2
        else:
            groups.append(cur)
            cur, ref = [(box[0], box[1], text, size)], c''',
'''    h = statistics.median(b[3] - b[1] for b, _, _ in words) or 1

    # Boxes far taller than the median are not words but blobs spanning
    # two print lines, and no centre threshold can survive a box that
    # genuinely covers both. They are dropped.
    keep = [w for w in words if (w[0][3] - w[0][1]) <= 2.0 * h]
    if not keep:
        return []

    ws = sorted(keep, key=lambda p: ((p[0][1] + p[0][3]) / 2, p[0][0]))
    groups, cur, base = [], [], None
    for box, text, size in ws:
        c = (box[1] + box[3]) / 2
        # Compared against the group's FIRST centre, not a running mean
        # of it: word centres inside one printed line vary by a few
        # pixels, a running mean walks with them, and after enough small
        # steps it reaches the next line and swallows it.
        if base is None or abs(c - base) <= 0.6 * h:
            cur.append((box[0], box[1], text, size))
            if base is None:
                base = c
        else:
            groups.append(cur)
            cur, base = [(box[0], box[1], text, size)], c''')

sub('''    ck("one printed row stays one line",''',
'''    blob = []
    for yy, row in ((600, "uno dos tres"), (634, "cuatro cinco seis")):
        x = 200
        for t in row.split():
            blob.append(((x, yy, x + 18 * len(t), yy + 20), t, 20))
            x += 18 * len(t) + 12
    blob.append(((900, 600, 980, 654), "BLOB", 20))
    bl = build_lines(blob)
    ck("a two-line blob does not weld the lines",
       any("uno" in l["text"] and "cuatro" in l["text"] for l in bl), False)
    ck("both printed lines survive it", len(bl), 2)

    ck("one printed row stays one line",''')

io.open("amat.py", "w", encoding="utf-8").write(src)
print("patched")
