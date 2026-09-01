import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { authFetch } from '../api'
import BIBLE_BOOKS from '../data/bible'
import { getBookBySlug } from '../data/bible'

const CATEGORIES = {
  "Growth": [
    "Discernment", "Wisdom", "Peace", "Hope", "Knowledge"
  ],
  "Virtues": [
    "Humility", "Charity", "Patience", "Courage", "Gratitude",
    "Forgiveness", "Faith", "Fortitude", "Prudence", "Justice",
    "Temperance", "Chastity", "Generosity", "Diligence",
    "Resilience", "Discipline"
  ],
  "Emotions": [
    "Anxiety", "Fear", "Sadness", "Loneliness",
    "Grief", "Anger", "Shame"
  ],
  "Faith Struggles": [
    "Doubt", "Despair", "Feeling distant from God",
    "Temptation", "Lukewarmness"
  ],
  "Sins & Vices": [
    "Lust", "Pride", "Envy", "Gluttony",
    "Sloth", "Greed", "Wrath"
  ],
  "Life Situations": [
    "Family conflict", "Work stress", "Relationship trouble",
    "Financial worry", "Illness", "Loss", "Death of a loved one"
  ]
}

const GROUP_TINTS = {
  "Growth": "tint-growth",
  "Virtues": "tint-virtues",
  "Emotions": "tint-emotional",
  "Faith Struggles": "tint-spiritual",
  "Sins & Vices": "tint-vices",
  "Life Situations": "tint-life",
}

// Determine which testament a book slug belongs to so we can navigate
// the user into the right part of the Bible reader.
function getTestamentForSlug(slug) {
  const inOT = BIBLE_BOOKS.OT.some(b => b.slug === slug)
  return inOT ? 'OT' : 'NT'
}

function ShuffleIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="18"
      height="18"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M13 12h-2c-1 0-1.7-1.2-2.4-2.7-0.3 0.7-0.6 1.5-1 2.3 0.8 1.4 1.8 2.4 3.4 2.4h2v2l3-3-3-3v2z" />
      <path d="M5.4 6.6c0.3-0.7 0.6-1.5 1-2.2-0.8-1.4-1.9-2.4-3.4-2.4h-3v2h3c1 0 1.7 1.2 2.4 2.6z" />
      <path d="M16 3l-3-3v2h-2c-2.7 0-3.9 3-5 5.7-0.8 2.1-1.7 4.3-3 4.3h-3v2h3c2.6 0 3.8-2.8 4.9-5.6 0.9-2.2 1.8-4.4 3.1-4.4h2v2l3-3z" />
    </svg>
  )
}

function Struggle() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState('')
  const [verseIndex, setVerseIndex] = useState(0)

  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [result, loading])

  async function handleSelect(category) {
    setSelected(category)
    setLoading(true)
    setError('')
    setResult(null)
    setVerseIndex(0)

    try {
      const response = await authFetch('/struggle/search', {
        method: 'POST',
        json: { category }
      })

      if (!response.ok) throw new Error('Could not load scripture')
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleNewVerse() {
    if (!result?.passages?.length) return
    setVerseIndex(i => (i + 1) % result.passages.length)
  }

  function handleBack() {
    setResult(null)
    setSelected('')
    setError('')
    setVerseIndex(0)
  }

  // Navigate into the Bible reader at the figure's chapter. We set
  // localStorage keys the Bible reader already reads to restore position,
  // then navigate to /bible where it picks them up.
  function handleFigureLink(figure) {
    const testament = getTestamentForSlug(figure.book_slug)
    const book = getBookBySlug(figure.book_slug)
    if (!book) return
    localStorage.setItem('bible_testament', testament)
    localStorage.setItem('bible_book', figure.book_slug)
    localStorage.setItem('bible_chapter', String(figure.chapter))
    navigate('/bible')
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={handleBack} />
          <p className="readings-eyebrow">Seek</p>
          <h1 className="struggle-category-title">{selected}</h1>
        </div>
        <div className="page-content">
          <p className="readings-loading">Finding scripture...</p>
        </div>
      </div>
    )
  }

  if (result) {
    const passages = result.passages || []
    const current = passages[verseIndex]
    const hasMore = passages.length > 1

    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={handleBack} />
          <p className="readings-eyebrow">Scripture for...</p>
          <h1 className="struggle-category-title">{selected}</h1>
        </div>

        <div className="page-content">
          <div className="struggle-result-body">
            {result.crisis_note && (
              <div className="struggle-crisis">
                <p className="struggle-crisis-text">{result.crisis_note}</p>
              </div>
            )}

            <div className="struggle-section">
              <p className="struggle-section-label">Scripture</p>
              <div className="struggle-verse-slot">
                <AnimatePresence mode="wait">
                  {current && (
                    <motion.div
                      key={verseIndex}
                      className="struggle-passage"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                    >
                      <p className="struggle-ref">{current.reference}</p>
                      <p className="struggle-text">"{current.text}"</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {hasMore && (
                <button
                  className="struggle-new-verse-btn"
                  onClick={handleNewVerse}
                  aria-label="Show another verse"
                  title="Show another verse"
                >
                  <ShuffleIcon />
                </button>
              )}
            </div>

            {result.saint && (
              <div className="struggle-section">
                <p className="struggle-section-label">A saint who understands</p>
                <div className="struggle-saint">
                  <p className="struggle-saint-name">{result.saint.name}</p>
                  <p className="struggle-saint-desc">{result.saint.description}</p>
                </div>
              </div>
            )}

            {result.figure && (
              <div className="struggle-section">
                <p className="struggle-section-label">A biblical figure who understands</p>
                <div className="struggle-saint">
                  <p className="struggle-saint-name">{result.figure.name}</p>
                  <p className="struggle-saint-desc">{result.figure.description}</p>
                  {result.figure.book_slug && (
                    <button
                      className="struggle-figure-link"
                      onClick={() => handleFigureLink(result.figure)}
                    >
                      Read their story in the Bible →
                    </button>
                  )}
                </div>
              </div>
            )}

            {result.prayer && (
              <div className="struggle-section">
                <p className="struggle-section-label">Prayer</p>
                <div className="struggle-prayer">
                  <p className="struggle-prayer-name">{result.prayer.name}</p>
                  <p className="struggle-prayer-attr">— {result.prayer.attribution}</p>
                  <p className="struggle-prayer-text">{result.prayer.text}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">Seek</p>
        <h1 className="struggle-category-title">Find Scripture For...</h1>
      </div>

      <div className="page-content">
        {error && <p className="auth-error">{error}</p>}

        <div className="struggle-grid">
          {Object.entries(CATEGORIES).map(([groupName, items]) => (
            <div key={groupName} className="struggle-group">
              <p className="struggle-group-label">{groupName}</p>
              <div className="struggle-pills">
                {items.map(category => (
                  <button
                    key={category}
                    className={`struggle-pill ${GROUP_TINTS[groupName]}`}
                    onClick={() => handleSelect(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Struggle
