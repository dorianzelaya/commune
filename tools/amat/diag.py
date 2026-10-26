"""Which footnote lines survive, and why the rule let them through."""
import re, statistics, sys
sys.path.insert(0, ".")
import amat

# "Y" is the Spanish word "and", so it opens plenty of BODY lines. A
# cross-reference note starting with Y is followed by an abbreviation
# ("Y Eccl. XXXIX"), never by a verse number ("Y 37. Jacob pues") nor by
# an ordinary capitalised word.
# "^digits space lowercase" is GONE. It cannot distinguish a note
# ("10 del orígen del mundo") from a body verse whose period the OCR
# dropped ("3 las varas estaban intactas"). Same shape, so it scored
# body text as footnotes on pages 43, 50 and 54. What is left only
# matches things that cannot be body: marker glyphs, chapter-and-verse
# citations, and the index cross-references.
NOTEY = re.compile(r"^[*%$¥°+] [A-Z0-9]|^Y [A-Z][a-z]{0,4}\.|"
                   r"Cap\. [IVXL]|[IVXL]{2,},? ?v\.|"
                   r"Animales dom|Véase")


def report(lines, height):
    ys = [l["y"] for l in lines]
    pitch = amat.line_pitch(ys) or 1
    sizes = [l["size"] for l in lines if l["size"]]
    top = [l["size"] for l in lines[:6] if l["size"]]
    print("    pitch %d, gap needed %.0f, min_drop 3.0, "
          "column median size %.1f vs first-6 %.1f"
          % (pitch, pitch * 1.7,
             statistics.median(sizes) if sizes else 0,
             statistics.mean(top) if top else 0))
    shown = 0
    for i in range(1, len(lines)):
        gap = ys[i] - ys[i - 1]
        if gap < pitch * 1.7 or ys[i] <= height * 0.30:
            continue
        before = [l["size"] for l in lines[max(0, i - 6):i] if l["size"]]
        after = [l["size"] for l in lines[i:i + 6] if l["size"]]
        if not before or not after:
            continue
        drop = statistics.mean(before) - statistics.mean(after)
        shown += 1
        if shown <= 5:
            print("    y=%4d gap=%3d drop=%5.1f %s"
                  % (ys[i], gap, drop, "<= FIRST CONFIRMED" if drop >= 3.0 else ""))
        if drop >= 3.0:
            return
    if shown == 0:
        print("    NO candidate gaps at all below y=%.0f" % (height * 0.30))


def main(path):
    pages = amat.read_pages(path)
    bad, shown, nocut = 0, 0, 0
    for idx, (pb, words) in enumerate(pages):
        height = (pb[3] - pb[1]) or 1
        g = amat.find_gutter(words, pb[2] or 1)
        cols = ([words] if g is None else
                [[w for w in words if (w[0][0] + w[0][2]) / 2 < g],
                 [w for w in words if (w[0][0] + w[0][2]) / 2 >= g]])
        for ci, col in enumerate(cols):
            lines = amat.build_lines(col)
            lines = lines[amat.head_lines(lines, height):]
            cut = amat.note_start(lines, height)
            kept = lines[:cut] if cut is not None else lines
            hits = [l for l in kept if NOTEY.search(l["text"])]
            if not hits:
                continue
            bad += len(hits)
            shown += 1
            if cut is None:
                nocut += 1
            if shown > 10:
                continue
            first = hits[0]
            print("page %3d col %d  lines %3d  gutter %s  note_start %s"
                  % (idx, ci, len(lines), "yes" if g else "NO ", cut))
            print("    survivor at y=%d (%.2f of page): %s"
                  % (first["y"], first["y"] / height, first["text"][:64]))
            report(lines, height)
    print("\ncolumns with survivors: %d  (of which no cut at all: %d)"
          % (shown, nocut))
    print("surviving note-looking lines: %d" % bad)


main(sys.argv[1])
