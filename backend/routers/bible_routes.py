from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
import httpx

from reference_parser import strip_markup
from database import get_db
from auth import get_current_user
import models

router = APIRouter(prefix="/bible", tags=["bible"])

# The upstream Douay-Rheims API blocks requests without a normal browser
# User-Agent, and is more tolerant of clients that identify themselves.
# Sending these headers makes the backend look like an ordinary client
# rather than an anonymous script.
UPSTREAM_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
}


@router.get("/search")
def search_verses(
    q: str = Query(..., min_length=2, max_length=120),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0, le=5000),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """
    Keyword search across all 73 books.

    Matching and ranking happen in Postgres against the `tsv` column, which
    is GENERATED ALWAYS from the verse text and carries a GIN index, so this
    stays fast over ~36k verses without any caching layer.

    websearch_to_tsquery is used rather than to_tsquery because it accepts
    ordinary typed input. Quotes, OR, and leading minus all work, and
    stray punctuation does not raise.

    `marked` is the verse with matched words wrapped in [[HL]]...[[/HL]] by
    ts_headline, which uses the same dictionary as the search, so stemmed
    hits are marked too ("fear" marks "feared"). The delimiters are
    deliberately not HTML: the frontend splits on them and builds elements,
    so no raw markup is ever injected into the page. HighlightAll returns
    the whole verse rather than a fragment, which is right for text this
    short. ts_headline sits in the outer query so it only runs on the rows
    that survive LIMIT, not on every match.

    Only book_slug is returned, never book_title. book_title here is the
    full upstream header ("The Book of Iosue, in Hebrew Iehosua...") which
    is useless in a result row. The frontend maps slug to display name
    using bible.js, so book names have exactly one source of truth.
    """
    params = {"q": q.strip(), "limit": limit, "offset": offset}
    if not params["q"]:
        return {"query": q, "count": 0, "offset": offset, "results": []}

    count = db.execute(
        text(
            "SELECT count(*) FROM bible_verses "
            "WHERE tsv @@ websearch_to_tsquery('english', :q)"
        ),
        params,
    ).scalar()

    rows = db.execute(
        text(
            "SELECT s.book_slug, s.chapter_num, s.verse_num, s.text, "
            "       ts_headline('english', s.text, "
            "                   websearch_to_tsquery('english', :q), "
            "                   'StartSel=[[HL]], StopSel=[[/HL]], HighlightAll=true'"
            "       ) AS marked "
            "FROM ("
            "  SELECT book_slug, chapter_num, verse_num, text, id "
            "  FROM bible_verses "
            "  WHERE tsv @@ websearch_to_tsquery('english', :q) "
            "  ORDER BY ts_rank_cd(tsv, websearch_to_tsquery('english', :q)) DESC, id "
            "  LIMIT :limit OFFSET :offset"
            ") s"
        ),
        params,
    ).mappings().all()

    return {
        "query": q,
        "count": count,
        "offset": offset,
        "results": [dict(r) for r in rows],
    }


@router.get("/chapter/{book}/{chapter}")
async def get_chapter(
    book: str,
    chapter: int,
    user: models.User = Depends(get_current_user),
):
    url = f"https://thedouayrheims.com/api/chapter/{book}/{chapter}"

    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(url, headers=UPSTREAM_HEADERS, timeout=20)
    except Exception as e:
        # A network-level failure (DNS, TLS, timeout) never reached the
        # upstream at all. Surface it rather than reporting a generic 503,
        # so the cause is visible in the logs instead of guessed at.
        print(f"[bible] request failed for {url}: {type(e).__name__}: {e}", flush=True)
        raise HTTPException(
            status_code=503,
            detail=f"Could not reach the scripture source ({type(e).__name__})",
        )

    if response.status_code == 404:
        raise HTTPException(
            status_code=404, detail=f"Book '{book}' chapter {chapter} not found"
        )

    if response.status_code != 200:
        # Previously every non-200 collapsed into the same opaque 503,
        # which hid whether the upstream was blocking (403), rate limiting
        # (429), or erroring (5xx). Log and pass the real status through.
        body = response.text[:200]
        print(
            f"[bible] upstream returned {response.status_code} for {url}: {body}",
            flush=True,
        )
        raise HTTPException(
            status_code=503,
            detail=f"Scripture source returned {response.status_code}",
        )

    try:
        data = response.json()
    except Exception as e:
        print(f"[bible] bad JSON from {url}: {type(e).__name__}: {e}", flush=True)
        raise HTTPException(status_code=503, detail="Scripture source returned invalid data")

    verses = []
    for v in data.get("verses", []):
        verses.append({
            "verse": v["verse"],
            "text": strip_markup(v["text"])
        })

    return {
        "book": book,
        "book_title": data.get("book_title", ""),
        "chapter": chapter,
        "verse_count": data.get("verse_count", len(verses)),
        "verses": verses
    }
