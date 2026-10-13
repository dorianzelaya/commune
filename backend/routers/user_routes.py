import json

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
import models

# Same prefix as auth_routes — FastAPI allows multiple routers to share one.
router = APIRouter(prefix="/auth", tags=["auth"])


class MeOut(BaseModel):
    id: int
    first_name: str
    email: str

    class Config:
        from_attributes = True


@router.get("/me", response_model=MeOut)
def read_me(user: models.User = Depends(get_current_user)):
    """Return the logged-in user. Used by the frontend to populate the
    account card, which previously always showed a placeholder."""
    return user


# The only keys the client may sync. An allowlist rather than "whatever the
# client sends" because this endpoint is user-writable storage: without it,
# anyone with a login could park arbitrary data in the database under any
# name they liked. Adding a key here is the deliberate act of deciding that
# it should follow the user across devices.
#
# Deliberately NOT synced: "token" (auth, must stay per-device) and
# "cached_home_data" (a cache keyed on today's date, rebuilt on demand).
SYNCED_KEYS = {
    "saved_verses",
    "saved_prayers",
    "rosary_mystery",
    "rosary_step",
    "bible_last_read",
    "bible_book",
    "bible_chapter",
    "bible_testament",
    "bible_read_chapters",
    "theme_mode",
}

# Generous for the real payload - a few hundred saved verses and a map of
# read chapters - and small enough that the table cannot be used as free
# file storage. Measured on the serialized JSON, not the key count.
MAX_STATE_BYTES = 256 * 1024


class StateOut(BaseModel):
    # None means "this user has no saved state yet", which the client treats
    # as "seed the server from whatever is on this device" rather than as
    # "wipe this device". Those are very different things and an empty dict
    # cannot distinguish them.
    data: dict | None
    updated_at: str | None


class StateIn(BaseModel):
    data: dict


@router.get("/state", response_model=StateOut)
def read_state(
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return this user's synced state, or nulls if they have never synced.
    """
    row = db.query(models.UserState).filter(
        models.UserState.user_id == user.id
    ).first()

    if not row:
        return {"data": None, "updated_at": None}

    return {
        "data": row.data or {},
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


@router.put("/state", response_model=StateOut)
def write_state(
    payload: StateIn,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Replace this user's synced state. The client sends the whole blob, so
    a key the client omits is a key the user cleared.
    """
    unknown = sorted(set(payload.data) - SYNCED_KEYS)
    if unknown:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported state keys: {', '.join(unknown)}",
        )

    size = len(json.dumps(payload.data).encode("utf-8"))
    if size > MAX_STATE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"State is {size} bytes, limit is {MAX_STATE_BYTES}",
        )

    row = db.query(models.UserState).filter(
        models.UserState.user_id == user.id
    ).first()

    if row:
        row.data = payload.data
    else:
        row = models.UserState(user_id=user.id, data=payload.data)
        db.add(row)

    db.commit()
    db.refresh(row)

    return {
        "data": row.data or {},
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }
