import { useState, useEffect } from 'react'
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
  { label: 'Bible', subtitle: 'Douay-Rheims Catholic Bible', path: '/bible', Icon: BibleIcon },
  { label: 'Saint of the Day', subtitle: "Meet today's saint", path: '/saint', Icon: SaintIcon },
  { label: 'Seek', subtitle: 'Scripture for every season', path: '/struggle', Icon: SeekIcon },
  { label: 'Rosary', subtitle: 'Pray the mysteries', path: '/rosary', Icon: RosaryIcon },
  { label: 'Examination of Conscience', subtitle: 'Prepare for confession', path: '/examination', Icon: ExaminationIcon },
  { label: 'Prayers', subtitle: 'Traditional Catholic prayers', path: '/prayers', Icon: PrayingHandsIcon },
]

function Home() {
  const navigate = useNavigate()

  const [readings, setReadings] = useState(() => {
    try {
      const saved = localStorage.getItem('cached_home_data')
      return saved ? JSON.parse(saved) : null
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
            <p className="home-readings-title">Today's Readings</p>
            <p className="home-readings-ref">
              {readings ? readings.first_reading_ref : ''}
            </p>
          </div>
          <span className="home-readings-arrow">›</span>
        </div>

        {/* The six sections as a 3-column grid of tiles: gold accent, icon,
            title, and subtitle, matching the taller card proportions. */}
        <div className="home-grid">
          {TILES.map(({ label, subtitle, path, Icon }) => (
            <button
              key={label}
              className="home-tile"
              onClick={() => navigate(path)}
            >
              <span className="home-tile-icon">
                <Icon />
              </span>
              <span className="home-tile-label">{label}</span>
              <span className="home-tile-subtitle">{subtitle}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
