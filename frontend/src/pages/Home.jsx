import { useState, useEffect } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { localizeRef } from '../data/bibleIndex'
import { useNavigate } from 'react-router-dom'
import HomeHeader from '../components/HomeHeader'
import { authFetch } from '../api'
import { getLocalDateKey } from '../utils/dateKey'
import { getTodaysMysteries } from '../data/rosary'
import { setLabelKey } from '../data/rosaryIndex'
import { dayName } from '../data/dayNames'
import {
  SaintIcon,
  BibleIcon,
  SeekIcon,
  ExaminationIcon,
  RosaryIcon,
  PrayingHandsIcon,
} from '../components/tileIcons'

// One list, in the order the tiles were in. Each row carries its icon and,
// where the day decides it, what it actually holds today: the saint being
// kept, the mysteries this weekday calls for. The rest keep their standing
// description.
const ROWS = [
  { key: 'bible', path: '/bible', Icon: BibleIcon },
  { key: 'saint', path: '/saint', Icon: SaintIcon },
  { key: 'seek', path: '/struggle', Icon: SeekIcon },
  { key: 'rosary', path: '/rosary', Icon: RosaryIcon },
  { key: 'examination', path: '/examination', Icon: ExaminationIcon },
  { key: 'prayers', path: '/prayers', Icon: PrayingHandsIcon },
]

function Home() {
  const { t, lang } = useLang()
  const navigate = useNavigate()

  // Only trust this cache if it is for TODAY. cached_home_data is shared
  // with the home screen and the theme, so a leftover entry from another
  // date would render the wrong day's readings until the fetch lands.
  const [readings, setReadings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cached_home_data') || 'null')
      return saved && saved.date === getLocalDateKey() ? saved : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    async function loadReadings() {
      try {
        // Send the device's own local date so the backend serves the day
        // the user is actually living, not US Eastern. Same helper feeds
        // the Saint page and its cache key, so they can't disagree.
        const today = getLocalDateKey()
        const response = await authFetch(`/readings/today?date=${today}&lang=${lang}`)
        if (!response.ok) return
        const data = await response.json()
        setReadings(data)
        localStorage.setItem('cached_home_data', JSON.stringify(data))
      } catch (err) {
        // Silently fail — home screen still works without readings data
      }
    }
    loadReadings()
  }, [lang])

  // Fixed by the weekday, so this needs no network and is never blank.
  const mysteries = getTodaysMysteries()

  // A row shows what today holds where the day decides it, and its standing
  // description otherwise. Never a placeholder: a value that has not
  // arrived yet falls back to the description.
  function valueFor(key) {
    if (key === 'saint' && readings?.saint_name) {
      return dayName(readings.saint_name, lang)
    }
    if (key === 'rosary') {
      return t(setLabelKey(mysteries.name))
    }
    return t(`home.tile.${key}.sub`)
  }

  return (
    <div className="page">
      <HomeHeader readings={readings} />
      <div className="page-content">
        {/* Today's Readings keeps the feature slot: it is the one thing on
            this screen that changes every single day. */}
        <div
          className="home-readings-banner"
          onClick={() => navigate('/readings')}
        >
          <div>
            <p className="home-readings-title">{t('home.readings')}</p>
            <p className="home-readings-ref">
              {readings ? localizeRef(readings.first_reading_ref, lang) : ''}
            </p>
          </div>
          <span className="home-readings-arrow">›</span>
        </div>

        <div className="home-panel">
          {ROWS.map(({ key, path, Icon }) => (
            <button
              key={key}
              className="home-row"
              onClick={() => navigate(path)}
            >
              <span className="home-row-icon">
                <Icon />
              </span>
              <span className="home-row-text">
                <span className="home-row-name">{t(`home.tile.${key}`)}</span>
                <span className="home-row-value">{valueFor(key)}</span>
              </span>
              <span className="home-row-chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
