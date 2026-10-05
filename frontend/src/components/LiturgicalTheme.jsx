import { useEffect } from 'react'
import { authFetch } from '../api'
import { getLocalDateKey } from '../utils/dateKey'

const VALID = ['green', 'violet', 'white', 'red', 'rose', 'crimson', 'blue']

/**
 * Sets data-color on <html>, which is all the CSS needs to swap the page
 * background. Renders nothing.
 *
 * Mode lives in localStorage under theme_mode: either a fixed colour from
 * VALID, or 'season' (the default) to follow the liturgical calendar.
 *
 * In season mode it reuses cached_home_data, the same cache the home screen
 * fills, so following the calendar costs no extra request on any day the
 * home screen has already loaded. If that cache is missing or from another
 * day it fetches once and writes the same key, so the two never diverge.
 */
function LiturgicalTheme() {
  useEffect(() => {
    let cancelled = false

    function apply(color) {
      if (!cancelled && color) document.documentElement.dataset.color = color
    }

    const mode = localStorage.getItem('theme_mode') || 'season'
    if (VALID.includes(mode)) {
      apply(mode)
      return
    }

    const today = getLocalDateKey()

    try {
      const cached = JSON.parse(localStorage.getItem('cached_home_data') || 'null')
      if (cached && cached.date === today && cached.liturgical_color) {
        apply(cached.liturgical_color)
        return
      }
    } catch {
      // Corrupt cache is not worth failing over; fall through and refetch.
    }

    authFetch(`/readings/today?date=${today}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data) return
        localStorage.setItem('cached_home_data', JSON.stringify(data))
        apply(data.liturgical_color)
      })
      .catch(() => {
        // Offline or signed out. The default crimson in :root still applies.
      })

    return () => { cancelled = true }
  }, [])

  return null
}

export default LiturgicalTheme
