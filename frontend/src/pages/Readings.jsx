import { useState, useEffect } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { localizeRef } from '../data/bibleIndex'
import BackButton from '../components/BackButton'
import { authFetch } from '../api'
import { getLocalDateKey } from '../utils/dateKey'

function Readings() {
  const { t, lang } = useLang()
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
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadReadings() {
      try {
        // Send the device's own local date. Without it the backend falls
        // back to US Eastern, which is already tomorrow late in the evening
        // on the west coast, so this page showed the next day's readings
        // while the home screen showed today's.
        const today = getLocalDateKey()
        const response = await authFetch(`/readings/today?date=${today}`)
        if (!response.ok) throw new Error(t('readings.loadError'))
        const data = await response.json()
        setReadings(data)
        localStorage.setItem('cached_home_data', JSON.stringify(data))
      } catch (err) {
        setError(err.message)
      }
    }

    loadReadings()
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <p className="readings-eyebrow">{t('readings.eyebrow')}</p>
        {readings && (
          <p className="readings-season">{readings.liturgical_season}</p>
        )}
        <p className="readings-timezone-note">{t('readings.midnight')}</p>
      </div>

      <div className="page-content">
        {error && <p className="auth-error">{error}</p>}

        {readings && (
          <div className="readings-list">
            {readings.first_reading_ref && (
              <div className="reading-block">
                <p className="reading-label">{t('readings.first')}</p>
                <p className="reading-ref">{localizeRef(readings.first_reading_ref, lang)}</p>
                <p className="reading-text">{readings.first_reading_text}</p>
              </div>
            )}

            {readings.psalm_ref && (
              <div className="reading-block">
                <p className="reading-label">{t('readings.psalm')}</p>
                <p className="reading-ref">{localizeRef(readings.psalm_ref, lang)}</p>
                <p className="reading-text">{readings.psalm_text}</p>
              </div>
            )}

            {readings.second_reading_ref && (
              <div className="reading-block">
                <p className="reading-label">{t('readings.second')}</p>
                <p className="reading-ref">{localizeRef(readings.second_reading_ref, lang)}</p>
                <p className="reading-text">{readings.second_reading_text}</p>
              </div>
            )}

            {readings.gospel_ref && (
              <div className="reading-block">
                <p className="reading-label">{t('readings.gospel')}</p>
                <p className="reading-ref">{localizeRef(readings.gospel_ref, lang)}</p>
                <p className="reading-text">{readings.gospel_text}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Readings