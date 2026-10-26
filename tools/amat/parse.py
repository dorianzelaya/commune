"""Verses out of the extracted Torres Amat body text.

The extractor hands over body lines in reading order. This turns them
into numbered verses grouped by chapter, and reports the result against
the Douay-Rheims counts already in the database. Both are translations
of the Vulgate, so chapter and verse structure should agree exactly;
where it does not, either the scan or this parser is wrong, and the
report says which chapter to look at.

  usage: parse.py --selftest
         parse.py report <body.txt> <expected.json>
         parse.py dump <body.txt> <out.json>
"""
import json, re, sys

CHAPTER = re.compile(r"^CAP[IÍ]TULO\b[\s.]*([IVXLC]+)\b")
# A verse marker opens a line: "1." or, where the OCR lost the point,
# "1,". The stamp "(YY 1448)" from the library's title page bleeds into
# the top line of a column, so a marker may sit behind it.
STAMP = re.compile(r"^\s*\(?\s*[A-Z]{0,2}\s*\d{3,4}\s*\)\s*")
MARKER = re.compile(r"^(\d{1,3})\s*[.,]\s*(?=\S)")
# Note references printed into the body. Tesseract reads the printed
# marks as curly quotes on some scans and as straight ones on
# others, so both are stripped. A straight double quote is not
# Spanish punctuation of 1884 anyway; that text uses the dash and
# the angle quote.
NOTEREF = re.compile(r'[*”“"°¤¶]+')
ROMAN = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100}


def roman(s):
    total = 0
    for i, ch in enumerate(s):
        v = ROMAN[ch]
        total += -v if i + 1 < len(s) and v < ROMAN[s[i + 1]] else v
    return total


def join(lines):
    """One string per chapter, with print hyphenation undone.

    A line ending in a hyphen is a word broken across the line, so the
    halves join with nothing between them: "he-" + "cho" is "hecho",
    not "he cho". Every other line break is a space.
    """
    out = []
    for raw in lines:
        s = raw.rstrip()
        if not s:
            continue
        if s.endswith("-"):
            out.append(s[:-1])
        else:
            out.append(s + " ")
    return "".join(out)


def verses(lines):
    """{verse_number: text} for one chapter's lines, in document order."""
    found, cur, buf = [], None, []
    for raw in lines:
        s = STAMP.sub("", raw.rstrip())
        m = MARKER.match(s)
        if m:
            if cur is not None:
                found.append((cur, buf))
            cur, buf = int(m.group(1)), [s[m.end():]]
        elif cur is not None:
            buf.append(s)
        # Text before the first marker is a chapter summary, not a verse.
    if cur is not None:
        found.append((cur, buf))
    out = {}
    for num, body in found:
        text = NOTEREF.sub("", join(body))
        out[num] = re.sub(r"\s{2,}", " ", text).strip()
    return out


def chapters(path):
    """[(roman_value_or_None, {verse: text}), ...] in document order.

    The first chapter of a book carries no CAPITULO heading in this
    edition; the book title stands in for it. So the run of lines before
    the first heading is a chapter too, and is reported with None.
    """
    lines = open(path, encoding="utf-8").read().split("\n")
    blocks, label, buf = [], None, []
    for s in lines:
        m = CHAPTER.match(s.strip())
        if m:
            blocks.append((label, buf))
            label, buf = roman(m.group(1)), []
        else:
            buf.append(s)
    blocks.append((label, buf))

    out = []
    for lab, body in blocks:
        v = verses(body)
        if v:
            out.append((lab, v))
    return out


def expected_list(path):
    """[(slug, chapter, max_verse, verse_count), ...] in canonical order."""
    data = json.load(open(path, encoding="utf-8"))
    out = []
    for slug, chs in data.items():
        for ch in sorted(chs, key=int):
            out.append((slug, int(ch), chs[ch]["max"], chs[ch]["count"]))
    return out


