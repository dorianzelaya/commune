import { useState } from 'react'

const COLORS = [
  { key: 'green',   name: 'Green' },
  { key: 'violet',  name: 'Violet' },
  { key: 'white',   name: 'White' },
  { key: 'red',     name: 'Red' },
  { key: 'rose',    name: 'Rose' },
  { key: 'crimson', name: 'Crimson' },
  { key: 'blue',    name: 'Blue' },
]

/**
 * Appearance control for the Profile page.
 *
 * Writes theme_mode to localStorage and applies the change immediately by
 * setting data-color on <html>, which is exactly what LiturgicalTheme does
 * on load, so nothing has to be reloaded to see it.
 *
 * Deliberately a fixed palette rather than a colour picker: the text is
 * near-white and the accents are gold, so an arbitrary hue at an arbitrary
 * lightness produces unreadable combinations. These six are all checked
 * against the gold and the text ramp.
 */
function ThemePicker() {
  const [mode, setMode] = useState(() => localStorage.getItem('theme_mode') || 'season')

  function choose(next) {
    localStorage.setItem('theme_mode', next)
    setMode(next)

    if (next !== 'season') {
      document.documentElement.dataset.color = next
      return
    }

    // Back to following the calendar. The day's colour is already sitting in
    // the readings cache, so returning to season mode costs no request.
    try {
      const cached = JSON.parse(localStorage.getItem('cached_home_data') || 'null')
      if (cached?.liturgical_color) {
        document.documentElement.dataset.color = cached.liturgical_color
      }
    } catch {
      // Nothing cached yet. The right colour lands on the next app load.
    }
  }

  return (
    <>
      <p className="profile-section-label">Appearance</p>
      <div className="profile-section">
        <button
          className="profile-feature-row profile-theme-season-row"
          onClick={() => choose('season')}
        >
          <span className="profile-theme-season-text">
            <span className="profile-row-label">Follow the liturgical season</span>
            <span className="profile-theme-season-desc">
              The app takes the colour worn at Mass today. Green in Ordinary
              Time, violet in Advent and Lent, white at Christmas and Easter,
              red for Pentecost and the martyrs.
            </span>
          </span>
          {mode === 'season' && <span className="profile-theme-check">{'\u2713'}</span>}
        </button>
        <div className="profile-divider" />
        <div className="profile-theme-swatches">
          {COLORS.map(c => (
            <button
              key={c.key}
              type="button"
              data-swatch={c.key}
              className={`profile-theme-swatch ${mode === c.key ? 'active' : ''}`}
              onClick={() => choose(c.key)}
              aria-label={c.name}
              title={c.name}
            />
          ))}
        </div>
        <p className="profile-theme-note">
          Crimson and blue are not liturgical colours, so the calendar will
          never choose them.
        </p>
      </div>
    </>
  )
}

export default ThemePicker
