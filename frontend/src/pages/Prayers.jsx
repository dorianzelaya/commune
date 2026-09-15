import { useState, useEffect } from 'react'
import BackButton from '../components/BackButton'
import PRAYERS from '../data/prayers'

function getSavedPrayers() {
  try {
    return JSON.parse(localStorage.getItem('saved_prayers') || '[]')
  } catch {
    return []
  }
}

function setSavedPrayers(list) {
  localStorage.setItem('saved_prayers', JSON.stringify(list))
}

function Prayers() {
  const [category, setCategory] = useState(null)
  const [selected, setSelected] = useState(null)
  const [savedNames, setSavedNames] = useState(() => {
    return getSavedPrayers().map(p => p.name)
  })

  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [category, selected])

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
    const saved = getSavedPrayers()
    const exists = saved.find(p => p.name === prayer.name)
    let updated
    if (exists) {
      updated = saved.filter(p => p.name !== prayer.name)
    } else {
      updated = [...saved, { name: prayer.name, category, text: prayer.text, image: prayer.image, caption: prayer.caption, history: prayer.history }]
    }
    setSavedPrayers(updated)
    setSavedNames(updated.map(p => p.name))
  }

  // Prayer detail view
  if (selected) {
    const isSaved = savedNames.includes(selected.name)
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setSelected(null)} />
          <p className="readings-eyebrow">{category}</p>
          <div className="prayer-header-row">
            <h1 className="struggle-category-title">{selected.name}</h1>
            <button
              className={`prayer-bookmark-btn ${isSaved ? 'saved' : ''}`}
              onClick={() => toggleSave(selected)}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark prayer'}
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
              <p className="prayer-history-label">About this Prayer</p>
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
          <p className="readings-eyebrow">Prayers</p>
          <h1 className="struggle-category-title">{category}</h1>
        </div>
        <div className="page-content">
          <div className="prayers-items">
            {PRAYERS[category].map(prayer => (
              <button
                key={prayer.name}
                className="prayer-item-btn"
                onClick={() => setSelected(prayer)}
              >
                {prayer.name}
                {savedNames.includes(prayer.name) && (
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
        <p className="readings-eyebrow">Traditional Prayers</p>
        <h1 className="struggle-category-title">Prayers</h1>
      </div>
      <div className="page-content">
        {/* Daily Prayers: full-width featured card with gold tint */}
        {PRAYERS[featuredCategory] && (
          <button
            className="prayers-featured-btn"
            onClick={() => setCategory(featuredCategory)}
          >
            {featuredCategory}
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
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Prayers
