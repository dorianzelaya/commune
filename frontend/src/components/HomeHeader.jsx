import DAILY_VERSES, { getDailyVerse } from '../data/daily_verses'
import { useLang } from '../i18n/LanguageContext'
import { seasonName } from '../data/seasons'

function HomeHeader({ readings }) {
  const { t, lang } = useLang()
  const today = new Date()
  // Intl does the work: the weekday and month names, their order, and the
  // punctuation all differ by language, so formatting the date by hand
  // would mean maintaining a second set of month names.
  const dateString = today.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  // The backend sends the season in English from the upstream calendar
  // API. It is a closed set, so it is translated on the way to the
  // screen rather than server-side.
  const season = seasonName(readings?.liturgical_season, t) || t('season.ordinary')
  const month = today.getMonth() + 1
  const day = today.getDate()
  const monthVerses = DAILY_VERSES[month]
  const dailyVerse = monthVerses ? monthVerses[day - 1] : null

  return (
    <div className="home-header">
      <p className="home-header-season">{season}</p>
      <h1 className="home-header-date">{dateString}</h1>
      {dailyVerse && (
        <div className="home-header-verse">
          <p className="verse-text">"{dailyVerse.text}"</p>
          <p className="verse-ref">{dailyVerse.ref}</p>
        </div>
      )}
    </div>
  )
}

export default HomeHeader