def report(body, exp_path):
    got = chapters(body)
    exp = expected_list(exp_path)
    print("parsed chapters: %d    expected: %d" % (len(got), len(exp)))
    print("parsed verses:   %d    expected: %d"
          % (sum(len(v) for _, v in got), sum(c for *_, c in exp)))

    print("\nheading sequence as parsed (first 60):")
    print("  " + " ".join(str(l) if l else "-" for l, _ in got[:60]))

    if len(got) != len(exp):
        print("\nChapter counts differ, so a positional comparison would"
              "\nalign the wrong chapters. Fix segmentation first.")
        return 1

    bad = 0
    for (lab, v), (slug, ch, mx, n) in zip(got, exp):
        hi = max(v) if v else 0
        if hi != mx or len(v) != n:
            bad += 1
            if bad <= 25:
                print("  %-13s %3d  got max=%3d n=%3d   want max=%3d n=%3d"
                      % (slug, ch, hi, len(v), mx, n))
    print("\nchapters matching exactly: %d of %d" % (len(exp) - bad, len(exp)))
    return 1 if bad else 0


def markers(path):
    """[(line_index, verse_number), ...] in document order."""
    lines = open(path, encoding="utf-8").read().split("\n")
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

    print("\nsegment lengths, first 60:")
    print("  " + " ".join(str(len(s)) for s in segs[:60]))
    print("expected lengths, first 60:")
    print("  " + " ".join(str(c) for *_, c in exp[:60]))

    short = sum(1 for s in segs if len(s) < 5)
    print("\nsegments shorter than 5 verses: %d" % short)
    gaps = 0
    for s in segs:
        nums = [n for _, n in s]
        gaps += sum(1 for a, b in zip(nums, nums[1:]) if b != a + 1)
    print("non-consecutive steps inside segments: %d" % gaps)
    return 0


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
    kept = trim_front(marks)
    want = expected_verses(exp_path)
    # align2 was a regression on real data: its wider window matched
    # spurious numbers far ahead, advanced the cursor past real verses
    # and cascaded, taking 85.4% down to 60.1% with whole chapters at
    # zero. The narrow confirmed-free rule is kept until something
    # measurably beats it.
    got = align(kept, want)
    print("front-matter markers dropped: %d" % (len(marks) - len(kept)))
    marks = kept
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

    reps, rlog = repair(lines, marks, got, want)
    print("\nmarkers repaired: %d" % len(reps))
    total = len(hit) + len(reps)
    print("verses after repair: %d of %d  (%.1f%%)"
          % (total, len(want), 100.0 * total / max(1, len(want))))
    for k in reps:
        slug, ch, v, _ = got[k]
        per[(slug, ch)][0] += 1
    whole2 = [k for k, (h, n) in per.items() if h == n]
    print("chapters whole after repair: %d of %d" % (len(whole2), len(per)))
    print("\nfirst 12 repairs, token -> expected verse:")
    for slug, ch, v, tok, text in rlog[:12]:
        print("  %-12s %3d:%-3d  %-4r -> %-3d  %s" % (slug, ch, v, tok, v, text))

    print("\nworst 15 chapters:")
    for (slug, ch), (h, n) in sorted(per.items(),
                                     key=lambda kv: kv[1][0] - kv[1][1])[:15]:
        print("  %-13s %3d  %3d of %3d" % (slug, ch, h, n))
    return 0


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


# Glyph confusions Tesseract makes on this type, each one observed in
# the volume rather than imagined. "8." reading as "S." is the common
# one and alone accounts for a large share of the missing verses.
CONFUSE = {"S": "8", "s": "8", "B": "8", "&": "8", "O": "0", "o": "0",
           "D": "0", "Q": "0", "l": "1", "I": "1", "i": "1", "|": "1",
           "Z": "2", "z": "2", "E": "3", "G": "6", "b": "6", "T": "7",
           "q": "9", "g": "9", "y": "9", "A": "4"}
