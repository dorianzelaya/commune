import { useState, useEffect, useRef } from 'react'
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

  // The category open in the directory. There is no separate category page
  // any more: a category opens in place, so reaching a prayer is two taps
  // rather than three and the directory never leaves the screen.
  const [expanded, setExpanded] = useState(null)
  // The id, not the prayer object: the object would go stale the moment
  // the language changed underneath it.
  const [selectedId, setSelectedId] = useState(null)
  const [savedIds, setSavedIds_] = useState(getSavedIds)

  // Where the directory was scrolled to when a prayer was opened, so Back
  // returns to the same place with the same category still open instead of
  // dropping the reader at the top of the page.
  const directoryScroll = useRef(0)

  const selected = expanded && selectedId
    ? PRAYERS[expanded]?.find(p => p.id === selectedId)
    : null

  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (!el) return
    if (selectedId) {
      el.scrollTop = 0
    } else {
      el.scrollTop = directoryScroll.current
    }
  }, [selectedId])

  useEffect(() => {
    if (expanded && PRAYERS[expanded]) {
      PRAYERS[expanded].forEach(prayer => {
        if (prayer.image) {
          const img = new Image()
          img.src = prayer.image
        }
      })
    }
  }, [expanded])

  function toggleCategory(cat) {
    setExpanded(prev => (prev === cat ? null : cat))
  }

  function openPrayer(id) {
    const el = document.querySelector('.page-content')
    directoryScroll.current = el ? el.scrollTop : 0
    setSelectedId(id)
  }

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
          <p className="readings-eyebrow">{t(categoryLabelKey(expanded))}</p>
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

  // The directory. Grouped by what the prayers are FOR, which is how a
  // prayer book is ordered: what the Church professes, then what the
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

  function Group({ labelKey, cat }) {
    const open = expanded === cat
    return (
      <div className={`prayers-group ${open ? 'is-open' : ''}`}>
        <button
          className="prayers-row"
          onClick={() => toggleCategory(cat)}
          aria-expanded={open}
        >
          <span className="prayers-row-text">
            <span className="prayers-row-name">{t(labelKey)}</span>
            <span className="prayers-row-sub">{t(labelKey + '.sub')}</span>
          </span>
          <span className="prayers-row-chevron prayers-row-toggle" aria-hidden="true">
            <Chevron />
          </span>
        </button>
        {open && (
          <div className="prayers-sublist">
            {PRAYERS[cat].map(prayer => (
              <button
                key={prayer.id}
                className="prayers-subrow"
                onClick={() => openPrayer(prayer.id)}
              >
                <span className="prayers-subrow-name">{prayer.name}</span>
                {savedIds.includes(prayer.id) && (
                  <span className="prayers-subrow-star" aria-hidden="true">★</span>
                )}
                <span className="prayers-subrow-chevron" aria-hidden="true">
                  <Chevron />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">{t('prayers.traditional')}</p>
        <h1 className="struggle-category-title">{t('prayers.title')}</h1>
      </div>
      <div className="page-content">
        {/* The day's prayers get a section of their own rather than a bare
            panel. Every other panel is introduced by a heading, so one
            without it broke the rhythm of the page. The heading names when
            these are prayed, which the category name does not. */}
        {featured && (
          <section className="prayers-section">
            <h2 className="prayers-section-head">
              <span className="prayers-section-label">{t('prayers.section.everyday')}</span>
              <span className="prayers-section-rule" aria-hidden="true" />
            </h2>
            <div className="prayers-panel">
              <Group labelKey="prayers.cat.daily" cat={featured} />
            </div>
          </section>
        )}

        {sections.map(sec => (
          <section className="prayers-section" key={sec.key}>
            <h2 className="prayers-section-head">
              <span className="prayers-section-label">{t(sec.key)}</span>
              <span className="prayers-section-rule" aria-hidden="true" />
            </h2>
            <div className="prayers-panel">
              {sec.rows.map(([key, cat]) => (
                <Group key={key} labelKey={key} cat={cat} />
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

export default Prayers
