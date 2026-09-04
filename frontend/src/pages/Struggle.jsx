import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { authFetch } from '../api'
import BIBLE_BOOKS, { getBookBySlug } from '../data/bible'

// Each category carries its own identity: a short description, a tint
// class, and a line icon. The tints are deliberately muted versions of
// the app's crimson/gold family rather than the brighter primaries used
// by the old circle layout, so six distinguishable cards still read as
// one app.
const GROUPS = [
  {
    name: 'Growth',
    subtitle: 'Grow in wisdom and character',
    tint: 'cat-growth',
    topics: ['Discernment', 'Wisdom', 'Peace', 'Hope', 'Knowledge'],
  },
  {
    name: 'Virtues',
    subtitle: 'Build a life of goodness',
    tint: 'cat-virtues',
    topics: [
      'Humility', 'Charity', 'Patience', 'Courage', 'Gratitude',
      'Forgiveness', 'Faith', 'Fortitude', 'Prudence', 'Justice',
      'Temperance', 'Chastity', 'Generosity', 'Diligence',
      'Resilience', 'Discipline',
    ],
  },
  {
    name: 'Emotions',
    subtitle: 'Understand and find peace',
    tint: 'cat-emotions',
    topics: ['Anxiety', 'Fear', 'Sadness', 'Loneliness', 'Grief', 'Anger', 'Shame'],
  },
  {
    name: 'Faith Struggles',
    subtitle: 'Navigate difficult spiritual seasons',
    tint: 'cat-faith',
    topics: ['Doubt', 'Despair', 'Feeling distant from God', 'Temptation', 'Lukewarmness'],
  },
  {
    name: 'Sins & Vices',
    subtitle: 'Turn from what wounds the soul',
    tint: 'cat-vices',
    topics: ['Lust', 'Pride', 'Envy', 'Gluttony', 'Sloth', 'Greed', 'Wrath'],
  },
  {
    name: 'Life Situations',
    subtitle: 'Scripture for what you are facing',
    tint: 'cat-life',
    topics: [
      'Family conflict', 'Work stress', 'Relationship trouble',
      'Financial worry', 'Illness', 'Loss', 'Death of a loved one',
    ],
  },
]

function GrowthIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21v-9" />
      <path d="M12 12c0-3.3 2.7-6 6-6 0 3.3-2.7 6-6 6z" />
      <path d="M12 14c0-2.8-2.2-5-5-5 0 2.8 2.2 5 5 5z" />
    </svg>
  )
}

function VirtuesIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5.5c0 4.3-2.9 8.2-7 9.5-4.1-1.3-7-5.2-7-9.5V6l7-3z" />
      <path d="M9.5 12l1.8 1.8L15 10" />
    </svg>
  )
}

function EmotionsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.5C7 17 3.5 13.8 3.5 10.2 3.5 7.5 5.6 5.5 8.2 5.5c1.6 0 3 .8 3.8 2 .8-1.2 2.2-2 3.8-2 2.6 0 4.7 2 4.7 4.7 0 3.6-3.5 6.8-8.5 10.3z" />
    </svg>
  )
}

function FaithIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="M7 8h10" />
    </svg>
  )
}

function VicesIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5c0 3-4.5 4.5-4.5 8.5a4.5 4.5 0 0 0 9 0c0-4-4.5-5.5-4.5-8.5z" />
      <path d="M12 20.5a2.6 2.6 0 0 0 2.6-2.6c0-2-2.6-3-2.6-3s-2.6 1-2.6 3A2.6 2.6 0 0 0 12 20.5z" />
    </svg>
  )
}

function LifeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 11.5L12 4l8.5 7.5" />
      <path d="M6 10.5V20h12v-9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  )
}

const GROUP_ICONS = {
  'Growth': GrowthIcon,
  'Virtues': VirtuesIcon,
  'Emotions': EmotionsIcon,
  'Faith Struggles': FaithIcon,
  'Sins & Vices': VicesIcon,
  'Life Situations': LifeIcon,
}

