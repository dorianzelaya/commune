#!/usr/bin/env bash
# Cross-device state sync for Commune. Writes five complete files.
# Run from the repo root.
set -euo pipefail

[ -d backend ] && [ -d frontend ] || { echo "run this from the repo root"; exit 1; }

mkdir -p "$(dirname backend/models.py)"
cat > backend/models.py <<'CLAUDE_FILE_EOF'
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, Boolean, JSON
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DailyContent(Base):
    __tablename__ = "daily_content"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, unique=True, index=True, nullable=False)
    liturgical_season = Column(String, nullable=True)
    # Derived in services.liturgical_color, not supplied by the calendar API.
    liturgical_color = Column(String, nullable=True)
    first_reading_ref = Column(String, nullable=True)
    first_reading_text = Column(String, nullable=True)
    psalm_ref = Column(String, nullable=True)
    psalm_text = Column(String, nullable=True)
    second_reading_ref = Column(String, nullable=True)
    second_reading_text = Column(String, nullable=True)
    gospel_ref = Column(String, nullable=True)
    gospel_text = Column(String, nullable=True)
    saint_name = Column(String, nullable=True)
    saint_type = Column(String, nullable=True)
    saint_description = Column(String, nullable=True)
    saint_quote = Column(String, nullable=True)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())

class ScripturePassage(Base):
    __tablename__ = "scripture_passages"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)
    book = Column(String, nullable=False)
    chapter = Column(Integer, nullable=False)
    verse_start = Column(Integer, nullable=False)
    verse_end = Column(Integer, nullable=False)
    reference = Column(String, nullable=False)
    text = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StrugglePrayer(Base):
    __tablename__ = "struggle_prayers"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)
    prayer_name = Column(String, nullable=False)
    attribution = Column(String, nullable=True)
    text = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StruggleSaint(Base):
    __tablename__ = "struggle_saints"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)
    saint_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StruggleBiblicalFigure(Base):
    __tablename__ = "struggle_biblical_figures"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)
    figure_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    # book_slug and chapter match the Bible reader's URL scheme so the
    # frontend can link directly: /bible -> testament -> book -> chapter.
    book_slug = Column(String, nullable=False)
    chapter = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                     index=True, nullable=False)
    date = Column(String, index=True, nullable=False)
    text = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserState(Base):
    """
    One row per user holding the small bag of per-user settings and
    progress that used to live only in the browser's localStorage, which
    is per-device by definition: saved verses, saved prayers, rosary
    progress, Bible reader position and the pinned theme colour.

    Stored as a single JSON blob rather than a column per key. The keys
    are a UI concern that changes as pages change, and a blob avoids a
    schema migration every time one is added. The server validates the
    key names and the overall size but does not interpret the values.

    Writes are last-one-wins. That is fine for one person moving between
    their own phone and laptop, and wrong for two people editing at once,
    which is not a case this app has.
    """
    __tablename__ = "user_state"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                     primary_key=True)
    data = Column(JSON, nullable=False, default=dict)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(),
                        onupdate=func.now())

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                     index=True, nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Fast lookup of one user's entries, newest first
Index("ix_journal_user_date", JournalEntry.user_id, JournalEntry.date)
CLAUDE_FILE_EOF
echo '  wrote backend/models.py'

mkdir -p "$(dirname backend/routers/user_routes.py)"
cat > backend/routers/user_routes.py <<'CLAUDE_FILE_EOF'
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
CLAUDE_FILE_EOF
echo '  wrote backend/routers/user_routes.py'

mkdir -p "$(dirname frontend/src/utils/syncedState.js)"
cat > frontend/src/utils/syncedState.js <<'CLAUDE_FILE_EOF'
// Cross-device sync for the handful of localStorage keys that represent
// the user rather than the device.
//
// localStorage is per-device by definition, so saved verses on the phone
// were invisible on the laptop and vice versa. The server now holds one
// JSON blob per user; this module copies it down at login and pushes it
// back up when it changes.
//
// WHY THE PAGES DON'T KNOW ABOUT ANY OF THIS
//
// Every page still reads and writes plain localStorage exactly as before.
// Hydration happens inside the window AuthProvider already blocks on
// (ProtectedRoute renders null while `loading` is true), so by the time a
// page mounts, localStorage is already correct and its useState
// initialisers see the right values. Not one page file changed.
//
// WHY VALUES STAY AS RAW STRINGS
//
// localStorage holds strings. We pass them through untouched rather than
// parsing and re-serialising. It means this module never has to know the
// shape of a saved verse or a read-chapters map, so a page can change its
// own format without breaking sync, and a round trip can't quietly
// reformat a value. The cost is JSON-inside-JSON in the database column,
// which is ugly to read by hand and worth it.
//
// CONFLICTS
//
// Last write wins, and the server wins at login. For one person moving
// between their own devices that is right. It would be wrong for two
// people editing at once, which is not a case this app has. The one
// genuine hazard is the very first sync: see hydrate() below.

