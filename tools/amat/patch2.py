"""First confirmed candidate wins, not the largest.

All or nothing: nothing is written unless every anchor matches exactly
once, so a half-applied file is not possible.
"""
import io

src = io.open("amat.py", encoding="utf-8").read()


def sub(s, old, new):
    assert s.count(old) == 1, "anchor matched %d times: %r" % (
        s.count(old), old[:60])
    return s.replace(old, new)


src = sub(src, """        drop = statistics.mean(before) - statistics.mean(after)
        if drop >= min_drop and (best is None or drop >= best[0]):
            best = (drop, i)
    return best[1] if best else None""",
          """        if statistics.mean(before) - statistics.mean(after) >= min_drop:
            return i
    return None""")

src = sub(src, """    So the gap only PROPOSES a boundary and the size drop chooses among
    the proposals. Compared over a short window either side rather than
    whole-column means, the true boundary on the Genesis 2 page scores a
    4.3 point drop against the CAPITULO II heading's 2.5, a margin twice
    what whole-column means give.
    \"\"\"""",
          """    So the gap only PROPOSES a boundary and the size drop confirms it.
    Compared over a short window either side rather than whole-column
    means, the true boundary on the Genesis 2 page scores a 4.3 point
    drop against the CAPITULO II heading's 2.5, a margin twice what
    whole-column means give.

    The FIRST confirmed candidate wins, not the largest. Inside the note
    block the type shrinks again for the cross-reference lines, so the
    biggest drop on the page is usually a boundary WITHIN the notes: on
    page 33 the real boundary scores 5.7 and a sub-boundary 500px lower
    scores 13.7, and taking the larger kept twenty note lines. Chapter
    headings are already excluded by min_drop, every one of them scoring
    between 0.2 and 2.0 on the pages measured, so there is nothing left
    for a largest-drop rule to protect against.
    \"\"\"""")

src = sub(src, """    # A column of pure body text, chapter heading and all, must not be cut.""",
          """    # Page 33: TWO candidates confirm, the real boundary scoring 5.7 and
    # a sub-boundary inside the notes scoring 13.7. The first must win.
    two = rows(REAL_BODY, "body")
    two += [{"y": 3471 + 45 * i, "size": 36, "text": "note"} for i in range(11)]
    two += [{"y": 3968 + 40 * i, "size": 23, "text": "xref"} for i in range(8)]
    ck("two confirmed candidates: the first wins",
       note_start(two[1:], 4427), len(REAL_BODY) - 1)

    # A column of pure body text, chapter heading and all, must not be cut.""")

io.open("amat.py", "w", encoding="utf-8").write(src)
print("patched")
