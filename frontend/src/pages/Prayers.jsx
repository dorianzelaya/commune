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

  // Category selection: Daily Prayers featured full-width, rest in grid
  const allCategories = Object.keys(PRAYERS)
  const featuredCategory = 'Daily Prayers'
  const restCategories = allCategories.filter(c => c !== featuredCategory)

  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">{t('prayers.traditional')}</p>
        <h1 className="struggle-category-title">{t('prayers.title')}</h1>
      </div>
      <div className="page-content">
        {/* Daily Prayers: full-width featured card with gold tint */}
        {PRAYERS[featuredCategory] && (
          <button
            className="prayers-featured-btn"
            onClick={() => setCategory(featuredCategory)}
          >
            {t(categoryLabelKey(featuredCategory))}
          </button>
        )}

        {/* Remaining categories in the existing 2-column grid */}
        <div className="prayers-category-grid">
          {restCategories.map(cat => (
            <button
              key={cat}
              className="prayers-category-btn"
              onClick={() => setCategory(cat)}
            >
              {t(categoryLabelKey(cat))}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Prayers