import { authFetch } from '../api'

// Must match SYNCED_KEYS in backend/routers/user_routes.py. The server
// rejects anything else, so adding a key here alone will 400.
export const SYNCED_KEYS = [
  'saved_verses',
  'saved_prayers',
  'rosary_mystery',
  'rosary_step',
  'bible_last_read',
  'bible_book',
  'bible_chapter',
  'bible_testament',
  'bible_read_chapters',
  'theme_mode',
]

// Fired after server state has been written into localStorage, so a
// component that already read a key at mount can re-read it. Only
// LiturgicalTheme needs this today, because it mounts outside
// ProtectedRoute and therefore before hydration.
export const SYNC_EVENT = 'synced:applied'

const POLL_MS = 5000
const REQUEST_TIMEOUT_MS = 8000

let lastPushed = null
let timer = null
let listening = false

function snapshot() {
  const out = {}
  for (const key of SYNCED_KEYS) {
    const value = localStorage.getItem(key)
    if (value !== null) out[key] = value
  }
  return out
}

// Abort rather than hang. Hydration sits in front of the whole app, so a
// stalled request here would leave the user staring at a blank screen.
async function withTimeout(path, options = {}) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await authFetch(path, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

function applyServerState(data) {
  for (const key of SYNCED_KEYS) {
    const value = data[key]
    // Only strings. A non-string here means the row was written by
    // something other than this module, and guessing at it would be worse
    // than leaving the device's own value alone.
    if (typeof value === 'string') {
      localStorage.setItem(key, value)
    } else if (!(key in data)) {
      // Absent on the server means the user cleared it elsewhere.
      localStorage.removeItem(key)
    }
  }
  window.dispatchEvent(new Event(SYNC_EVENT))
}

async function push(options = {}) {
  const current = snapshot()
  const serialized = JSON.stringify(current)

  try {
    const res = await withTimeout('/auth/state', {
      method: 'PUT',
      json: { data: current },
      ...options,
    })
    if (res.ok) lastPushed = serialized
  } catch {
    // Offline, or the tab is going away. localStorage still holds the
    // change, so the next successful push carries it.
  }
}

/**
 * Copy server state down into localStorage. Resolves even on failure:
 * sync is a convenience and must never be able to block the app.
 *
 * THE FIRST-SYNC HAZARD
 *
 * If the user has never synced, the server returns data: null, which is
 * deliberately distinct from an empty object. null means "seed me from
 * this device"; {} would mean "this user has explicitly cleared
 * everything", and treating the two alike would wipe whatever was on
 * whichever device happened to log in first.
 *
 * What this cannot do is merge. If the phone and the laptop both have
 * saved verses before the first sync, whichever opens first seeds the
 * server and the other is overwritten.
 */
export async function hydrate() {
  if (!localStorage.getItem('token')) return

  try {
    const res = await withTimeout('/auth/state')
    if (!res.ok) return

    const { data } = await res.json()

    if (data === null || data === undefined) {
      await push()
      return
    }

    applyServerState(data)
    lastPushed = JSON.stringify(snapshot())
  } catch {
    // Offline or the request timed out. The device keeps using its own
    // values and the next login tries again.
  }
}

function flush() {
  if (JSON.stringify(snapshot()) !== lastPushed) {
    // keepalive lets the request outlive the page during pagehide.
    push({ keepalive: true })
  }
}

/**
 * Watch for local changes and push them.
 *
 * Polling a snapshot rather than intercepting every write: there are a
 * dozen setItem call sites across six pages, and a diff that cannot miss
 * one is better than a wrapper on each that can. Nothing is sent while
 * nothing changes, so an idle app makes no requests.
 */
export function start() {
  if (timer) return

  timer = setInterval(() => {
    if (JSON.stringify(snapshot()) !== lastPushed) push()
  }, POLL_MS)

  if (!listening) {
    // Covers the cases the interval would lose: switching away from the
    // app on a phone, and closing the tab.
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibility)
    listening = true
  }
}

function onVisibility() {
  if (document.visibilityState === 'hidden') flush()
}

export function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (listening) {
    window.removeEventListener('pagehide', flush)
    document.removeEventListener('visibilitychange', onVisibility)
    listening = false
  }
  lastPushed = null
}

/**
 * Remove synced keys on logout, so the next person to log in on this
 * device does not inherit the previous one's saved verses and progress.
 * Their own state comes back down at their next login.
 */
export function clearLocal() {
  for (const key of SYNCED_KEYS) localStorage.removeItem(key)
}
CLAUDE_FILE_EOF
echo '  wrote frontend/src/utils/syncedState.js'

