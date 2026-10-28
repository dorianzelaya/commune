import { useState, useEffect } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { rankName } from '../data/ranks'
import { dayName } from '../data/dayNames'
import BackButton from '../components/BackButton'
import { authFetch } from '../api'
import { getLocalDateKey } from '../utils/dateKey'

const WIKI_HEADERS = {
  'User-Agent': 'Commune Catholic App/1.0 (https://catholic-companion-production.up.railway.app)'
}

async function fetchWikipediaData(saintName, saintDescription, lang) {
  try {
    const params = new URLSearchParams({
      name: saintName,
      description: saintDescription || '',
      lang: lang || 'en',
    })
    const response = await authFetch(`/readings/saint-wiki?${params}`)
    if (!response.ok) return null
    const data = await response.json()
    if (!data.text && !data.image) return null
    return data
  } catch {
    return null
  }
}

// Bump when the saint lookup logic changes, so already-cached days
// don't keep serving results produced by the old code.
// Bumped to 3: Solemnities used to be routed into the "no saint today"
// fallback and never got a Wikipedia lookup at all. Anyone who loaded a
// Solemnity under the old logic has that wrong result cached.
// Bumped to 4: Sunday now has its own branch (Lord's Day) instead of
// being lumped into the "no saint today" feria fallback.
const SAINT_CACHE_VERSION = 5

// The local date key now comes from a shared helper (../utils/dateKey) so
// that the cache key here and the ?date= param sent to the backend are
// always the same value. When they were computed separately, the cache
// could key on one day while the server served another.
// The LANGUAGE is part of the cache identity, not just the date. The
// Wikipedia bio is fetched per language, so without this a reader who
// switches to Spanish would be served the English article out of cache
// until midnight. Bumping SAINT_CACHE_VERSION would not help: the stale
// entry is correct for its version, just not for the current language.
function readCache(key, cacheLang) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { v, date, lang, payload } = JSON.parse(raw)
    if (v !== SAINT_CACHE_VERSION) return null
    if (date !== getLocalDateKey()) return null
    if (lang !== cacheLang) return null
    return payload
  } catch {
    return null
  }
}

function writeCache(key, payload, cacheLang) {
  try {
    localStorage.setItem(key, JSON.stringify({
      v: SAINT_CACHE_VERSION,
      date: getLocalDateKey(),
      lang: cacheLang,
      payload,
    }))
  } catch {
    // storage full or unavailable — not worth failing the page over
  }
}

// A Solemnity (Christmas, Easter, the Assumption, etc.) is the HIGHEST
// rank of celebration in the calendar, not a lesser or empty day. It
// deserves its own branch rather than being folded into "no saint today,"
// because the calendar data source frequently leaves saint_description
// blank for Solemnities even though the day is very much observed.
function isSolemnity(data) {
  return data?.saint_type === 'SOLEMNITY'
}

// Sunday is the Lord's Day, the weekly celebration of the Resurrection and
// the oldest feast of the Church. It is emphatically NOT an empty day, so
// it gets its own reverent branch rather than the "not yet dedicated to a
// Saint" feria fallback, which read as wrong for the most important day of
// the week.
function isSunday(data) {
  return data?.saint_type === 'SUNDAY'
}

// True feria: nothing is assigned today at all. This deliberately excludes
// both Solemnities and Sundays now — each has its own branch above. A
// blank description on either does not mean the day is unobserved.
function isFeria(data) {
  if (!data) return false
  if (isSolemnity(data)) return false
  if (isSunday(data)) return false
  return (
    data.saint_type === 'FERIA' ||
    !data.saint_name ||
    (!data.saint_description && !data.saint_quote &&
      !data.saint_type?.includes('MEMORIAL') &&
      !data.saint_type?.includes('FEAST'))
  )
}

// Days that should NOT trigger a Wikipedia saint lookup: feria (no saint)
// and Sunday (the day itself is the feast, not a person to look up).
function skipsWikiLookup(data) {
  return isFeria(data) || isSunday(data)
}

