"""Measure the gutter once per book instead of guessing it per page.

Per-page detection fails silently on dense pages, and the failure is
destructive: with no gutter found, every word on the page goes into one
group, so words at the same height in the left and right columns
interleave into one line. That produced "rio Uno que se desde llama
allí Phison: se dividia y es en el" out of two separate verses, and a
welded line loses the verse marker that should have opened it. On the
whole-Bible scan 101 of 963 pages failed detection.

All or nothing: nothing is written unless every anchor matches once.
"""
import io

src = io.open("amat.py", encoding="utf-8").read()
assert "def book_gutter(" not in src, "already applied"


def sub(old, new):
    global src
    assert src.count(old) == 1, "anchor matched %d times: %r" % (
        src.count(old), old[:56])
    src = src.replace(old, new)


sub("def page_body(page, drop_notes=True):", '''def book_gutter(pages, lo=0.35, hi=0.65):
    """The gutter position shared by the whole book, as a page fraction.

    A printed book does not move its gutter from page to page, so the
    pages where detection IS confident can speak for the ones where it
    is not: their median gives a position good for every page.
    """
    seen = []
    for (px0, _, px1, _), words in pages:
        g = find_gutter(words, px1 or 1)
        if g is not None and px1:
            frac = g / px1
            if lo < frac < hi:
                seen.append(frac)
    return statistics.median(seen) if seen else None


def page_body(page, drop_notes=True, gutter_frac=None):''')

sub('''    gutter = find_gutter(words, px1 or 1)
    if gutter is None:''', '''    if gutter_frac is not None and px1:
        gutter = gutter_frac * px1
    else:
        gutter = find_gutter(words, px1 or 1)
    if gutter is None:''')

sub('''        keep = "--keep-notes" in a
        pages = read_pages(a[1])
        two = 0
        with open(a[2], "w", encoding="utf-8") as w:
            for p in pages:
                if find_gutter(p[1], p[0][2] or 1) is not None:
                    two += 1
                for line in page_body(p, drop_notes=not keep):
                    w.write(line + "\\n")
                w.write("\\n")
        print("pages %d, two-column %d -> %s" % (len(pages), two, a[2]))''',
'''        keep = "--keep-notes" in a
        pages = read_pages(a[1])
        frac = None if "--per-page" in a else book_gutter(pages)
        two = sum(1 for p in pages
                  if find_gutter(p[1], p[0][2] or 1) is not None)
        with open(a[2], "w", encoding="utf-8") as w:
            for p in pages:
                for line in page_body(p, drop_notes=not keep,
                                      gutter_frac=frac):
                    w.write(line + "\\n")
                w.write("\\n")
        print("pages %d, detected two-column %d, book gutter %s -> %s"
              % (len(pages), two,
                 ("%.3f of width" % frac) if frac else "per page", a[2]))''')

sub('''    ck("full-width page not split", find_gutter(full, W), None)''',
'''    ck("full-width page not split", find_gutter(full, W), None)

    sparse = []
    y = 600
    for li, ri in (("1. uno dos", "9. nueve diez"),
                   ("2. tres cuatro", "10. once doce")):
        x = 200
        for t in li.split():
            sparse.append(((x, y, x + 20 * len(t), y + BODY), t, BODY))
            x += 20 * len(t) + 14
        x = 1700
        for t in ri.split():
            sparse.append(((x, y, x + 20 * len(t), y + BODY), t, BODY))
            x += 20 * len(t) + 14
        y += 120
    # The real pages that defeat detection cannot be reproduced
    # synthetically, so this does not assert that premise; it asserts
    # that a supplied gutter overrides detection, which the fix needs.
    rescued = page_body(((0, 0, W, H), sparse), gutter_frac=0.45)
    ck("book gutter keeps them apart",
       [l.split(".")[0] for l in rescued], ["1", "2", "9", "10"])
    ck("book gutter leaves no welded line",
       any("9." in l and "1." in l for l in rescued), False)
    # A gutter to the RIGHT of both columns must put everything in one
    # column, which detection would never do. Without this the checks
    # above pass even if the override is ignored, since detection
    # happens to agree with 0.45 on this fixture.
    moved = page_body(((0, 0, W, H), sparse), gutter_frac=0.80)
    ck("a supplied gutter overrides detection",
       any("uno" in l and "nueve" in l for l in moved), True)''')

io.open("amat.py", "w", encoding="utf-8").write(src)
print("patched")