mkdir -p "$(dirname frontend/src/context/AuthContext.jsx)"
cat > frontend/src/context/AuthContext.jsx <<'CLAUDE_FILE_EOF'
import { createContext, useContext, useState, useEffect } from 'react'
import API_URL from '../config'
import * as syncedState from '../utils/syncedState'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Resolve the logged-in user whenever we hold a token.
  // Without this, `user` stayed null forever and the account card
  // fell back to a placeholder name.
  useEffect(() => {
    let cancelled = false

    async function loadUser() {
      const saved = localStorage.getItem('token')

      if (!saved) {
        if (!cancelled) {
          setUser(null)
          setToken(null)
          setLoading(false)
        }
        return
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${saved}` },
        })

        if (cancelled) return

        if (res.ok) {
          setUser(await res.json())
          setToken(saved)

          // Pull this user's cross-device state down BEFORE loading
          // finishes. ProtectedRoute renders null while loading, so every
          // page mounts afterwards and its useState initialisers read
          // localStorage once it is already correct. hydrate() never
          // throws and times itself out, so a sync problem cannot leave
          // the app stuck on a blank screen.
          await syncedState.hydrate()
          syncedState.start()
        } else if (res.status === 401) {
          // Token expired or invalid — clear it so the user is sent to login
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
          syncedState.stop()
          syncedState.clearLocal()
        }
      } catch {
        // Network failure: keep the token, just leave user unresolved
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadUser()
    return () => { cancelled = true }
  }, [token])

  function login(newToken) {
    localStorage.setItem('token', newToken)
    setToken(newToken)   // triggers the effect above, which fetches the user
    setLoading(true)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    // Stop pushing, then drop this user's synced keys so the next person
    // to log in on this device does not inherit them. Their copy is on
    // the server and comes back at their next login.
    syncedState.stop()
    syncedState.clearLocal()
  }

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
CLAUDE_FILE_EOF
echo '  wrote frontend/src/context/AuthContext.jsx'

mkdir -p "$(dirname frontend/src/components/LiturgicalTheme.jsx)"
cat > frontend/src/components/LiturgicalTheme.jsx <<'CLAUDE_FILE_EOF'
import { useEffect } from 'react'
import { authFetch } from '../api'
import { getLocalDateKey } from '../utils/dateKey'
import { SYNC_EVENT } from '../utils/syncedState'

const VALID = ['green', 'violet', 'white', 'red', 'rose', 'crimson', 'blue']

/**
 * Sets data-color on <html>, which is all the CSS needs to swap the page
 * background. Renders nothing.
 *
 * Mode lives in localStorage under theme_mode: either a fixed colour from
 * VALID, or 'season' to follow the liturgical calendar. Default is crimson,
 * the app's own identity, so a new install looks like the app rather than
 * like whatever the calendar happens to be that week. Following the season
 * is opt-in from Profile.
 *
 * In season mode it reuses cached_home_data, the same cache the home screen
 * fills, so following the calendar costs no extra request on any day the
 * home screen has already loaded. If that cache is missing or from another
 * day it fetches once and writes the same key, so the two never diverge.
 *
 * This component mounts outside ProtectedRoute, so it runs BEFORE login
 * hydrates cross-device state. It therefore re-resolves on SYNC_EVENT,
 * which is what makes a theme picked on another device take effect here
 * without a reload.
 */
function LiturgicalTheme() {
  useEffect(() => {
    let cancelled = false

    function apply(color) {
      if (!cancelled && color) document.documentElement.dataset.color = color
    }

    function resolve() {
      const mode = localStorage.getItem('theme_mode') || 'crimson'

      if (VALID.includes(mode)) {
        apply(mode)
        return
      }

      const today = getLocalDateKey()

      try {
        const cached = JSON.parse(localStorage.getItem('cached_home_data') || 'null')
        if (cached && cached.date === today && cached.liturgical_color) {
          apply(cached.liturgical_color)
          return
        }
      } catch {
        // Corrupt cache is not worth failing over; fall through and refetch.
      }

      authFetch(`/readings/today?date=${today}`)
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          if (!data) return
          localStorage.setItem('cached_home_data', JSON.stringify(data))
          apply(data.liturgical_color)
        })
        .catch(() => {
          // Offline or signed out. The default crimson in :root still applies.
        })
    }

    resolve()
    window.addEventListener(SYNC_EVENT, resolve)

    // One cleanup for every path. The earlier version returned early from
    // the fixed-colour and cached-season branches, which left the listener
    // attached and accumulating on every remount.
    return () => {
      cancelled = true
      window.removeEventListener(SYNC_EVENT, resolve)
    }
  }, [])

  return null
}

export default LiturgicalTheme
CLAUDE_FILE_EOF
echo '  wrote frontend/src/components/LiturgicalTheme.jsx'

python3 -c "import py_compile; [py_compile.compile(f, doraise=True) for f in ['backend/models.py', 'backend/routers/user_routes.py']]"
echo
echo "all five files written, python compiles clean"