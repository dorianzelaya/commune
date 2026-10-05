import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import BIBLE_BOOKS from '../data/bible'
import { authFetch } from '../api'
import GLOSSARY from '../data/glossary'
import ThemePicker from '../components/ThemePicker'

function getTodayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daysBetween(fromStr, toStr) {
  const [y1, m1, d1] = fromStr.split('-').map(Number)
  const [y2, m2, d2] = toStr.split('-').map(Number)
  const a = new Date(y1, m1 - 1, d1)
  const b = new Date(y2, m2 - 1, d2)
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

const STREAK_VERSION = 2

function updateStreak() {
  const today = getTodayStr()
  const fresh = { v: STREAK_VERSION, count: 1, lastDate: today }
  try {
    const raw = localStorage.getItem('prayer_streak')
    if (!raw) {
      localStorage.setItem('prayer_streak', JSON.stringify(fresh))
      return fresh
    }
    const stored = JSON.parse(raw)
    if (stored.v !== STREAK_VERSION) {
      localStorage.setItem('prayer_streak', JSON.stringify(fresh))
      return fresh
    }
    const { count, lastDate } = stored
    if (lastDate === today) return stored
    const diff = daysBetween(lastDate, today)
    if (diff <= 0) {
      const resynced = { v: STREAK_VERSION, count, lastDate: today }
      localStorage.setItem('prayer_streak', JSON.stringify(resynced))
      return resynced
    }
    const newCount = diff === 1 ? count + 1 : 1
    const updated = { v: STREAK_VERSION, count: newCount, lastDate: today }
    localStorage.setItem('prayer_streak', JSON.stringify(updated))
    return updated
  } catch {
    localStorage.setItem('prayer_streak', JSON.stringify(fresh))
    return fresh
  }
}

function resetStreak() {
  const fresh = { v: STREAK_VERSION, count: 1, lastDate: getTodayStr() }
  localStorage.setItem('prayer_streak', JSON.stringify(fresh))
  return fresh
}

function getSavedPrayers() {
  try {
    return JSON.parse(localStorage.getItem('saved_prayers') || '[]')
  } catch {
    return []
  }
}

function removeSavedPrayer(name) {
  const saved = getSavedPrayers().filter(p => p.name !== name)
  localStorage.setItem('saved_prayers', JSON.stringify(saved))
  return saved
}

function getSavedVerses() {
  try {
    return JSON.parse(localStorage.getItem('saved_verses') || '[]')
  } catch {
    return []
  }
}

function removeSavedVerse(id) {
  const saved = getSavedVerses().filter(v => v.id !== id)
  localStorage.setItem('saved_verses', JSON.stringify(saved))
  return saved
}

function getReadChapters() {
  try {
    return JSON.parse(localStorage.getItem('bible_read_chapters') || '{}')
  } catch {
    return {}
  }
}

function formatJournalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date()
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  if (isToday) return 'Today'
  return date.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function BackButton({ onClick }) {
  return <button className="back-button" onClick={onClick}>← Back</button>
}

// Title/eyebrow shown per view. 'main' has no back button; everything
// else does. Centralized so the header is ONE piece of JSX instead of
// being duplicated (and re-mounted) inside every branch.
const VIEW_META = {
  main:          { eyebrow: 'Your Account',  title: 'Profile' },
  journal:       { eyebrow: 'Profile',       title: 'Prayer Journal' },
  'reading-plan':{ eyebrow: 'Profile',       title: 'Reading Plan' },
  saved:         { eyebrow: 'Profile',       title: 'My Prayers' },
  verses:        { eyebrow: 'Profile',       title: 'My Verses' },
  glossary:      { eyebrow: 'Profile',       title: 'Glossary' },
  'prayer-detail': { eyebrow: 'My Prayers',  title: null }, // title = prayer name
}

function Profile() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [streak, setStreak] = useState({ count: 0, lastDate: null })
  const [savedPrayers, setSavedPrayers] = useState([])
  const [savedVerses, setSavedVerses] = useState([])
  const [readChapters, setReadChapters] = useState({})
  const [view, setView] = useState('main')
  const [selectedPrayer, setSelectedPrayer] = useState(null)
  const [glossaryQuery, setGlossaryQuery] = useState('')

  const [journal, setJournal] = useState([])
  const [journalText, setJournalText] = useState('')
  const [journalLoading, setJournalLoading] = useState(false)
  const [journalError, setJournalError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setStreak(updateStreak())
    setSavedPrayers(getSavedPrayers())
    setSavedVerses(getSavedVerses())
    setReadChapters(getReadChapters())
  }, [])

  useEffect(() => {
    function onReset() {
      setView('main')
      setSelectedPrayer(null)
      setGlossaryQuery('')
    }
    window.addEventListener('profile:reset', onReset)
    return () => window.removeEventListener('profile:reset', onReset)
  }, [])

  async function loadJournal() {
    setJournalLoading(true)
    setJournalError('')
    try {
      const res = await authFetch('/journal')
      if (res.status === 401) throw new Error('Your session expired. Please log in again.')
      if (!res.ok) throw new Error('Could not load your journal')
      setJournal(await res.json())
    } catch (err) {
      setJournalError(err.message)
    } finally {
      setJournalLoading(false)
    }
  }

  async function handleSaveEntry() {
    const text = journalText.trim()
    if (!text || saving) return
    setSaving(true)
    setJournalError('')
    try {
      const res = await authFetch('/journal', {
        method: 'POST',
        json: { text, date: getTodayStr() },
      })
      if (res.status === 401) throw new Error('Your session expired. Please log in again.')
      if (!res.ok) throw new Error('Could not save your entry')
      const created = await res.json()
      setJournal(prev => [created, ...prev])
      setJournalText('')
    } catch (err) {
      setJournalError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteEntry(id) {
    const previous = journal
    setJournal(prev => prev.filter(e => e.id !== id))
    try {
      const res = await authFetch(`/journal/${id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error()
    } catch {
      setJournal(previous)
      setJournalError('Could not delete that entry')
    }
  }

  useEffect(() => {
    if (view === 'journal') loadJournal()
  }, [view])

  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [view, selectedPrayer])

  const initial = user?.first_name
    ? user.first_name[0].toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : '?'

  const displayName = user?.first_name || user?.email || 'Loading...'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleResetStreak() {
    setStreak(resetStreak())
  }

  function handleUnsave(name) {
    const updated = removeSavedPrayer(name)
    setSavedPrayers(updated)
    if (selectedPrayer?.name === name) setSelectedPrayer(null)
  }

  function handleUnsaveVerse(id) {
    setSavedVerses(removeSavedVerse(id))
  }

  const allBooks = [...BIBLE_BOOKS.OT, ...BIBLE_BOOKS.NT]
  const totalChaptersRead = Object.values(readChapters).reduce((sum, chs) => sum + chs.length, 0)
  const hasStarted = totalChaptersRead > 0

  // Which view are we effectively on, for header purposes
  const activeView = selectedPrayer ? 'prayer-detail' : view
  const meta = VIEW_META[activeView] || VIEW_META.main
  const headerTitle = activeView === 'prayer-detail' ? selectedPrayer?.name : meta.title

  function handleBack() {
    if (selectedPrayer) {
      setSelectedPrayer(null)
    } else {
      setView('main')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        {activeView !== 'main' && <BackButton onClick={handleBack} />}
        <p className="readings-eyebrow">{meta.eyebrow}</p>
        {activeView === 'prayer-detail' ? (
          <div className="prayer-header-row">
            <h1 className="struggle-category-title">{headerTitle}</h1>
            <button
              className="prayer-bookmark-btn saved"
              onClick={() => handleUnsave(selectedPrayer.name)}
              aria-label="Remove from saved prayers"
            >
              ★
            </button>
          </div>
        ) : (
          <h1 className="profile-title">{headerTitle}</h1>
        )}
        {activeView === 'reading-plan' && hasStarted && (
          <p className="profile-reading-total">{totalChaptersRead} of 1,189 chapters read</p>
        )}
      </div>

      <div className="page-content">

        {/* ---------- Prayer detail ---------- */}
        {activeView === 'prayer-detail' && (
          <>
            {selectedPrayer.image && (
              <div className="prayer-image-block">
                <img src={selectedPrayer.image} alt={selectedPrayer.name} className="prayer-image" />
                {selectedPrayer.caption && <p className="prayer-image-caption">{selectedPrayer.caption}</p>}
              </div>
            )}
            <div className="prayer-detail-card">
              <p className="prayer-detail-text">{selectedPrayer.text}</p>
            </div>
            {selectedPrayer.history && (
              <div className="prayer-history-card">
                <p className="prayer-history-label">About this Prayer</p>
                <p className="prayer-history-text">{selectedPrayer.history}</p>
              </div>
            )}
          </>
        )}

        {/* ---------- My Prayers ---------- */}
        {activeView === 'saved' && (
          savedPrayers.length === 0 ? (
            <div className="profile-empty">
              <p className="profile-empty-text">No saved prayers yet. Bookmark a prayer from the Prayers page by tapping the ☆ icon.</p>
            </div>
          ) : (
            <div className="prayers-items">
              {savedPrayers.map(prayer => (
                <div key={prayer.name} className="saved-prayer-row">
                  <button className="saved-prayer-name-btn" onClick={() => setSelectedPrayer(prayer)}>
                    {prayer.name}
                  </button>
                  <button
                    className="saved-prayer-unsave-btn"
                    onClick={() => handleUnsave(prayer.name)}
                    aria-label={`Remove ${prayer.name} from saved prayers`}
                  >
                    ★
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* ---------- My Verses ---------- */}
        {activeView === 'verses' && (
          savedVerses.length === 0 ? (
            <div className="profile-empty">
              <p className="profile-empty-text">No saved verses yet. Tap a verse in the Bible reader, then tap "Save Verse."</p>
            </div>
          ) : (
            <div className="prayers-items">
              {savedVerses.map(v => (
                <div key={v.id} className="saved-verse-row">
                  <div className="saved-verse-content">
                    <p className="saved-verse-text">"{v.text}"</p>
                    <p className="saved-verse-ref">{v.bookName} {v.chapter}:{v.verse}</p>
                  </div>
                  <button
                    className="saved-prayer-unsave-btn"
                    onClick={() => handleUnsaveVerse(v.id)}
                    aria-label={`Remove ${v.bookName} ${v.chapter}:${v.verse} from saved verses`}
                  >
                    ★
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* ---------- Glossary ---------- */}
        {activeView === 'glossary' && (
          <>
            <input
              className="glossary-search"
              type="text"
              placeholder="Search terms..."
              value={glossaryQuery}
              onChange={e => setGlossaryQuery(e.target.value)}
            />
            {(() => {
              const q = glossaryQuery.trim().toLowerCase()
              const results = q
                ? GLOSSARY.filter(
                    e =>
                      e.term.toLowerCase().includes(q) ||
                      e.definition.toLowerCase().includes(q)
                  )
                : GLOSSARY
              if (results.length === 0) {
                return (
                  <div className="profile-empty">
                    <p className="profile-empty-text">No terms match "{glossaryQuery}".</p>
                  </div>
                )
              }
              return (
                <div className="glossary-list">
                  {results.map(entry => (
                    <div key={entry.term} className="glossary-entry">
                      <p className="glossary-term">{entry.term}</p>
                      <p className="glossary-def">{entry.definition}</p>
                    </div>
                  ))}
                </div>
              )
            })()}
          </>
        )}

        {/* ---------- Prayer journal ---------- */}
        {activeView === 'journal' && (
          <>
            <div className="journal-compose">
              <textarea
                className="journal-input"
                placeholder="Write a prayer intention, a thanksgiving, or whatever is on your heart..."
                value={journalText}
                onChange={e => setJournalText(e.target.value)}
                rows={4}
                maxLength={5000}
              />
              <button
                className="journal-save-btn"
                onClick={handleSaveEntry}
                disabled={!journalText.trim() || saving}
              >
                {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>

            {journalError && <p className="auth-error">{journalError}</p>}
            {journalLoading && <p className="readings-loading">Loading...</p>}

            {!journalLoading && journal.length === 0 && !journalError && (
              <p className="profile-reading-prompt">
                Your journal is empty. Write your first entry above.
              </p>
            )}

            {(() => {
              const grouped = journal.reduce((acc, entry) => {
                (acc[entry.date] = acc[entry.date] || []).push(entry)
                return acc
              }, {})
              const dates = Object.keys(grouped).sort().reverse()
              return dates.map(date => (
                <div key={date} className="journal-day">
                  <p className="journal-date">{formatJournalDate(date)}</p>
                  {grouped[date].map(entry => (
                    <div key={entry.id} className="journal-entry">
                      <p className="journal-entry-text">{entry.text}</p>
                      <button
                        className="journal-delete-btn"
                        onClick={() => handleDeleteEntry(entry.id)}
                        aria-label="Delete entry"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ))
            })()}
          </>
        )}

        {/* ---------- Reading plan ---------- */}
        {activeView === 'reading-plan' && (
          <>
            {!hasStarted && (
              <p className="profile-reading-prompt">Start reading the Bible to track your progress here.</p>
            )}
            <div className="profile-reading-list">
              {allBooks.map(b => {
                const readCount = readChapters[b.slug]?.length || 0
                const pct = Math.round((readCount / b.chapters) * 100)
                const done = readCount === b.chapters
                return (
                  <div key={b.slug} className="profile-reading-item">
                    <div className="profile-reading-item-header">
                      <span className="profile-reading-book-name">{b.name}</span>
                      <span className={`profile-reading-book-count ${done ? 'done' : ''}`}>
                        {done ? '✓ Complete' : `${readCount}/${b.chapters}`}
                      </span>
                    </div>
                    <div className="profile-reading-bar-bg">
                      <div className="profile-reading-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ---------- Main profile ----------
             This block is now ALWAYS in the DOM. On every other view it is
             simply hidden with CSS (display: none), never unmounted. The
             logout button flash was caused by this card being destroyed
             and freshly re-created every time the user left and returned
             to the main view; a hidden-but-mounted node cannot do that. */}
        <div className={activeView === 'main' ? '' : 'profile-main-hidden'}>

          <div className="profile-section">
            <div className="profile-account-card">
              <div className="profile-avatar">{initial}</div>
              <div className="profile-account-info">
                <p className="profile-name">{displayName}</p>
                {user?.email && <p className="profile-email">{user.email}</p>}
              </div>
            </div>
            <button className="profile-logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>

          <p className="profile-section-label">Daily Streak</p>
          <div className="profile-section">
            <div className="profile-streak-card">
              <div className="profile-streak-flame">🔥</div>
              <div className="profile-streak-info">
                <p className="profile-streak-count">{streak.count} {streak.count === 1 ? 'day' : 'days'}</p>
                <p className="profile-streak-sub">
                  {streak.count === 1
                    ? 'You opened the app today. Keep it going!'
                    : `${streak.count} consecutive days of prayer. Well done.`}
                </p>
              </div>
            </div>
            <button className="profile-streak-reset" onClick={handleResetStreak}>
              Reset streak
            </button>
          </div>

          <p className="profile-section-label">Features</p>
          <div className="profile-section">
            <button className="profile-feature-row" onClick={() => setView('journal')}>
              <span className="profile-row-label">Prayer Journal</span>
              <span className="profile-feature-arrow">›</span>
            </button>
            <div className="profile-divider" />
            <button className="profile-feature-row" onClick={() => setView('reading-plan')}>
              <span className="profile-row-label">Reading Plan</span>
              <span className="profile-feature-arrow">›</span>
            </button>
            <div className="profile-divider" />
            <button className="profile-feature-row" onClick={() => setView('saved')}>
              <div className="profile-feature-row-left">
                <span className="profile-row-label">My Prayers</span>
                {savedPrayers.length > 0 && (
                  <span className="profile-feature-badge">{savedPrayers.length}</span>
                )}
              </div>
              <span className="profile-feature-arrow">›</span>
            </button>
            <div className="profile-divider" />
            <button className="profile-feature-row" onClick={() => setView('verses')}>
              <div className="profile-feature-row-left">
                <span className="profile-row-label">My Verses</span>
                {savedVerses.length > 0 && (
                  <span className="profile-feature-badge">{savedVerses.length}</span>
                )}
              </div>
              <span className="profile-feature-arrow">›</span>
            </button>
            <div className="profile-divider" />
            <button className="profile-feature-row" onClick={() => setView('glossary')}>
              <span className="profile-row-label">Glossary</span>
              <span className="profile-feature-arrow">›</span>
            </button>
          </div>

          <ThemePicker />

        </div>

      </div>
    </div>
  )
}

export default Profile
