"""Body text out of an Internet Archive hOCR scan.

The flattened _djvu.txt is unusable for a two-column book: Tesseract puts
a left-column line and the right-column line beside it in ONE ocr_line,
so verses from different columns come out welded together. The hOCR has a
bbox per WORD, which turns layout into geometry. Tesseract's own line
grouping is discarded; it is the thing that is wrong.

  usage: amat.py --selftest
         amat.py fetch <archive-id> <out.html>
         amat.py body <hocr-file> <out.txt> [--keep-notes]
"""
import gzip, json, re, statistics, sys, urllib.parse, urllib.request
from collections import defaultdict

BBOX = re.compile(r"bbox (\d+) (\d+) (\d+) (\d+)")
FSIZE = re.compile(r"x_fsize (\d+)")
PAGE = re.compile(r'<div class="ocr_page"[^>]*title="([^"]*)"')
WORD = re.compile(r'<span class="ocrx_word"[^>]*title="([^"]*)"[^>]*>([^<]*)</span>')


def _bbox(t):
    m = BBOX.search(t)
    return tuple(map(int, m.groups())) if m else None


def read_pages(path):
    """[(page_bbox, [(word_bbox, text, font_size), ...]), ...]"""
    op = gzip.open if path.endswith(".gz") else open
    html = op(path, "rt", encoding="utf-8", errors="replace").read()
    return pages_from(html)


def pages_from(html):
    starts = [(m.start(), _bbox(m.group(1))) for m in PAGE.finditer(html)]
    out = []
    for i, (s, pb) in enumerate(starts):
        e = starts[i + 1][0] if i + 1 < len(starts) else len(html)
        ws = []
        for title, text in WORD.findall(html[s:e]):
            text, box = text.strip(), _bbox(title)
            if text and box:
                fs = FSIZE.search(title)
                ws.append((box, text, int(fs.group(1)) if fs else 0))
        if ws and pb:
            out.append((pb, ws))
    return out


def find_gutter(words, page_width, buckets=40, lo=0.30, hi=0.70):
    """x of the column gutter, or None if single column.

    The gutter is the CENTRE OF THE WIDEST empty run in the middle of the
    page. Taking the emptiest single bucket picks the first of several
    empty ones, which lands in the left margin and then drags the last
    word of every left-hand line into the right column. A split is only
    believed when both sides carry real content, so a full-width page is
    never cut down the middle of a sentence.
    """
    if not words:
        return None
    hist = defaultdict(int)
    for (x0, _, x1, _), _, _ in words:
        hist[int(((x0 + x1) / 2) / page_width * buckets)] += 1
    counts = [hist.get(k, 0) for k in range(buckets)]
    quiet = statistics.median([c for c in counts if c] or [0]) * 0.2

    best, run = None, []
    for k in list(range(int(buckets * lo), int(buckets * hi))) + [None]:
        if k is not None and counts[k] <= quiet:
            run.append(k)
            continue
        if run and (best is None or len(run) > len(best)):
            best = run
        run = []
    if not best or len(best) < 2:
        return None

    g = (best[0] + best[-1] + 1) / 2 / buckets * page_width
    left = sum(1 for (x0, _, x1, _), _, _ in words if (x0 + x1) / 2 < g)
    if min(left, len(words) - left) < len(words) * 0.15:
        return None
    return g


def build_lines(words):
    """Words to lines, clustering on vertical centre against the MEASURED
    word height. A fixed pixel bucket splits a line whenever an accent or
    superscript shifts a word's centre, leaving stray one-word lines."""
    if not words:
        return []
    h = statistics.median(b[3] - b[1] for b, _, _ in words) or 1
    ws = sorted(words, key=lambda p: ((p[0][1] + p[0][3]) / 2, p[0][0]))
    groups, cur, ref = [], [], None
    for box, text, size in ws:
        c = (box[1] + box[3]) / 2
        if ref is None or abs(c - ref) <= 0.6 * h:
            cur.append((box[0], box[1], text, size))
            ref = c if ref is None else (ref + c) / 2
        else:
            groups.append(cur)
            cur, ref = [(box[0], box[1], text, size)], c
    if cur:
        groups.append(cur)

    out = []
    for g in groups:
        g.sort()
        sizes = [z for *_, z in g if z]
        out.append({"text": " ".join(t for _, _, t, _ in g),
                    "y": min(y for _, y, _, _ in g),
                    "size": statistics.median(sizes) if sizes else 0})
    return out


