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
// At login the device decides who wins, by asking whether it has changes
// the server has not seen:
//
//   clean  (local matches the last snapshot this device pushed)
//          -> pull. The server may have newer data from elsewhere.
//
//   dirty  (local differs from it)
//          -> push. Those are real changes, usually made offline, and
//             pulling would destroy them.
//
// Without that test, hydrate always pulled, so a rosary prayed offline
// was overwritten by the server's older position the next time the app
// opened online. Offline support made that path reachable and it loses
// user data, so "the server always wins" was not good enough.
//
// The last-pushed snapshot is kept in localStorage, not in memory, so it
// survives the app being closed - which is exactly when offline changes
// are made. It is device bookkeeping and is never synced.
//
// What this still cannot do is merge. If this device is dirty AND another
// device has changed something since, the dirty device wins outright.
// Fixing that needs per-key timestamps, which is not worth it for one
// person moving between their own devices.

import { authFetch } from '../api'

// Must match SYNCED_KEYS in backend/routers/user_routes.py. The server
// rejects anything else, so adding a key here alone will 400.
export const SYNCED_KEYS = [
  'language',
  'prayer_streak',
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

// Device-local bookkeeping: the snapshot this device last got onto the
// server. Deliberately NOT in SYNCED_KEYS - it describes this device's
// relationship to the server, so syncing it would be meaningless.
const LAST_PUSH_KEY = 'synced_last_push'

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
    if (res.ok) {
      lastPushed = serialized
      try {
        localStorage.setItem(LAST_PUSH_KEY, serialized)
      } catch {
        // Storage full or blocked. Sync still works; the device just
        // can't prove it is clean, so it will push next login.
      }
    }
  } catch {
    // Offline, or the tab is going away. localStorage still holds the
    // change, so the next successful push carries it.
  }
}

/**
 * Reconcile this device with the server at login. Resolves even on
 * failure: sync is a convenience and must never be able to block the app.
 *
 * THE FIRST-SYNC HAZARD
 *
 * If the user has never synced, the server returns data: null, which is
 * deliberately distinct from an empty object. null means "seed me from
 * this device"; {} would mean "this user has explicitly cleared
 * everything", and treating the two alike would wipe whatever was on
 * whichever device happened to log in first.
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

    // Does this device hold changes the server has never seen?
    let lastSynced = null
    try {
      lastSynced = localStorage.getItem(LAST_PUSH_KEY)
    } catch {
      // Unreadable storage: fall through and treat the device as clean.
    }

    if (lastSynced !== null && JSON.stringify(snapshot()) !== lastSynced) {
      // Dirty. Almost always offline changes. Keep them.
      await push()
      return
    }

    // Clean, or this device has never pushed. Take the server's copy.
    applyServerState(data)
    const settled = JSON.stringify(snapshot())
    lastPushed = settled
    try {
      localStorage.setItem(LAST_PUSH_KEY, settled)
    } catch {
      // See push().
    }
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

  // After a reload the in-memory value is gone. Recovering it from
  // storage stops the first poll from pushing state the server already
  // has, and keeps an idle app silent.
  if (lastPushed === null) {
    try {
      lastPushed = localStorage.getItem(LAST_PUSH_KEY)
    } catch {
      lastPushed = null
    }
  }

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
  // Deliberately NOT clearing lastPushed. It records what the server
  // holds, which stopping does not change. Clearing it would make a clean
  // device look dirty and push stale state over newer data at next login.
}

/**
 * Remove synced keys on logout, so the next person to log in on this
 * device does not inherit the previous one's saved verses and progress.
 * Their own state comes back down at their next login.
 */
export function clearLocal() {
  for (const key of SYNCED_KEYS) localStorage.removeItem(key)
  localStorage.removeItem(LAST_PUSH_KEY)
  lastPushed = null
}
