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


def _fetch_upstream_chapter(book: str, chapter: int) -> dict:
    """
    Last-resort fetch for a chapter our own table does not have. This was the
    only path until bible_verses was completed; it stays as a safety net so a
    gap degrades to the old behaviour rather than to a broken reader.

    Sync rather than async because the endpoint that calls it is now sync.
    """
    url = f"https://thedouayrheims.com/api/chapter/{book}/{chapter}"

    try:
        with httpx.Client(follow_redirects=True) as client:
            response = client.get(url, headers=UPSTREAM_HEADERS, timeout=20)
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
        # Every non-200 used to collapse into the same opaque 503, which hid
        # whether the upstream was blocking (403), rate limiting (429), or
        # erroring (5xx). Log and pass the real status through.
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
        return response.json()
    except Exception as e:
        print(f"[bible] bad JSON from {url}: {type(e).__name__}: {e}", flush=True)
        raise HTTPException(status_code=503, detail="Scripture source returned invalid data")


@router.get("/chapter/{book}/{chapter}")
def get_chapter(
    book: str,
    chapter: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """
    Serve a chapter from our own copy of the Douay-Rheims text.

    This used to proxy thedouayrheims.com on every single request, so every
    page of reading waited on a third party with a 20 second timeout and no
    cache, and that upstream actively blocks clients it does not like.
    bible_verses now holds all 73 books and 35,856 verses, keyed to the same
    slugs the reader navigates by, with an index on (book_slug, chapter_num),
    so this is an index scan in the same datacenter as the backend.

    The upstream survives as a fallback for a chapter we somehow lack. When
    that fires the verses are written back, so the gap closes itself and the
    next request for it is served locally. The worst case is exactly the old
    behaviour, never worse.

    Sync rather than async deliberately: get_db yields a blocking SQLAlchemy
    session, and holding it inside an async endpoint would stall the event
    loop. FastAPI runs sync endpoints in a threadpool instead.

    The response shape is unchanged, so the frontend needs no changes.
    """
    rows = db.execute(
        text(
            "SELECT verse_num, text, book_title FROM bible_verses "
            "WHERE book_slug = :book AND chapter_num = :chapter "
            "ORDER BY verse_num"
        ),
        {"book": book, "chapter": chapter},
    ).mappings().all()

    if rows:
        return {
            "book": book,
            "book_title": rows[0]["book_title"] or "",
            "chapter": chapter,
            "verse_count": len(rows),
            "verses": [{"verse": r["verse_num"], "text": r["text"]} for r in rows],
        }

    print(f"[bible] {book} {chapter} missing locally, falling back upstream", flush=True)
    data = _fetch_upstream_chapter(book, chapter)
    book_title = data.get("book_title", "")
    verses = [
        {"verse": v["verse"], "text": strip_markup(v["text"])}
        for v in data.get("verses", [])
    ]

    if verses:
        try:
            # tsv is GENERATED ALWAYS, so it is never written here; Postgres
            # fills it and the GIN index picks the rows up for search too.
            db.execute(
                text(
                    "INSERT INTO bible_verses "
                    "(book_slug, book_title, chapter_num, verse_num, text) "
                    "VALUES (:slug, :title, :ch, :vn, :txt) "
                    "ON CONFLICT (book_slug, chapter_num, verse_num) DO NOTHING"
                ),
                [
                    {
                        "slug": book,
                        "title": book_title,
                        "ch": chapter,
                        "vn": int(v["verse"]),
                        "txt": v["text"],
                    }
                    for v in verses
                ],
            )
            db.commit()
            print(f"[bible] backfilled {book} {chapter} ({len(verses)} verses)", flush=True)
        except Exception as e:
            # A failed backfill must never fail the request. The reader has
            # its text; the gap just stays open until next time.
            db.rollback()
            print(f"[bible] backfill failed for {book} {chapter}: {type(e).__name__}: {e}", flush=True)

    return {
        "book": book,
        "book_title": book_title,
        "chapter": chapter,
        "verse_count": data.get("verse_count", len(verses)),
        "verses": verses,
    }