LEAD = re.compile(r"^\s*([0-9A-Za-z&|]{1,4})\s*[.,:;]")


def could_be(token, want):
    """True when `token` is a plausible OCR rendering of the number.

    Repair is only safe because the answer is known. The expected verse
    number comes from the database, so a candidate is accepted only when
    it maps ONTO that number; nothing is inferred from the token alone.
    That rules out the guesswork that would otherwise be needed to tell
    "S." from a genuine letter.

    A leading stray digit is also tolerated: Tesseract reads the printed
    "29." as "929," on one page, prepending a digit rather than
    replacing one.
    """
    fixed = "".join(CONFUSE.get(c, c) for c in token)
    if not fixed.isdigit():
        return False
    if fixed == want:
        return True
    return len(fixed) == len(want) + 1 and fixed[1:] == want


def repair(lines, marks, got, want):
    """Find markers the OCR mangled, for verses alignment could not place.

    Returns (repairs, log) where repairs maps a want-index to the line
    it was found on, and log records every change for review: a repair
    that silently rewrote scripture would be worse than a missing verse.
    """
    placed = {k: idx for k, (_, _, _, idx) in enumerate(got) if idx is not None}
    repairs, log = {}, []
    for k, (slug, ch, v, idx) in enumerate(got):
        if idx is not None:
            continue
        # Search between the neighbouring located verses only, so a
        # repair cannot pull text in from another chapter.
        before = max((placed[j] for j in placed if j < k), default=None)
        after = min((placed[j] for j in placed if j > k), default=None)
        lo = marks[before][0] + 1 if before is not None else 0
        hi = marks[after][0] if after is not None else len(lines)
        for li in range(lo, min(hi, len(lines))):
            m = LEAD.match(STAMP.sub("", lines[li].rstrip()))
            if not m:
                continue
            tok = m.group(1)
            if tok.isdigit():
                continue          # a clean number alignment already saw
            if could_be(tok, str(v)):
                repairs[k] = li
                log.append((slug, ch, v, tok, lines[li][:52]))
                break
    return repairs, log


FIXTURE = """lA
Ps
TOMO PRIMERO
1. Quedaron pues acabados los cielos y la tierra, y todo el
ornato de ellos,
2. Y completo Dios, al septimo dia, la obra que habia he-
cho: y en el dia septimo" reposo d ceso de todas las obras que
habia acabado.
1448) 3. Salia empero de la tierra una fuente *, que iba regando
toda la superficie de la tierra,
CAPITULO II
Acabadas las obras de la creacion en los seis dias.
1. Formo pues el Senor Dios al hombre del lodo de la tier-
ra, e inspirole en el rostro un soplo o espiritu * de vida.
2, Habia plantado el Senor Dios desde el principio un jar-
din delicioso.
CAPITULO III. 18
1. Y por fin dijo: Hagamos al hombre a imagen nuestra.
CAPÍTULO IV
1. Y vio Dios todas las cosas que habia hecho.
"""