function Saint() {
  const { t, lang } = useLang()
  const [data, setData] = useState(() => readCache('cached_saint_data', lang))

  const [wikiData, setWikiData] = useState(() => readCache('cached_saint_wiki', lang))

  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState('')

  // Re-runs when the language changes, because the bio is fetched per
  // language. The cache is re-read here rather than only in useState, so
  // a language switch serves the other language's cached copy when there
  // is one and fetches when there is not.
  useEffect(() => {
    const cached = readCache('cached_saint_data', lang)
    const cachedWiki = readCache('cached_saint_wiki', lang)
    if (cached) {
      setData(cached)
      setWikiData(cachedWiki)
      setLoading(false)
      return
    }

    async function loadSaint() {
      try {
        // Send the device's own local date so the saint matches the day
        // the user is living, and matches what the Home page requested.
        const today = getLocalDateKey()
        const response = await authFetch(`/readings/today?date=${today}&lang=${lang}`)
        if (!response.ok) throw new Error(t('saint.loadError'))
        const json = await response.json()
        setData(json)
        writeCache('cached_saint_data', json, lang)

        // Solemnities get a Wikipedia lookup too — "The Assumption of the
        // Blessed Virgin Mary" is a real article, same as any saint's name.
        // Feria and Sunday do not: there is no person to look up.
        if (!skipsWikiLookup(json)) {
          const wiki = await fetchWikipediaData(json.saint_name, json.saint_description, lang)
          setWikiData(wiki)
          writeCache('cached_saint_wiki', wiki, lang)
        } else {
          setWikiData(null)
          writeCache('cached_saint_wiki', null, lang)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    loadSaint()
  }, [lang])

  const feria = isFeria(data)
  const sunday = isSunday(data)
  const solemnity = isSolemnity(data)

  // Nothing at all to show: no card description/quote from the calendar
  // source, and Wikipedia turned up nothing either. Only reachable for
  // Solemnities, since feria and Sunday never attempt the wiki fetch.
  const solemnityHasNoContent =
    solemnity && !data.saint_description && !data.saint_quote && !wikiData?.text

  // The calendar only ever names the saint in English. When the Spanish
  // Wikipedia article resolved, its title IS the saint's Spanish name, from
  // Wikipedia's own cross-language mapping rather than transformed from the
  // English, which is what gets "Teresa de Jesus" from "Teresa of Avila".
  // dayName still handles the formulaic days, which have no article.
  const displayName =
    (lang !== 'en' && wikiData?.title) || dayName(data?.saint_name, lang)

  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">{t('saint.title')}</p>
        {data && <h1 className="saint-name">{displayName}</h1>}
        {data && <p className="saint-type">{rankName(data.saint_type, t)}</p>}
      </div>

      <div className="page-content">
        {loading && <p className="readings-loading">{t('common.loading')}</p>}
        {error && <p className="auth-error">{error}</p>}

        {data && !feria && !sunday && !solemnityHasNoContent && (
          <div className="saint-body">
            {wikiData?.image && (
              <div className="saint-image-block">
                <img
                  src={wikiData.image}
                  alt={data.saint_name}
                  className="saint-image"
                />
              </div>
            )}

            {(data.saint_quote || data.saint_description) && (
              <div className="saint-summary-card">
                {data.saint_quote && (
                  <>
                    <p className="saint-quote-text">"{data.saint_quote}"</p>
                    <p className="saint-quote-attr">— {data.saint_name}</p>
                    {data.saint_description && <div className="saint-card-divider" />}
                  </>
                )}
                {data.saint_description && (
                  <p className="saint-description">{data.saint_description}</p>
                )}
              </div>
            )}

            {wikiData?.text && (
              <div className="saint-wiki-block">
                <p className="saint-wiki-label">{t('saint.fromWikipedia')}</p>
                <p className="saint-wiki-text">{wikiData.text}</p>
              </div>
            )}
          </div>
        )}

        {data && solemnityHasNoContent && (
          <div className="saint-body">
            <p className="saint-description">
              Today the Church celebrates {data.saint_name}, a Solemnity —
              the highest rank of liturgical celebration.
            </p>
          </div>
        )}

        {data && sunday && (
          <div className="saint-feria">
            {/*
              Sunday, the Lord's Day. Reuses the prayer-card image classes
              so the image and its credit render like a prayer card, and
              the saint-feria-* text classes so the layout matches the
              feria block. Different content, same visual shell.
            */}
            <div className="prayer-image-block">
              <img
                src="/rosary/sunday.jpg"
                alt={t('saint.artResurrection')}
                className="prayer-image"
              />
              <p className="prayer-image-caption">{t('saint.resurrectionCaption')}</p>
            </div>
            <p className="saint-feria-text">{t('saint.sundayText')}</p>
            <div className="saint-feria-verse">
              <p className="saint-feria-verse-text">"{t('saint.sundayVerse')}"</p>
              <p className="saint-feria-verse-ref">{t('saint.resurrectionVerse')}</p>
            </div>
          </div>
        )}

        {data && feria && (
          <div className="saint-feria">
            {/*
              Reuses the prayer-card image classes (prayer-image-block,
              prayer-image, prayer-image-caption) so the feria image and
              its painting credit render identically to a prayer card,
              with no new CSS. The credit is a visible caption, separate
              from the img alt text, which only appears if the image fails
              to load.
            */}
            <div className="prayer-image-block">
              <img
                src="/rosary/feria.jpg"
                alt={t('saint.artChrist')}
                className="prayer-image"
              />
              <p className="prayer-image-caption">{t('saint.christCaption')}</p>
            </div>
            <p className="saint-feria-title">{t('saint.noSaint')}</p>
            <p className="saint-feria-text">{t('saint.feriaText')}</p>
            <div className="saint-feria-verse">
              <p className="saint-feria-verse-text">"{t('saint.verse')}"</p>
              <p className="saint-feria-verse-ref">{t('saint.perfectVerse')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Saint