function getTestamentForSlug(slug) {
  return BIBLE_BOOKS.OT.some(b => b.slug === slug) ? 'OT' : 'NT'
}

function ShuffleIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"
         xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13 12h-2c-1 0-1.7-1.2-2.4-2.7-0.3 0.7-0.6 1.5-1 2.3 0.8 1.4 1.8 2.4 3.4 2.4h2v2l3-3-3-3v2z" />
      <path d="M5.4 6.6c0.3-0.7 0.6-1.5 1-2.2-0.8-1.4-1.9-2.4-3.4-2.4h-3v2h3c1 0 1.7 1.2 2.4 2.6z" />
      <path d="M16 3l-3-3v2h-2c-2.7 0-3.9 3-5 5.7-0.8 2.1-1.7 4.3-3 4.3h-3v2h3c2.6 0 3.8-2.8 4.9-5.6 0.9-2.2 1.8-4.4 3.1-4.4h2v2l3-3z" />
    </svg>
  )
}

function Struggle() {
  const navigate = useNavigate()
  // Three levels: null group = category cards, group set = topic list,
  // result set = the passage view.
  const [group, setGroup] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState('')
  const [verseIndex, setVerseIndex] = useState(0)

  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [group, result, loading])

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
      setResult(await response.json())
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

  // Back from a result returns to that category's topic list, not all the
  // way out — the group is still set, so the topic view renders.
  function handleBackFromResult() {
    setResult(null)
    setSelected('')
    setError('')
    setVerseIndex(0)
  }

  function handleBackFromTopics() {
    setGroup(null)
    setError('')
  }

  function handleFigureLink(figure) {
    const book = getBookBySlug(figure.book_slug)
    if (!book) return
    localStorage.setItem('bible_testament', getTestamentForSlug(figure.book_slug))
    localStorage.setItem('bible_book', figure.book_slug)
    localStorage.setItem('bible_chapter', String(figure.chapter))
    navigate('/bible')
  }

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={handleBackFromResult} />
          <p className="readings-eyebrow">Seek</p>
          <h1 className="struggle-category-title">{selected}</h1>
        </div>
        <div className="page-content">
          <p className="readings-loading">Finding scripture...</p>
        </div>
      </div>
    )
  }

  // ---------- Result ----------
  if (result) {
    const passages = result.passages || []
    const current = passages[verseIndex]
    const hasMore = passages.length > 1

    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={handleBackFromResult} />
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

  // ---------- Topic list for one category ----------
  if (group) {
    const Icon = GROUP_ICONS[group.name]
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={handleBackFromTopics} />
          <p className="readings-eyebrow">Seek</p>
          <h1 className="struggle-category-title">{group.name}</h1>
          <p className="seek-group-subtitle">{group.subtitle}</p>
        </div>

        <div className="page-content">
          {error && <p className="auth-error">{error}</p>}

          {/* The category icon repeats here, larger, so moving between
              levels feels continuous rather than abrupt. */}
          <div className={`seek-group-crest ${group.tint}`}>
            <Icon />
          </div>

          <div className="seek-topic-list">
            {group.topics.map(topic => (
              <button
                key={topic}
                className="seek-topic-row"
                onClick={() => handleSelect(topic)}
              >
                <span className="seek-topic-name">{topic}</span>
                <span className="seek-topic-arrow">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ---------- Category cards ----------
  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">Seek</p>
        <h1 className="struggle-category-title">Find Scripture For...</h1>
        <p className="seek-group-subtitle">What's on your heart?</p>
      </div>

      <div className="page-content">
        {error && <p className="auth-error">{error}</p>}

        <div className="seek-category-list">
          {GROUPS.map(g => {
            const Icon = GROUP_ICONS[g.name]
            return (
              <button
                key={g.name}
                className={`seek-category-card ${g.tint}`}
                onClick={() => setGroup(g)}
              >
                <span className="seek-category-icon">
                  <Icon />
                </span>
                <span className="seek-category-text">
                  <span className="seek-category-name">{g.name}</span>
                  <span className="seek-category-sub">{g.subtitle}</span>
                </span>
                <span className="seek-category-arrow">›</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Struggle
