"""Fold the measured size-drop rule into amat.py.

Three edits, all or nothing: build_lines gains a per-line size,
note_start is replaced, and the real-page regression test gains the
sizes it now needs. Nothing is written unless every anchor matches
exactly once, so a half-applied file is not possible.
"""
import io

src = io.open("amat.py", encoding="utf-8").read()
ns = io.open("ns.txt", encoding="utf-8").read().rstrip("\n")
rd = io.open("rd.txt", encoding="utf-8").read().rstrip("\n")


def sub(s, old, new):
    assert s.count(old) == 1, "anchor matched %d times: %r" % (
        s.count(old), old[:60])
    return s.replace(old, new)


src = sub(src, """            cur.append((box[0], box[1], text))
            ref = c if ref is None else (ref + c) / 2
        else:
            groups.append(cur)
            cur, ref = [(box[0], box[1], text)], c""",
          """            cur.append((box[0], box[1], text, size))
            ref = c if ref is None else (ref + c) / 2
        else:
            groups.append(cur)
            cur, ref = [(box[0], box[1], text, size)], c""")

src = sub(src, """        out.append({"text": " ".join(t for _, _, t in g),
                    "y": min(y for _, y, _ in g)})""",
          """        sizes = [z for *_, z in g if z]
        out.append({"text": " ".join(t for _, _, t, _ in g),
                    "y": min(y for _, y, _, _ in g),
                    "size": statistics.median(sizes) if sizes else 0})""")

a, b = src.index("def note_start("), src.index("def head_lines(")
src = src[:a] + ns + "\n\n\n" + src[b:]

a, b = src.index("    # REAL DATA."), src.index("    full = []")
src = src[:a] + rd + "\n\n" + src[b:]

io.open("amat.py", "w", encoding="utf-8").write(src)
print("patched")
