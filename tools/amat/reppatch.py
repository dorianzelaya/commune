"""Marker repair, verified against the expected verse number.

All or nothing: nothing is written unless every anchor matches once.
"""
import io

src = io.open("parse.py", encoding="utf-8").read()
assert "def repair(" not in src, "already applied"

ADD = '''

# Glyph confusions Tesseract makes on this type, each one observed in
# the volume rather than imagined. "8." reading as "S." is the common
# one and alone accounts for a large share of the missing verses.
CONFUSE = {"S": "8", "s": "8", "B": "8", "&": "8", "O": "0", "o": "0",
           "D": "0", "Q": "0", "l": "1", "I": "1", "i": "1", "|": "1",
           "Z": "2", "z": "2", "E": "3", "G": "6", "b": "6", "T": "7",
           "q": "9", "g": "9", "y": "9", "A": "4"}
LEAD = re.compile(r"^\\s*([0-9A-Za-z&|]{1,4})\\s*[.,:;]")


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
'''

anchor = "\n\nFIXTURE ="
assert src.count(anchor) == 1
src = src.replace(anchor, ADD + anchor)

old = '''    print("chapters fully located: %d of %d" % (len(whole), len(per)))'''
assert src.count(old) == 1
src = src.replace(old, '''    print("chapters fully located: %d of %d" % (len(whole), len(per)))

    reps, rlog = repair(lines, marks, got, want)
    print("\\nmarkers repaired: %d" % len(reps))
    total = len(hit) + len(reps)
    print("verses after repair: %d of %d  (%.1f%%)"
          % (total, len(want), 100.0 * total / max(1, len(want))))
    for k in reps:
        slug, ch, v, _ = got[k]
        per[(slug, ch)][0] += 1
    whole2 = [k for k, (h, n) in per.items() if h == n]
    print("chapters whole after repair: %d of %d" % (len(whole2), len(per)))
    print("\\nfirst 12 repairs, token -> expected verse:")
    for slug, ch, v, tok, text in rlog[:12]:
        print("  %-12s %3d:%-3d  %-4r -> %-3d  %s" % (slug, ch, v, tok, v, text))''')

old = '''    ck("a clean stream is left alone",
       trim_front([(i, i + 1) for i in range(8)]),
       [(i, i + 1) for i in range(8)])'''
assert src.count(old) == 1
src = src.replace(old, '''    ck("a clean stream is left alone",
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
    open("_fx3.txt", "w", encoding="utf-8").write("\\n".join(fixlines) + "\\n")
    l3, m3 = markers("_fx3.txt")
    w3 = [("genesis", 1, v) for v in (1, 2, 8, 9)]
    g3 = align2(m3, w3)
    ck("verse 8 is missing before repair",
       [i is None for *_, i in g3], [False, False, True, False])
    reps, rlog = repair(l3, m3, g3, w3)
    ck("repair locates the mangled marker", reps, {2: 2})
    ck("repair logs what it changed", [r[3] for r in rlog], ["S"])''')

io.open("parse.py", "w", encoding="utf-8").write(src)
print("patched")
