"""Serve the chapter in Spanish when the reader asks for it.

Falls back to the Douay when a chapter has no Spanish rows, so the
reader never shows an empty chapter: the 1884 scan is uneven, and a
few books came through at under half coverage.

All or nothing: nothing is written unless every anchor matches once.
"""
import io

p = "routers/bible_routes.py"
src = io.open(p, encoding="utf-8").read()
assert "bible_verses_es" not in src, "already applied"


def sub(old, new):
    global src
    assert src.count(old) == 1, "anchor matched %d times: %r" % (
        src.count(old), old[:56])
    src = src.replace(old, new)


sub('''def get_chapter(
    book: str,
    chapter: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):''', '''def get_chapter(
    book: str,
    chapter: int,
    lang: str = Query("en"),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):''')

sub('''    rows = db.execute(
        text(
            "SELECT verse_num, text, book_title FROM bible_verses "
            "WHERE book_slug = :book AND chapter_num = :chapter "
            "ORDER BY verse_num"
        ),
        {"book": book, "chapter": chapter},
    ).mappings().all()''', '''    if lang == "es":
        # Torres Amat, 1884, public domain, recovered from the Internet
        # Archive scan. Coverage is uneven by book because the scan is:
        # Habacuc and Aggeo came through whole, 1 Macabeos and Job did
        # not. Each verse carries how it was placed, so the reader can
        # treat a length-apportioned verse differently from one whose
        # printed number was read correctly.
        es = db.execute(
            text(
                "SELECT verse_num, text, confidence FROM bible_verses_es "
                "WHERE book_slug = :book AND chapter_num = :chapter "
                "ORDER BY verse_num"
            ),
            {"book": book, "chapter": chapter},
        ).mappings().all()
        if es:
            return {
                "book": book,
                "book_title": "",
                "chapter": chapter,
                "lang": "es",
                "verse_count": len(es),
                "verses": [
                    {"verse": r["verse_num"], "text": r["text"],
                     "confidence": r["confidence"]}
                    for r in es
                ],
            }
        print(f"[bible] no Spanish for {book} {chapter}, serving English",
              flush=True)

    rows = db.execute(
        text(
            "SELECT verse_num, text, book_title FROM bible_verses "
            "WHERE book_slug = :book AND chapter_num = :chapter "
            "ORDER BY verse_num"
        ),
        {"book": book, "chapter": chapter},
    ).mappings().all()''')

io.open(p, "w", encoding="utf-8").write(src)
print("patched")
