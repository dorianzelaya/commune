from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date as date_cls
import pytz
import httpx
import re
from database import get_db
from services import fetch_daily_content
from auth import get_current_user
from saint_titles import lookup_title
import models

router = APIRouter(prefix="/readings", tags=["readings"])

WIKI_HEADERS = {
    "User-Agent": "Commune Catholic App/1.0 (https://catholic-companion-production.up.railway.app; contact via github.com/dorianzelaya)",
    "Accept": "application/json",
}

WIKI_API = "https://en.wikipedia.org/w/api.php"


def get_us_eastern_date():
    eastern = pytz.timezone('America/New_York')
    return datetime.now(eastern).date()


def resolve_target_date(date_param: str | None) -> date_cls:
    """
    Decide which liturgical day to serve.

    The client sends its own LOCAL date as ?date=YYYY-MM-DD. This matters
    because the liturgical day should match the day the user is actually
    living, not a fixed US coast. Previously the server always used US
    Eastern, so a Pacific user rolled over to tomorrow's readings roughly
    three hours early every night, and — because the frontend cache keys on
    local date while the server keyed on Eastern — the two could disagree
    and serve mismatched days.

    If the param is missing or malformed, fall back to US Eastern exactly
    as before. That fallback is what keeps every older client, and any
    direct call to /readings/today with no date, working unchanged.

    A malformed date never raises: it degrades to the Eastern default. A
    bad query string should not turn today's readings into an error page.
    """
    if not date_param:
        return get_us_eastern_date()

    try:
        return datetime.strptime(date_param.strip(), "%Y-%m-%d").date()
    except (ValueError, AttributeError):
        return get_us_eastern_date()


