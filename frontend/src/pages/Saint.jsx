import { useState, useEffect } from 'react'
import BackButton from '../components/BackButton'
import { authFetch } from '../api'
import { getLocalDateKey } from '../utils/dateKey'

const WIKI_HEADERS = {
  'User-Agent': 'Commune Catholic App/1.0 (https://catholic-companion-production.up.railway.app)'
}

async function fetchWikipediaData(saintName, saintDescription) {
  try {
    const params = new URLSearchParams({
      name: saintName,
      description: saintDescription || ''
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
function readCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { v, date, payload } = JSON.parse(raw)
    if (v !== SAINT_CACHE_VERSION) return null
    if (date !== getLocalDateKey()) return null
    return payload
  } catch {
    return null
  }
}

function writeCache(key, payload) {
  try {
    localStorage.setItem(key, JSON.stringify({
      v: SAINT_CACHE_VERSION,
      date: getLocalDateKey(),
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
  const [data, setData] = useState(() => readCache('cached_saint_data'))

  const [wikiData, setWikiData] = useState(() => readCache('cached_saint_wiki'))

  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState('')

  useEffect(() => {
    if (data && wikiData !== undefined) return // already loaded from cache

    async function loadSaint() {
      try {
        // Send the device's own local date so the saint matches the day
        // the user is living, and matches what the Home page requested.
        const today = getLocalDateKey()
        const response = await authFetch(`/readings/today?date=${today}`)
        if (!response.ok) throw new Error('Could not load saint data')
        const json = await response.json()
        setData(json)
        writeCache('cached_saint_data', json)

        // Solemnities get a Wikipedia lookup too — "The Assumption of the
        // Blessed Virgin Mary" is a real article, same as any saint's name.
        // Feria and Sunday do not: there is no person to look up.
        if (!skipsWikiLookup(json)) {
          const wiki = await fetchWikipediaData(json.saint_name, json.saint_description)
          setWikiData(wiki)
          writeCache('cached_saint_wiki', wiki)
        } else {
          setWikiData(null)
          writeCache('cached_saint_wiki', null)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadSaint()
  }, [])

  function formatType(type) {
    if (!type) return ''
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase())
  }

  const feria = isFeria(data)
  const sunday = isSunday(data)
  const solemnity = isSolemnity(data)

  // Nothing at all to show: no card description/quote from the calendar
  // source, and Wikipedia turned up nothing either. Only reachable for
  // Solemnities, since feria and Sunday never attempt the wiki fetch.
  const solemnityHasNoContent =
    solemnity && !data.saint_description && !data.saint_quote && !wikiData?.text

  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">Saint of the Day</p>
        {data && <h1 className="saint-name">{data.saint_name}</h1>}
        {data && <p className="saint-type">{formatType(data.saint_type)}</p>}
      </div>

      <div className="page-content">
        {loading && <p className="readings-loading">Loading...</p>}
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
                <p className="saint-wiki-label">From Wikipedia</p>
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
                alt="The Resurrection, by Titian"
                className="prayer-image"
              />
              <p className="prayer-image-caption">The Resurrection of Christ &mdash; Titian, c. 1542&ndash;1544</p>
            </div>
            <p className="saint-feria-text">Every Sunday is a little Easter, the weekly celebration of the Resurrection of the Lord. Today the Church sets aside her ordinary work to rejoice in the day Christ rose from the dead.</p>
            <div className="saint-feria-verse">
              <p className="saint-feria-verse-text">"This is the day which the Lord hath made: let us be glad and rejoice therein."</p>
              <p className="saint-feria-verse-ref">Psalm 117:24</p>
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
                alt="Figure of Christ, by Heinrich Hofmann"
                className="prayer-image"
              />
              <p className="prayer-image-caption">Figure of Christ &middot; Heinrich Hofmann</p>
            </div>
            <p className="saint-feria-title">This day is not yet dedicated to a Saint recognized by the Catholic Church.</p>
            <p className="saint-feria-text">However, YOU can be a Saint today by following God's universal call to holiness. Remember to love the Lord your God with all your heart, mind, and soul — and to love your neighbor as He loved you.</p>
            <div className="saint-feria-verse">
              <p className="saint-feria-verse-text">"Be perfect, therefore, as your heavenly Father is perfect."</p>
              <p className="saint-feria-verse-ref">Matthew 5:48</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Saint