def selftest():
    bad = []

    def ck(label, got, want):
        ok = got == want
        print("  [%s] %s: %r" % ("ok  " if ok else "FAIL", label, got))
        if not ok:
            bad.append(label)

    open("_fx.txt", "w", encoding="utf-8").write(FIXTURE)
    got = chapters("_fx.txt")
    ck("four chapters", len(got), 4)
    ck("first has no heading", got[0][0], None)
    # CAPÍTULO with an accent is used for some chapters in this volume.
    # An unaccented pattern skips those headings silently, welding the
    # chapter onto the previous one, which is why this is checked.
    ck("headings read, accented form included",
       [l for l, _ in got[1:]], [2, 3, 4])
    ck("chapter 1 verse numbers", sorted(got[0][1]), [1, 2, 3])
    ck("chapter 2 verse numbers", sorted(got[1][1]), [1, 2])

    v, two = got[0][1], got[1][1]
    ck("hyphen joined across lines", "habia hecho" in v.get(2, ""), True)
    ck("no hyphen left mid-word",
       "he- cho" in v.get(2, "") or "he cho" in v.get(2, ""), False)
    ck("library stamp stripped",
       v.get(3, "").startswith("Salia empero"), True)
    ck("note marker removed", "*" in v.get(3, ""), False)
    ck("closing-quote note marker removed", '"' in v.get(2, ""), False)
    # The lines under a CAPITULO heading are a chapter summary, not
    # verse text. They must not be glued to the front of verse 1.
    ck("summary text kept out of verse 1",
       two.get(1, "").startswith("Formo pues"), True)
    ck("summary words absent from the whole chapter",
       any("Acabadas las obras" in t for t in two.values()), False)
    ck("comma marker accepted",
       two.get(2, "").startswith("Habia plantado"), True)
    ck("heading with trailing junk still parsed", got[2][0], 3)
    ck("roman numerals", [roman(s) for s in ("I", "IV", "IX", "XL", "LXV")],
       [1, 4, 9, 40, 65])
    ck("front matter dropped", any("TOMO" in t for t in v.values()), False)

    _, marks = markers("_fx.txt")
    segs = segments(marks)
    ck("reset rule finds every chapter without a heading",
       [[n for _, n in sg] for sg in segs],
       [[1, 2, 3], [1, 2], [1], [1]])
    # The headings for these would be missing on the real scan; the
    # reset rule must not care.
    open("_fx2.txt", "w", encoding="utf-8").write(
        "1. uno\n2. dos\n3. tres\n1. uno\n2. dos\n1. uno\n")
    _, m2 = markers("_fx2.txt")
    ck("boundaries found with no headings present",
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
       [(i, i + 1) for i in range(8)])

    # Marker repair. Only accepted when the token maps onto the number
    # the database says comes next.
    ck("S reads as 8 when 8 is expected", could_be("S", "8"), True)
    ck("S is not accepted for some other number", could_be("S", "5"), False)
    ck("a stray leading digit is tolerated", could_be("929", "29"), True)
    ck("a wrong stray digit is refused", could_be("929", "39"), False)
    ck("letters that are not confusions are refused",
       could_be("X", "8"), False)
    ck("a clean number is still recognised", could_be("8", "8"), True)

    fixlines = ["1. uno", "2. dos", "S. ocho", "9. nueve"]
    open("_fx3.txt", "w", encoding="utf-8").write("\n".join(fixlines) + "\n")
    l3, m3 = markers("_fx3.txt")
    w3 = [("genesis", 1, v) for v in (1, 2, 8, 9)]
    g3 = align2(m3, w3)
    ck("verse 8 is missing before repair",
       [i is None for *_, i in g3], [False, False, True, False])
    reps, rlog = repair(l3, m3, g3, w3)
    ck("repair locates the mangled marker", reps, {2: 2})
    ck("repair logs what it changed", [r[3] for r in rlog], ["S"])

    print()
    print("%d FAILURE(S): %s" % (len(bad), bad) if bad else "all checks passed")
    return 1 if bad else 0


def main():
    a = sys.argv[1:]
    if not a or a[0] == "--selftest":
        return selftest()
    if a[0] == "report" and len(a) >= 3:
        return report(a[1], a[2])
    if a[0] == "seq" and len(a) >= 3:
        return seqreport(a[1], a[2])
    if a[0] == "align" and len(a) >= 3:
        return alignreport(a[1], a[2])
    if a[0] == "dump" and len(a) >= 3:
        got = chapters(a[1])
        json.dump([{"heading": l, "verses": {str(k): t for k, t in v.items()}}
                   for l, v in got], open(a[2], "w"), ensure_ascii=False)
        print("wrote %s (%d chapters)" % (a[2], len(got)))
        return 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main())
