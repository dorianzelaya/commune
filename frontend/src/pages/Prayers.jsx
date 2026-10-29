import { useState, useEffect } from 'react'
import { useLang } from '../i18n/LanguageContext'
import BackButton from '../components/BackButton'
import { getPrayers, categoryLabelKey, normalizeSavedList } from '../data/prayerIndex'

// Saves are a list of { id }. Older installs hold full snapshots keyed on
// the English name, so everything read from storage goes through
// normalizeSavedList, which migrates those in passing.
function getSavedIds() {
  try {
    return normalizeSavedList(JSON.parse(localStorage.getItem('saved_prayers') || '[]'))
      .map(p => p.id)
  } catch {
    return []
  }
}

function setSavedIds(ids) {
  localStorage.setItem('saved_prayers', JSON.stringify(ids.map(id => ({ id }))))
}

function Prayers() {
  const { t, lang } = useLang()
  const PRAYERS = getPrayers(lang)
  const [category, setCategory] = useState(null)
  // The id, not the prayer object: the object would go stale the moment
  // the language changed underneath it.
  const [selectedId, setSelectedId] = useState(null)
  const [savedIds, setSavedIds_] = useState(getSavedIds)

  const selected = category && selectedId
    ? PRAYERS[category]?.find(p => p.id === selectedId)
    : null

  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [category, selectedId])

  useEffect(() => {
    if (category && PRAYERS[category]) {
      PRAYERS[category].forEach(prayer => {
        if (prayer.image) {
          const img = new Image()
          img.src = prayer.image
        }
      })
    }
  }, [category])

  function toggleSave(prayer) {
    const current = getSavedIds()
    const updated = current.includes(prayer.id)
      ? current.filter(id => id !== prayer.id)
      : [...current, prayer.id]
    setSavedIds(updated)
    setSavedIds_(updated)
  }

  // Prayer detail view
  if (selected) {
    const isSaved = savedIds.includes(selected.id)
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setSelectedId(null)} />
          <p className="readings-eyebrow">{t(categoryLabelKey(category))}</p>
          <div className="prayer-header-row">
            <h1 className="struggle-category-title">{selected.name}</h1>
            <button
              className={`prayer-bookmark-btn ${isSaved ? 'saved' : ''}`}
              onClick={() => toggleSave(selected)}
              aria-label={isSaved ? t('prayers.removeBookmark') : t('prayers.bookmark')}
            >
              {isSaved ? '★' : '☆'}
            </button>
          </div>
        </div>
        <div className="page-content">
          {selected.image && (
            <div className="prayer-image-block">
              <img src={selected.image} alt={selected.name} className="prayer-image" />
              {selected.caption && (
                <p className="prayer-image-caption">{selected.caption}</p>
              )}
            </div>
          )}
          <div className="prayer-detail-card">
            <p className="prayer-detail-text">{selected.text}</p>
          </div>
          {selected.history && (
            <div className="prayer-history-card">
              <p className="prayer-history-label">{t('prayers.about')}</p>
              <p className="prayer-history-text">{selected.history}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Prayer list within a category
  if (category) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setCategory(null)} />
          <p className="readings-eyebrow">{t('prayers.title')}</p>
          <h1 className="struggle-category-title">{t(categoryLabelKey(category))}</h1>
        </div>
        <div className="page-content">
          <div className="prayers-items">
            {PRAYERS[category].map(prayer => (
              <button
                key={prayer.id}
                className="prayer-item-btn"
                onClick={() => setSelectedId(prayer.id)}
              >
                {prayer.name}
                {savedIds.includes(prayer.id) && (
                  <span className="prayer-item-saved">★</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Category selection. Grouped by what the prayers are FOR, which is how
  // a prayer book is ordered: what the Church professes, then what the
  // faithful pray. Matched on label key rather than category name, because
  // getPrayers(lang) keys the data in the current language.
  const FOUNDATIONS = [
    'prayers.cat.creeds',
    'prayers.cat.acts',
    'prayers.cat.penitential',
  ]
  const DEVOTIONS = [
    'prayers.cat.marian',
    'prayers.cat.spirit',
    'prayers.cat.eucharist',
    'prayers.cat.saints',
    'prayers.cat.mercy',
    'prayers.cat.devotional',
    'prayers.cat.litany',
  ]

  const allCategories = Object.keys(PRAYERS)
  const byKey = new Map(allCategories.map(c => [categoryLabelKey(c), c]))
  const featured = byKey.get('prayers.cat.daily')

  const pick = keys => keys.map(k => [k, byKey.get(k)]).filter(([, c]) => c)
  const placed = new Set(['prayers.cat.daily', ...FOUNDATIONS, ...DEVOTIONS])
  // A category added to the data later still appears, rather than silently
  // vanishing because nobody updated the lists above.
  const unplaced = allCategories
    .map(c => [categoryLabelKey(c), c])
    .filter(([k]) => !placed.has(k))

  const sections = [
    { key: 'prayers.section.foundations', rows: pick(FOUNDATIONS) },
    { key: 'prayers.section.devotions', rows: [...pick(DEVOTIONS), ...unplaced] },
  ].filter(sec => sec.rows.length > 0)

  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">{t('prayers.traditional')}</p>
        <h1 className="struggle-category-title">{t('prayers.title')}</h1>
      </div>
      <div className="page-content">
        {featured && (
          <button
            className="prayers-featured-btn"
            onClick={() => setCategory(featured)}
          >
            <span className="prayers-featured-text">
              <span className="prayers-featured-eyebrow">{t('prayers.daily.eyebrow')}</span>
              <span className="prayers-featured-name">{t('prayers.cat.daily')}</span>
              <span className="prayers-featured-sub">{t('prayers.cat.daily.sub')}</span>
            </span>
            <span className="prayers-featured-chevron" aria-hidden="true">
              <Chevron />
            </span>
          </button>
        )}

        {sections.map(sec => (
          <section className="prayers-section" key={sec.key}>
            <h2 className="prayers-section-head">
              <span className="prayers-section-label">{t(sec.key)}</span>
              <span className="prayers-section-rule" aria-hidden="true">
                <Cross />
              </span>
            </h2>
            <div className="prayers-panel">
              {sec.rows.map(([key, cat]) => (
                <button
                  key={key}
                  className="prayers-row"
                  onClick={() => setCategory(cat)}
                >
                  <span className="prayers-row-text">
                    <span className="prayers-row-name">{t(key)}</span>
                    <span className="prayers-row-sub">{t(key + '.sub')}</span>
                  </span>
                  <span className="prayers-row-chevron" aria-hidden="true">
                    <Chevron />
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

// The ornament sits in the middle of the section rule, the way a printed
// prayer book breaks a heading rule. Drawn rather than typed so it keeps its
// proportions at any size and takes the rule's colour.
function Cross() {
  return (
    <svg viewBox="0 0 12 16" aria-hidden="true">
      <rect x="5.1" y="0" width="1.8" height="16" rx="0.6" />
      <rect x="0.6" y="4.2" width="10.8" height="1.8" rx="0.6" />
    </svg>
  )
}

export default Prayers
