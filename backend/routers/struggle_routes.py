from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import ScripturePassage, StrugglePrayer, StruggleSaint, StruggleBiblicalFigure
from auth import get_current_user
import models
import random

router = APIRouter(prefix="/struggle", tags=["struggle"])

CRISIS_CATEGORIES = {"Despair"}

CRISIS_NOTE = (
    "If you are in crisis or experiencing thoughts of self-harm, "
    "please reach out to the 988 Suicide and Crisis Lifeline by calling or texting 988. "
    "You may also speak with a priest or trusted person in your life."
)


@router.post("/search")
def search_struggle(
    payload: dict,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    category = payload.get("category", "").strip()
    if not category:
        raise HTTPException(status_code=400, detail="Category is required")

    passages = db.query(ScripturePassage).filter(
        ScripturePassage.category == category
    ).all()

    if not passages:
        raise HTTPException(status_code=404, detail=f"No passages found for: {category}")

    # Return the whole pool pre-shuffled so the frontend can cycle through
    # every verse without a second round trip.
    shuffled_passages = random.sample(passages, len(passages))

    prayer = db.query(StrugglePrayer).filter(
        StrugglePrayer.category == category
    ).first()

    saint = db.query(StruggleSaint).filter(
        StruggleSaint.category == category
    ).first()

    figure = db.query(StruggleBiblicalFigure).filter(
        StruggleBiblicalFigure.category == category
    ).first()

    return {
        "category": category,
        "passages": [
            {"reference": p.reference, "text": p.text}
            for p in shuffled_passages
        ],
        "saint": {
            "name": saint.saint_name,
            "description": saint.description,
        } if saint else None,
        "figure": {
            "name": figure.figure_name,
            "description": figure.description,
            "book_slug": figure.book_slug,
            "chapter": figure.chapter,
        } if figure else None,
        "prayer": {
            "name": prayer.prayer_name,
            "attribution": prayer.attribution,
            "text": prayer.text,
        } if prayer else None,
        "crisis_note": CRISIS_NOTE if category in CRISIS_CATEGORIES else None,
    }