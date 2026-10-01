from fastapi import APIRouter, HTTPException, Depends
import httpx
import json
from sqlalchemy.orm import Session

from reference_parser import strip_markup
from auth import get_current_user
from database import get_db
import models

router = APIRouter(prefix="/bible", tags=["bible"])

UPSTREAM_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
}


@router.get("/chapter/{book}/{chapter}")
async def get_chapter(
    book: str,
    chapter: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # ── Cache hit ──────────────────────────────────────────────────────────
    cached = (
        db.query(models.BibleChapter)
        .filter_by(book_slug=book, chapter_num=chapter)
        .first()
    )
    if cached:
        return {
            "book":        book,
            "book_title":  cached.book_title,
            "chapter":     chapter,
            "verse_count": cached.verse_count,
            "verses":      json.loads(cached.verses_json),
        }

    # ── Cache miss — fetch from upstream ──────────────────────────────────
    url = f"https://thedouayrheims.com/api/chapter/{book}/{chapter}"

    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(url, headers=UPSTREAM_HEADERS, timeout=20)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Could not reach the scripture source ({type(e).__name__})",
        )

    if response.status_code == 404:
        raise HTTPException(
            status_code=404,
            detail=f"Book '{book}' chapter {chapter} not found",
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=503,
            detail=f"Scripture source returned {response.status_code}",
        )

    try:
        data = response.json()
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Scripture source returned invalid data",
        )

    verses = [
        {"verse": v["verse"], "text": strip_markup(v["text"])}
        for v in data.get("verses", [])
    ]
    book_title  = data.get("book_title", book)
    verse_count = data.get("verse_count", len(verses))

    # ── Save to cache (best-effort; a failure here still returns data) ─────
    try:
        db.add(models.BibleChapter(
            book_slug   = book,
            chapter_num = chapter,
            book_title  = book_title,
            verse_count = verse_count,
            verses_json = json.dumps(verses),
        ))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[bible] cache write failed for {book}/{chapter}: {e}", flush=True)

    return {
        "book":        book,
        "book_title":  book_title,
        "chapter":     chapter,
        "verse_count": verse_count,
        "verses":      verses,
    }