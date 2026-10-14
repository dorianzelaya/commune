import { useState } from 'react'
import { useLang } from '../i18n/LanguageContext'

// Crimson first because it is the default and the app's own colour, then
// blue, then the five liturgical ones.
// Names live in the string table under theme.<key>, so the swatch
// labels translate with everything else.
const COLORS = ['crimson', 'blue', 'green', 'violet', 'white', 'red', 'rose']

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
  const { t } = useLang()
  const [mode, setMode] = useState(() => localStorage.getItem('theme_mode') || 'crimson')

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
      <p className="profile-section-label">{t('theme.heading')}</p>
      <div className="profile-section">
        <button
          className={`profile-feature-row profile-theme-season-row ${mode === 'season' ? 'active' : ''}`}
          onClick={() => choose('season')}
        >
          <span className="profile-theme-radio" aria-hidden="true" />
          <span className="profile-theme-season-text">
            <span className="profile-row-label">{t('theme.season')}</span>
            <span className="profile-theme-season-desc">
              {t('theme.seasonDesc')}
            </span>
          </span>
        </button>
        <div className="profile-divider" />
        <div className="profile-theme-swatches">
          {COLORS.map(key => (
            <button
              key={key}
              type="button"
              data-swatch={key}
              className={`profile-theme-swatch ${mode === key ? 'active' : ''}`}
              onClick={() => choose(key)}
              aria-label={t(`theme.${key}`)}
              title={t(`theme.${key}`)}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default ThemePicker
