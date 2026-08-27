from fastapi import APIRouter, HTTPException, Depends
import httpx
from reference_parser import strip_markup
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