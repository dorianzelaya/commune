import { useState, useEffect } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { localizeRef } from '../data/bibleIndex'
import { useNavigate } from 'react-router-dom'
import HomeHeader from '../components/HomeHeader'
import API_URL from '../config'
import { authFetch } from '../api'
import { getLocalDateKey } from '../utils/dateKey'
import {
  SaintIcon,
  BibleIcon,
  SeekIcon,
  ExaminationIcon,
  RosaryIcon,
  PrayingHandsIcon,
} from '../components/tileIcons'

// The six grid tiles, in display order:
//   row 1: Saint of the Day, Bible, Seek
//   row 2: Examination of Conscience, Rosary, Prayers
// Each tile keeps its subtitle (like the old cards) and a gold line icon.
const TILES = [
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
        const response = await authFetch(`/readings/today?date=${today}`)
        if (!response.ok) return
        const data = await response.json()
        setReadings(data)
        localStorage.setItem('cached_home_data', JSON.stringify(data))
      } catch (err) {
        // Silently fail — home screen still works without readings data
      }
    }
    loadReadings()
  }, [])

  return (
    <div className="page">
      <HomeHeader readings={readings} />
      <div className="page-content">
        {/* Today's Readings: full-width feature banner at the top. It's the
            one item that shows live daily content (the day's citation), so
            it gets the prominent slot above the grid. */}
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

        {/* The six sections as a 3-column grid of tiles: gold accent, icon,
            title, and subtitle, matching the taller card proportions. */}
        <div className="home-grid">
          {TILES.filter(tile => lang === 'en' || tile.key !== 'bible').map(({ key, path, Icon }) => (
            <button
              key={key}
              className="home-tile"
              onClick={() => navigate(path)}
            >
              <span className="home-tile-icon">
                <Icon />
              </span>
              <span className="home-tile-label">{t(`home.tile.${key}`)}</span>
              <span className="home-tile-subtitle">{t(`home.tile.${key}.sub`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