def line_pitch(ys):
    """Typical distance between consecutive body rows.

    The 25th percentile, not the median. The median is contaminated by the
    blocks this module exists to remove: on the fixture's left column the
    gaps are [370, 120, 120, 2040] and the footnote gap alone drags the
    median to 245, which is larger than the real head gap of 370. A low
    quantile cannot be moved by a handful of huge outliers.
    """
    gaps = sorted(ys[i + 1] - ys[i] for i in range(len(ys) - 1))
    return gaps[len(gaps) // 4] if gaps else 1


def body_run(after, body_ref, margin=1.0):
    """Longest run of consecutive body-sized lines in `after`.

    margin is deliberately tighter than the size drops being detected.
    At 2.0 the note type on pages 48, 56, 65 and 83, which is only about
    2.5 points below body, still counted as body-sized, so the run test
    rejected those real boundaries just as min_drop had.
    """
    best = run = 0
    for l in after:
        run = run + 1 if l["size"] >= body_ref - margin else 0
        best = max(best, run)
    return best


def note_start(lines, page_height, ratio=1.7, below=0.30,
               window=6, max_run=6, max_run_frac=0.4, huge=5.0):
    """Index of the first footnote line, or None.

    NEITHER signal works alone, and both failures were measured on this
    book rather than guessed.

    Font size per WORD is noise: Tesseract's x_fsize swings five points
    inside one line of body text, so body words span 37-45 and note words
    32-38 on the same page. Per LINE the medians still overlap, body
    bottoming out at 35 and notes topping out at 38, so no threshold
    exists either way.

    The pitch gap alone is just as bad. Taking the last large gap lands
    INSIDE a long note block, because separate notes are themselves set
    apart; that kept 10 to 40 note lines on pages 13, 16 and 26. Raising
    the ratio to exclude chapter headings then loses the note boundary
    entirely on pages 19, 20 and 22, where the gap into the notes is only
    1.9 to 2.1 times pitch.

    So the gap only PROPOSES a boundary and the size drop confirms it.
    Compared over a short window either side rather than whole-column
    means, the true boundary on the Genesis 2 page scores a 4.3 point
    drop against the CAPITULO II heading's 2.5, a margin twice what
    whole-column means give.

    The FIRST confirmed candidate wins, not the largest. Inside the note
    block the type shrinks again for the cross-reference lines, so the
    biggest drop on the page is usually a boundary WITHIN the notes: on
    page 33 the real boundary scores 5.7 and a sub-boundary 500px lower
    scores 13.7, and taking the larger kept twenty note lines. Chapter
    headings are excluded by the structural test below rather than by the
    size drop, so there is nothing left for a largest-drop rule to
    protect against.

    The size drop is now only a sign test, because its MAGNITUDE cannot
    separate a chapter heading from a note boundary: measured on this
    volume, real note boundaries score 2.5 to 2.7 on pages 48, 56, 65
    and 83, and the CAPITULO II heading scores 2.5. The ranges overlap
    exactly. A minimum magnitude was tried and then removed: dropping it
    from 1.0 to 0.0 broke none of the checks below, so nothing measured
    justified the threshold and it was dead weight.

    What separates them is structural. After a chapter heading the body
    RESUMES, for seventeen consecutive body-sized lines on the Genesis 2
    page. After a note boundary it never resumes: the longest body-sized
    run among those notes is five, and those are isolated 38s inside a
    block of 32s to 37s. Both an absolute cap and a fraction of what
    follows are needed. The cap alone passes a chapter heading sitting
    near the column foot, where only a few body lines follow it and a
    short run therefore looks innocent; the fraction catches that one at
    1.00. The fraction alone passes the mid-column heading at 0.35.

    A gap of `huge` times pitch short-circuits all of that. The size
    tests need a body reference, and on a column carrying one line of
    body text above a fourteen-line note block the reference IS the note
    size, so every note counts as body-sized and the block survives. No
    size rule can resolve that column. Its geometry can: the gap there is
    fifty-seven times pitch, where a chapter heading runs about two and
    the note boundary on the Genesis 2 page runs three and a half. A gap
    that large means the column simply ended.
    """
    if len(lines) < 4:
        return None
    ys = [l["y"] for l in lines]
    pitch = line_pitch(ys) or 1
    top = [l["size"] for l in lines[:window] if l["size"]]
    if not top:
        return None
    body_ref = statistics.median(top)
    for i in range(1, len(lines)):
        if ys[i] - ys[i - 1] < pitch * ratio or ys[i] <= page_height * below:
            continue
        before = [l["size"] for l in lines[max(0, i - window):i] if l["size"]]
        after = [l["size"] for l in lines[i:i + window] if l["size"]]
        if not before or not after:
            continue
        if ys[i] - ys[i - 1] >= pitch * huge:
            return i
        if statistics.mean(before) <= statistics.mean(after):
            continue
        rest = lines[i:]
        run = body_run(rest, body_ref)
        if run <= max_run and run <= len(rest) * max_run_frac:
            return i
    return None


def head_lines(lines, page_height, ratio=2.0, above=0.08):
    """How many leading lines are the running head, 0 if none.

    TWO signals are required, and both are needed. Position alone is too
    tight: on the Genesis 2 page the head sits at 6.19% of page height and
    the body starts at 9.06%, barely three points apart. A pitch gap alone
    is wrong in the other direction: on a page carrying one body line and
    fourteen footnote rows, that single body line has an enormous gap after
    it and would be eaten as a head.
    """
    if len(lines) < 3:
        return 0
    ys = [l["y"] for l in lines]
    pitch = line_pitch(ys) or 1
    n = 0
    while (n + 1 < len(ys) and ys[n] < page_height * above
           and ys[n + 1] - ys[n] >= pitch * ratio):
        n += 1
    return n


def page_body(page, drop_notes=True):
    """Body lines of one page in reading order, running head and footnote
    block removed. Both are found by the jump in line pitch that separates
    them from the body, not by fixed positions."""
    (px0, py0, px1, py1), words = page
    height = (py1 - py0) or 1
    gutter = find_gutter(words, px1 or 1)
    if gutter is None:
        cols = [words]
    else:
        cols = [[w for w in words if (w[0][0] + w[0][2]) / 2 < gutter],
                [w for w in words if (w[0][0] + w[0][2]) / 2 >= gutter]]

    out = []
    for col in cols:
        lines = build_lines(col)
        lines = lines[head_lines(lines, height):]
        if drop_notes:
            cut = note_start(lines, height)
            if cut is not None:
                lines = lines[:cut]
        out.extend(l["text"] for l in lines)
    return out


def fetch(identifier, dest):
    url = "https://archive.org/metadata/%s" % urllib.parse.quote(identifier)
    meta = json.loads(urllib.request.urlopen(url, timeout=180).read())
    names = [f["name"] for f in meta.get("files", []) if "hocr" in f["name"].lower()]
    name = (next((n for n in names if n.endswith("_hocr.html")), None)
            or next((n for n in names if n.endswith("_hocr.html.gz")), None))
    if not name:
        raise SystemExit("%s: no hOCR in this item" % identifier)
    dl = "https://archive.org/download/%s/%s" % (
        urllib.parse.quote(identifier), urllib.parse.quote(name))
    with urllib.request.urlopen(dl, timeout=900) as r, open(dest, "wb") as w:
        while True:
            chunk = r.read(1 << 20)
            if not chunk:
                break
            w.write(chunk)
    print("%s -> %s" % (name, dest))


# --------------------------------------------------------------- selftest
# The fixture reproduces the real failure: every ocr_line spans BOTH
# columns. Trusting those lines yields "...animales 6. Salia...", welding
# two verses from different columns. The extractor must recover them apart
# and in order, and must drop the running head and the smaller footnote.
W, H, BODY, NOTE = 3000, 4400, 38, 26
LEFT = ["24. Produjo pues la tierra toda suerte de animales",
        "25. Hizo pues Dios las bestias silvestres de la tierra",
        "26. Y por fin dijo: Hagamos al hombre a imagen nuestra"]
RIGHT = ["6. Salia empero de la tierra una fuente que iba regando",
         "7. Formo pues el Senor Dios al hombre del lodo de la tierra",
         "8. Habia plantado el Senor Dios desde el principio un jardin"]


def _w(x, y, t, size=BODY):
    return ('<span class="ocrx_word" title="bbox %d %d %d %d; x_fsize %d">%s'
            '</span>\n' % (x, y, x + 20 * len(t), y + size, size, t))


def _fixture():
    o = ['<html><body>\n<div class="ocr_page" title="bbox 0 0 %d %d">\n' % (W, H)]
    o.append('<span class="ocr_line" title="bbox 100 150 2400 188">\n')
    for x, t in ((100, "3"), (300, "GENESIS"), (1900, "CAPITULO"), (2200, "II")):
        o.append(_w(x, 150, t))
    o.append("</span>\n")
    y = 520
    for li, ri in zip(LEFT, RIGHT):
        o.append('<span class="ocr_line" title="bbox 100 %d 2900 %d">\n' % (y, y + BODY))
        x = 100
        for t in li.split():
            o.append(_w(x, y, t)); x += 20 * len(t) + 14
        x = 1600
        for t in ri.split():
            o.append(_w(x, y, t)); x += 20 * len(t) + 14
        o.append("</span>\n")
        y += 120
    o.append('<span class="ocr_line" title="bbox 100 2800 1400 2826">\n')
    x = 100
    for t in "1 Vease Adorar en el diccionario de notas".split():
        o.append(_w(x, 2800, t, NOTE)); x += 14 * len(t) + 10
    o.append("</span>\n</div></body></html>\n")
    return "".join(o)


def selftest():
    bad = []

    def ck(label, got, want):
        ok = got == want
        print("  [%s] %s: %r" % ("ok  " if ok else "FAIL", label, got))
        if not ok:
            bad.append(label)

    pages = pages_from(_fixture())
    ck("one page", len(pages), 1)
    pb, words = pages[0]
    g = find_gutter(words, pb[2])
    body_words = [w for w in words if w[0][1] >= 500]
    le = max(b[2] for b, _, _ in body_words if (b[0] + b[2]) / 2 < 1500)
    re_ = min(b[0] for b, _, _ in body_words if (b[0] + b[2]) / 2 >= 1500)
    print("  gutter %s, columns end/start %d/%d" % (round(g) if g else None, le, re_))
    ck("gutter between the columns", bool(g and le < g < re_), True)

    body = page_body((pb, words))
    print("  reconstructed:")
    for l in body:
        print("    " + l)
    ck("six lines", len(body), 6)
    ck("left column in order", [l.split(".")[0] for l in body[:3]], ["24", "25", "26"])
    ck("right column in order", [l.split(".")[0] for l in body[3:]], ["6", "7", "8"])
    ck("nothing welded", any("animales 6." in l for l in body), False)
    ck("head dropped", any("GENESIS" in l for l in body), False)
    ck("footnote dropped", any("Vease Adorar" in l for l in body), False)
    ck("footnote kept on request",
       any("Vease Adorar" in l for l in page_body((pb, words), drop_notes=False)), True)

    # A page that is MOSTLY footnotes. The body is one line and the notes
    # are fourteen, so any rule that reads "the odd block out" backwards
    # will throw the body away and keep the notes.
    heavy = []
    y = 500
    for t in LEFT[0].split():
        heavy.append(((100 + 20 * len(t), y, 160 + 20 * len(t), y + BODY), t, BODY))
    y = 2800
    for row in range(14):
        x = 100
        for t in "1 Vease Adorar en el diccionario de notas generales".split():
            heavy.append(((x, y, x + 14 * len(t), y + NOTE), t, NOTE))
            x += 14 * len(t) + 10
        y += 40
    kept = page_body(((0, 0, W, H), heavy))
    ck("note-heavy page: body kept", any("Produjo" in l for l in kept), True)
    ck("note-heavy page: notes dropped", any("Vease" in l for l in kept), False)

    # REAL DATA. Every (y, size) pair below is measured off the left
    # column of the Genesis 2 page of t1 (page 14, bbox height 4427):
    # the running head at 274, forty-five body rows, the CAPITULO II
    # heading at 1679, then the footnote block from 2727. Synthetic
    # fixtures passed in this file twice while the checks they covered
    # were broken on this exact page, so the page itself is the test.
    REAL_BODY = [
        (274, 42), (401, 38), (449, 40), (497, 41), (544, 41), (592, 38),
        (639, 37), (687, 42), (734, 45), (783, 43), (829, 38), (877, 38),
        (924, 44), (972, 39), (1019, 40), (1067, 41), (1114, 40),
        (1162, 37), (1209, 44), (1258, 42), (1305, 42), (1353, 40),
        (1400, 40), (1447, 40), (1495, 43), (1543, 39), (1592, 40),
        (1679, 42), (1760, 35), (1801, 38), (1846, 37), (1921, 39),
        (1972, 40), (2016, 40), (2063, 41), (2113, 41), (2157, 39),
        (2205, 40), (2254, 39), (2300, 40), (2349, 40), (2398, 41),
        (2438, 40), (2490, 40), (2538, 40), (2586, 41)]
    REAL_NOTES = [
        (2727, 36), (2767, 36), (2806, 36), (2846, 36), (2886, 36),
        (2926, 36), (2962, 37), (3006, 36), (3046, 35), (3086, 37),
        (3125, 36), (3165, 34), (3205, 38), (3245, 38), (3283, 38),
        (3324, 38), (3363, 37), (3402, 36), (3441, 34), (3482, 36),
        (3520, 35), (3559, 32), (3600, 36), (3638, 38), (3677, 36),
        (3716, 36), (3751, 36), (3796, 37), (3834, 35)]

    def rows(pairs, kind):
        return [{"y": y, "size": z, "text": kind} for y, z in pairs]

    real = rows(REAL_BODY, "body") + rows(REAL_NOTES, "note")
    real[0]["text"] = "head"
    nh = head_lines(real, 4427)
    ck("real page: head found", nh, 1)
    rest = real[nh:]
    cut = note_start(rest, 4427)
    ck("real page: notes start at the 141px gap", cut, len(REAL_BODY) - 1)
    kept = rest[:cut] if cut is not None else rest
    ck("real page: all body rows kept", len(kept), len(REAL_BODY) - 1)
    ck("real page: no notes kept", any(l["text"] == "note" for l in kept), False)
    # The CAPITULO II heading has a 87px gap after a 40px pitch, so the
    # gap rule proposes it. Only the size drop rejects it.
    ck("real page: chapter heading not a cut",
       1679 in [l["y"] for l in kept], True)
    # Page 13's failure: a long note block has gaps BETWEEN its notes, so
    # taking the last large gap cut inside the block and kept the notes
    # above it. The cut must land at the block's first line.
    split = rows(REAL_BODY, "body") + rows(
        [(y + 200 if i >= 14 else y, z)
         for i, (y, z) in enumerate(REAL_NOTES)], "note")
    split[0]["text"] = "head"
    scut = note_start(split[1:], 4427)
    ck("note block with an internal gap: cut at its start",
       scut, len(REAL_BODY) - 1)
    # Page 33: TWO candidates confirm, the real boundary scoring 5.7 and
    # a sub-boundary inside the notes scoring 13.7. The first must win.
    two = rows(REAL_BODY, "body")
    two += [{"y": 3471 + 45 * i, "size": 36, "text": "note"} for i in range(11)]
    two += [{"y": 3968 + 40 * i, "size": 23, "text": "xref"} for i in range(8)]
    ck("two confirmed candidates: the first wins",
       note_start(two[1:], 4427), len(REAL_BODY) - 1)

    # Pages 48, 56, 65 and 83: a real note boundary whose size drop is
    # only about 2.5, which the old min_drop of 3.0 threw away. It must
    # be cut now, on the strength of the body never resuming.
    weak = rows(REAL_BODY, "body")
    weak += [{"y": 2700 + 45 * i, "size": 37, "text": "note"} for i in range(12)]
    ck("note boundary with a weak size drop is still cut",
       note_start(weak[1:], 4427), len(REAL_BODY) - 1)

    # A chapter heading near the COLUMN FOOT, with only a few body lines
    # under it. The absolute run cap alone passes this one, because a
    # short run looks innocent; the fraction of what follows rejects it.
    foot = rows(REAL_BODY[:40], "body")
    foot += [{"y": 2388, "size": 38, "text": "heading"}]
    foot += [{"y": 2428 + 40 * i, "size": 38, "text": "body"} for i in range(5)]
    ck("chapter heading near the column foot not cut",
       note_start(foot[1:], 4427), None)

    # A column of pure body text, chapter heading and all, must not be cut.
    ck("body-only column not cut", note_start(rows(REAL_BODY, "body")[1:], 4427), None)

    full = []
    y = 500
    for _ in range(6):
        x = 100
        for t in ("palabra " * 22).split():
            full.append(((x, y, x + 20 * len(t), y + BODY), t, BODY))
            x += 20 * len(t) + 14
        y += 120
    ck("full-width page not split", find_gutter(full, W), None)
    ck("one printed row stays one line",
       len(build_lines([(b, t, s) for b, t, s in words if b[1] == 520])), 1)

    print()
    print("%d FAILURE(S): %s" % (len(bad), bad) if bad else "all checks passed")
    return 1 if bad else 0


def main():
    a = sys.argv[1:]
    if not a or a[0] == "--selftest":
        return selftest()
    if a[0] == "fetch" and len(a) >= 3:
        fetch(a[1], a[2]); return 0
    if a[0] == "body" and len(a) >= 3:
        keep = "--keep-notes" in a
        pages = read_pages(a[1])
        two = 0
        with open(a[2], "w", encoding="utf-8") as w:
            for p in pages:
                if find_gutter(p[1], p[0][2] or 1) is not None:
                    two += 1
                for line in page_body(p, drop_notes=not keep):
                    w.write(line + "\n")
                w.write("\n")
        print("pages %d, two-column %d -> %s" % (len(pages), two, a[2]))
        return 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main())