@router.get("/today")
async def get_today_readings(
    date: str | None = None,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    target = resolve_target_date(date)
    today_str = target.strftime("%Y-%m-%d")

    cached = db.query(models.DailyContent).filter(
        models.DailyContent.date == today_str
    ).first()

    if cached:
        return {
            "date": cached.date,
            "liturgical_season": cached.liturgical_season,
            "liturgical_color": cached.liturgical_color,
            "first_reading_ref": cached.first_reading_ref,
            "first_reading_text": cached.first_reading_text,
            "psalm_ref": cached.psalm_ref,
            "psalm_text": cached.psalm_text,
            "second_reading_ref": cached.second_reading_ref,
            "second_reading_text": cached.second_reading_text,
            "gospel_ref": cached.gospel_ref,
            "gospel_text": cached.gospel_text,
            "saint_name": cached.saint_name,
            "saint_type": cached.saint_type,
            "saint_description": cached.saint_description,
            "saint_quote": cached.saint_quote,
        }

    try:
        content = await fetch_daily_content(target)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Could not fetch readings: {str(e)}")

    db_content = models.DailyContent(
        date=content["date"],
        liturgical_season=content["liturgical_season"],
        liturgical_color=content["liturgical_color"],
        first_reading_ref=content["first_reading_ref"],
        first_reading_text=content["first_reading_text"],
        psalm_ref=content["psalm_ref"],
        psalm_text=content["psalm_text"],
        second_reading_ref=content["second_reading_ref"],
        second_reading_text=content["second_reading_text"],
        gospel_ref=content["gospel_ref"],
        gospel_text=content["gospel_text"],
        saint_name=content["saint_name"],
        saint_type=content["saint_type"],
        saint_description=content["saint_description"],
        saint_quote=content.get("saint_quote"),
    )

    db.add(db_content)
    db.commit()
    db.refresh(db_content)

    return content


def clean_saint_name(name: str) -> str:
    """'Saint Ignatius of Loyola, Priest' -> 'Ignatius of Loyola'"""
    n = re.sub(r'^(Saint|St\.?|Blessed|Bl\.?|Venerable)\s+', '', name.strip(), flags=re.IGNORECASE)
    n = re.sub(r',.*$', '', n)          # drop ", Priest" / ", Bishop and Martyr"
    n = re.sub(r'\s+', ' ', n)
    return n.strip()


def title_candidates(clean_name: str):
    """Direct article titles to try, in order of preference."""
    return [
        clean_name,                    # Ignatius of Loyola
        f"Saint {clean_name}",         # Saint Martha
        f"{clean_name} (saint)",       # Disambiguated saints
    ]


def score_title(title, clean_name, name_parts):
    t = title.lower()
    cn = clean_name.lower()

    bad_words = ['painting', 'church', 'cathedral', 'basilica', 'altarpiece',
                 '(film)', 'parish', 'school', 'university', 'hospital', 'island',
                 'conspiracy', 'order of', 'society of', 'history of']
    if any(b in t for b in bad_words):
        return -1

    if not name_parts or not all(part in t for part in name_parts):
        return -1

    score = 0
    if t == cn:
        score += 100
    if t.startswith(cn):
        score += 50
    if 'saint' in t or t.startswith('st '):
        score += 20
    score += max(0, 40 - len(title))
    if ' and ' in t:
        score -= 30
    return score


def extract_page(content_data):
    """Pull (extract, image) out of a Wikipedia content response, or (None, None)."""
    pages = content_data.get("query", {}).get("pages", {})
    if not pages:
        return None, None
    page = list(pages.values())[0]
    if "missing" in page:
        return None, None
    extract = page.get("extract")
    if not extract or "may refer to:" in extract:
        return None, None
    image = page.get("original", {}).get("source") if page.get("original") else None
    return extract.strip(), image


async def fetch_page(client, title):
    params = {
        "action": "query",
        "titles": title,
        "prop": "extracts|pageimages",
        "exintro": "true",
        "explaintext": "true",
        "piprop": "original",
        "redirects": 1,
        "format": "json",
    }
    resp = await client.get(WIKI_API, params=params, headers=WIKI_HEADERS, timeout=20)
    if resp.status_code != 200:
        return None, None
    return extract_page(resp.json())


@router.get("/saint-wiki")
async def get_saint_wiki(
    name: str,
    description: str = "",
    debug: bool = False,
    user: models.User = Depends(get_current_user),
):
    """Look up a saint on Wikipedia by direct article title first,
    falling back to search only if that fails."""

    trace = {}
    clean = clean_saint_name(name)
    trace["clean_name"] = clean
    name_parts = [w.lower() for w in clean.split() if len(w) > 3]
    trace["name_parts"] = name_parts

    # Explicit mapping wins over any guessing. These are the days where the
    # liturgical name simply is not the Wikipedia title, so they are stated
    # outright rather than inferred.
    explicit = lookup_title(name)
    trace["explicit_title"] = explicit

    def out(text, image, reason=None):
        res = {"text": text, "image": image}
        if debug:
            if reason:
                trace["result"] = reason
            res["debug"] = trace
        return res

    async with httpx.AsyncClient(follow_redirects=True) as client:
        # 0. Explicit mapping, if this day has one
        if explicit:
            try:
                text, image = await fetch_page(client, explicit)
                if text:
                    return out(text, image, f"explicit: {explicit}")
            except Exception as e:
                trace["explicit_error"] = f"{type(e).__name__}: {e}"

        # 1. Direct title lookup — this is how Wikipedia URLs actually work
        trace["tried_titles"] = []
        for candidate in title_candidates(clean):
            trace["tried_titles"].append(candidate)
            try:
                text, image = await fetch_page(client, candidate)
            except Exception as e:
                trace[f"error_{candidate}"] = f"{type(e).__name__}: {e}"
                continue
            if text:
                return out(text, image, f"direct hit: {candidate}")

        # 2. Search fallback — name only, no description words
        search_params = {
            "action": "query",
            "list": "search",
            "srsearch": f'"{clean}"',
            "format": "json",
            "srlimit": 8,
        }
        try:
            search_resp = await client.get(WIKI_API, params=search_params, headers=WIKI_HEADERS, timeout=20)
        except Exception as e:
            return out(None, None, f"search threw: {type(e).__name__}: {e}")

        if search_resp.status_code != 200:
            return out(None, None, f"search status {search_resp.status_code}")

        results = search_resp.json().get("query", {}).get("search", [])
        trace["result_titles"] = [r["title"] for r in results]

        best, best_score = None, 0
        scores = {}
        for r in results:
            s = score_title(r["title"], clean, name_parts)
            scores[r["title"]] = s
            if s > best_score:
                best_score, best = s, r
        trace["scores"] = scores

        # No fallback to an unscored result — wrong info is worse than none
        if not best:
            return out(None, None, "no acceptable search match")

        trace["chosen_title"] = best["title"]
        try:
            text, image = await fetch_page(client, best["title"])
        except Exception as e:
            return out(None, None, f"content threw: {type(e).__name__}: {e}")

        if not text:
            return out(None, None, "chosen page had no extract")

        return out(text, image, f"search hit: {best['title']}")