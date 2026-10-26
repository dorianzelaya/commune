"""Replace the note boundary rule with the structural test.

All or nothing: nothing is written unless every anchor matches exactly
once, so a half-applied file is not possible.
"""
import io

src = io.open("amat.py", encoding="utf-8").read()
ns = io.open("ns2.txt", encoding="utf-8").read().rstrip("\n")
rd = io.open("rd2.txt", encoding="utf-8").read().rstrip("\n")

assert "def body_run(" not in src, "already applied"
assert "# Pages 48, 56, 65 and 83" not in src, "already applied"

a, b = src.index("def note_start("), src.index("def head_lines(")
src = src[:a] + ns + "\n\n\n" + src[b:]

anchor = "    # A column of pure body text"
assert src.count(anchor) == 1, "test anchor matched %d times" % src.count(anchor)
src = src.replace(anchor, rd + "\n\n" + anchor)

io.open("amat.py", "w", encoding="utf-8").write(src)
print("patched")
