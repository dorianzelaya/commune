import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { POPE_IMAGES } from '../data/popeImages'
import { POPE_SUMMARIES_EXTRA } from '../data/popeSummariesExtra'
import { POPE_PLACES_ES } from '../data/popePlacesEs'
import { POPE_SUMMARIES_ES } from '../data/popeSummariesEs'
import { POPE_SUMMARIES } from '../data/popeSummaries'
import { POPE_NOTES } from '../data/popeNotes'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import BackButton from '../components/BackButton'
import { searchGlossary } from '../data/glossaryIndex'
import { getTopics } from '../data/learn'

/**
 * The Learn section: what the faith is, rather than what today asks of you.
 *
 * Two kinds of thing live here. Reference, which you look something up in,
 * and topics, which you read. The glossary used to sit in Profile, where
 * settings live; this is where it belongs.
 *
 * Views are local state rather than routes, the same as Prayers and Seek,
 * so the whole section is one entry in the navigation.
 */
function Learn() {
  const { t, lang } = useLang()
  const location = useLocation()
  // The open topic is in the URL so the reader's back link can return
  // here rather than to the index.
  const initialView = (() => {
    const q = new URLSearchParams(location.search).get('topic')
    return q ? 'topic:' + q : null
  })()
  const [view, setView] = useState(initialView)
  // Coming back from a pope should land where you left, not at the top.
  const listState = useRef({ active: 0 })
  // Back from a pope returns to wherever he was opened from.
  const popeFrom = useRef('topic:popes')
  // Where each view was scrolled to, so leaving and coming back lands there.
  const scrollMem = useRef({})
  // Fetch the timeline artwork once on arrival so opening the topic does
  // not stutter while each picture is requested.
  const warmImages = useRef(false)
  useEffect(() => {
    if (warmImages.current) return
    warmImages.current = true
    const tl = getTopics(lang).find(x => x.id === 'timeline')
    ;(tl ? tl.events : []).forEach(e => { if (e.img) { const i = new Image(); i.src = e.img } })
  }, [lang])
  function goFrom(current, next) {
    const el = document.querySelector('.page-content')
    scrollMem.current[current] = [el ? el.scrollTop : 0, window.scrollY || 0]
    setView(next)
  }
  useLayoutEffect(() => {
    const saved = scrollMem.current[view]
    if (!saved) return
    let cancelled = false
    const put = () => {
      if (cancelled) return
      if (saved.anchor != null) {
        const el = document.querySelector('[data-entry="' + saved.anchor + '"]')
        if (el) el.scrollIntoView({ block: 'center' })
        return
      }
      const [top, win] = saved
      const el = document.querySelector('.page-content')
      if (el && top) el.scrollTop = top
      if (win) window.scrollTo(0, win)
    }
    // Retries are only there to beat images loading underneath. The moment
    // the reader touches the screen they stop, or they yank the page back
    // from wherever that person just scrolled to.
    const stop = () => { cancelled = true }
    const opts = { passive: true, capture: true }
    window.addEventListener('wheel', stop, opts)
    window.addEventListener('touchstart', stop, opts)
    window.addEventListener('keydown', stop, true)
    put()
    const r = requestAnimationFrame(put)
    const t1 = setTimeout(put, 90)
    const t2 = setTimeout(put, 300)
    const t3 = setTimeout(() => { put(); stop() }, 700)
    return () => {
      cancelled = true
      cancelAnimationFrame(r); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      window.removeEventListener('wheel', stop, opts)
      window.removeEventListener('touchstart', stop, opts)
      window.removeEventListener('keydown', stop, true)
    }
  }, [view])
  const [query, setQuery] = useState('')

  const topics = getTopics(lang)
  const topic = view && view.startsWith('topic:')
    ? topics.find(x => x.id === view.slice(6))
    : null

  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [view])

  // ---------- Glossary ----------
  // ---------- One pope ----------
  if (view && view.startsWith('pope:')) {
    const num = parseInt(view.slice(5), 10)
    const all = (topics.find(x => x.id === 'popes')?.parables || [])
      .flatMap(g => g.items.map(i => ({ ...i, era: g.kind })))
    const idx = all.findIndex(x => x.num === num)
    const pope = idx >= 0 ? all[idx] : null
    const L = (en, es) => (lang === 'es' ? es : en)
    const entry = pope ? POPE_NOTES[pope.key] : null
    const note = entry ? (entry[lang] || entry.en) : ''
    const summary = (lang === 'es' && POPE_SUMMARIES_ES[pope.num]) ||
      POPE_SUMMARIES[pope.num] || POPE_SUMMARIES_EXTRA[pope.num] || ''
    const reign = (() => {
      const m = /(\d{1,4})\D+(\d{1,4})?/.exec(pope.ref || '')
      if (!m) return null
      return [parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : new Date().getFullYear()]
    })()
    const during = reign
      ? ((topics.find(x => x.id === 'timeline') || {}).events || [])
          .filter(e => e.year >= reign[0] && e.year <= reign[1])
      : []
    // the note leads the paragraph rather than sitting above it as its own line
    const body = [note, summary].filter(Boolean).join(' ')
    const span = (() => {
      const m = /(\d{1,4})\D+(\d{1,4})?/.exec(pope.ref || '')
      if (!m) return ''
      const from = parseInt(m[1], 10)
      const to = m[2] ? parseInt(m[2], 10) : new Date().getFullYear()
      const years = to - from
      if (years < 1) return L('under a year', 'menos de un año')
      return years === 1 ? L('1 year', '1 año') : `${years} ${L('years', 'años')}`
    })()
    if (!pope) return null
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setView(popeFrom.current)} />
          <p className="readings-eyebrow">{pope.era}</p>
          <h1 className="struggle-category-title">{pope.title}</h1>
        </div>
        <div className="page-content">
          {POPE_IMAGES[pope.num] ? (
            <img className="pope-portrait" src={POPE_IMAGES[pope.num]} alt="" loading="lazy" />
          ) : null}
          <div className="pope-card">
            <div className="pope-field">
              <span>{L('Number', 'Número')}</span><strong>{pope.num}</strong>
            </div>
            <div className="pope-field">
              <span>{L('Reign', 'Pontificado')}</span>
              <strong>{pope.ref}{span ? ` · ${span}` : ''}</strong>
            </div>
            {pope.born ? (
              <div className="pope-field">
                <span>{L('Birth name', 'Nombre de pila')}</span><strong>{pope.born}</strong>
              </div>
            ) : null}
            {pope.place ? (
              <div className="pope-field">
                <span>{L('From', 'Origen')}</span>
                <strong>{(lang === 'es' && POPE_PLACES_ES[pope.num]) || pope.place}</strong>
              </div>
            ) : null}
            {pope.feast ? (
              <div className="pope-field">
                <span>{L('Feast day', 'Fiesta')}</span><strong>{pope.feast}</strong>
              </div>
            ) : null}
            {pope.saint ? (
              <div className="pope-field">
                <span>{L('Honoured as', 'Veneración')}</span><strong>{L('Saint', 'Santo')}</strong>
              </div>
            ) : null}
          </div>
          {during.length > 0 ? (
            <div className="pope-during">
              <h2 className="pope-during-heading">
                {L('During his reign', 'Durante su pontificado')}
              </h2>
              {during.map(e => (
                <button
                  type="button"
                  className="parable-row"
                  key={e.label + e.title}
                  onClick={() => setView('topic:timeline')}
                >
                  <span className="parable-name">{e.title}</span>
                  <span className="parable-ref">{e.label}</span>
                </button>
              ))}
            </div>
          ) : null}
          {body ? (
            <div className="pope-summary">
              <p>{body}</p>
              <p className="pope-source">
                {POPE_SUMMARIES[pope.num] ? L('Catholic Encyclopedia, 1913', 'Enciclopedia Católica, 1913') : ''}
              </p>
            </div>
          ) : null}
          <div className="pope-nav">
            {idx > 0 ? (
              <button className="pope-nav-btn" onClick={() => setView('pope:' + all[idx - 1].num)}>
                {'\u2190 ' + all[idx - 1].title}
              </button>
            ) : <span />}
            {idx < all.length - 1 ? (
              <button className="pope-nav-btn" onClick={() => setView('pope:' + all[idx + 1].num)}>
                {all[idx + 1].title + ' \u2192'}
              </button>
            ) : <span />}
          </div>
        </div>
      </div>
    )
  }

  if (view === 'glossary') {
    const results = searchGlossary(query, lang)
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => { setView(null); setQuery('') }} />
          <p className="readings-eyebrow">{t('learn.eyebrow')}</p>
          <h1 className="struggle-category-title">{t('profile.glossary')}</h1>
        </div>
        <div className="page-content">
          <input
            className="glossary-search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('profile.searchTerms')}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {results.length === 0 ? (
            <p className="profile-empty-text">{t('profile.noTerms', { query })}</p>
          ) : (
            <div className="glossary-list">
              {results.map(entry => (
                <div key={entry.term} className="glossary-entry">
                  <p className="glossary-term">{entry.term}</p>
                  <p className="glossary-def">{entry.definition}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---------- A topic ----------
  if (topic) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setView(null)} />
          <p className="readings-eyebrow">{t('learn.eyebrow')}</p>
          <h1 className="struggle-category-title">{topic.title}</h1>
        </div>
        <div className="page-content">
          {topic.kind === 'parables' ? (
            <ParableList
              key={topic.id}
              groups={topic.parables}
              topicId={topic.id}
              searchable={topic.searchable}
              allLabel={topic.id === 'popes' ? (lang === 'es' ? 'Todos' : 'All') : undefined}
              onPick={topic.id === 'popes'
                ? (item => {
                    popeFrom.current = 'topic:popes'
                    goFrom('topic:popes', 'pope:' + item.num)
                  })
                : undefined}
              initialActive={topic.id === 'popes' ? listState.current.active : 0}
              onActiveChange={topic.id === 'popes'
                ? (i => { listState.current.active = i; scrollMem.current['topic:popes'] = null })
                : undefined}
            />
          ) : topic.kind === 'timeline' ? (
            <div className="timeline">
              {topic.events.map((event, ei) => (
                <div className="timeline-entry" data-entry={ei} key={event.label + event.title}>
                  <span className="timeline-node" aria-hidden="true" />
                  <span className="timeline-year">{event.label}</span>
                  <h2 className="timeline-title">{event.title}</h2>
                  <p className="timeline-body">{event.body}</p>
                  {(() => {
                    const all = ((topics.find(x => x.id === 'popes') || {}).parables || [])
                      .flatMap(g => g.items)
                    const who = all.find(pp => {
                      const m = /(\d{1,4})\D+(\d{1,4})?/.exec(pp.ref || '')
                      if (!m) return false
                      const a = parseInt(m[1], 10)
                      const b = m[2] ? parseInt(m[2], 10) : new Date().getFullYear()
                      return event.year >= a && event.year <= b
                    })
                    return who ? (
                      <button
                        type="button"
                        className="timeline-pope"
                        onClick={() => {
                          popeFrom.current = 'topic:timeline'
                          scrollMem.current['topic:timeline'] = { anchor: ei }
                          setView('pope:' + who.num)
                        }}
                      >
                        {(lang === 'es' ? 'Papa: ' : 'Pope: ') + who.title}
                      </button>
                    ) : null
                  })()}
                  {event.img ? (
                    <figure className="timeline-figure">
                      <img className="timeline-img" src={event.img} alt="" decoding="async" />
                      {event.caption ? <figcaption className="timeline-caption">{event.caption}</figcaption> : null}
                    </figure>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            topic.sections.map(section => (
              <div className="learn-block" key={section.heading}>
                <h2 className="learn-block-heading">{section.heading}</h2>
                <p className="learn-block-body">{section.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // ---------- Index ----------
  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">{t('learn.eyebrow')}</p>
        <h1 className="struggle-category-title">{t('learn.title')}</h1>
      </div>
      <div className="page-content">
        <Section label={t('learn.topics')}>
          {topics.filter(x => x.group === 'topics').map(x => (
            <Row
              key={x.id}
              name={x.title}
              value={x.blurb}
              onClick={() => setView('topic:' + x.id)}
            />
          ))}
        </Section>

        <Section label={t('learn.history')}>
          {topics.filter(x => x.group === 'history').map(x => (
            <Row
              key={x.id}
              name={x.title}
              value={x.blurb}
              onClick={() => setView('topic:' + x.id)}
            />
          ))}
        </Section>

        <Section label={t('learn.reference')}>
          <Row
            name={t('profile.glossary')}
            value={t('learn.glossarySub')}
            onClick={() => setView('glossary')}
          />
          {topics.filter(x => x.group === 'reference').map(x => (
            <Row
              key={x.id}
              name={x.title}
              value={x.blurb}
              onClick={() => setView('topic:' + x.id)}
            />
          ))}
        </Section>

      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <section className="home-section">
      <h2 className="home-section-head">
        <span className="home-section-label">{label}</span>
        <span className="home-section-rule" aria-hidden="true" />
      </h2>
      <div className="home-panel">{children}</div>
    </section>
  )
}

function Row({ name, value, onClick }) {
  return (
    <button className="home-row" onClick={onClick}>
      <span className="home-row-text">
        <span className="home-row-name">{name}</span>
        {value && <span className="home-row-value">{value}</span>}
      </span>
      <span className="home-row-chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </span>
    </button>
  )
}

export default Learn


function ParableList({ groups, topicId, searchable, onPick, allLabel, initialActive, onActiveChange }) {
  const navigate = useNavigate()

  // A unit is a kind for the miracles and a gospel for the parables. They
  // become the chips, so the page shows one set at a time and is never a
  // screen of headings with nothing under them.
  const units = []
  groups.forEach(g => {
    const name = g.kind || g.gospel
    let u = units.find(x => x.name === name)
    if (!u) {
      u = { name, sub: [], count: 0 }
      units.push(u)
    }
    u.sub.push({ gospel: g.gospel, items: g.items })
    u.count += g.items.length
  })

  // An "All" chip first, newest to oldest, so the current pope is the first
  // thing on the page.
  if (allLabel) {
    const everything = units.flatMap(u => u.sub.flatMap(sg => sg.items))
    const ordered = [...everything].sort((a, b) => (b.num || 0) - (a.num || 0))
    units.unshift({ name: allLabel, sub: [{ gospel: null, items: ordered }], count: ordered.length })
  }

  const [active, setActive] = useState(initialActive || 0)
  const [query, setQuery] = useState('')
  // One pill, moved with a transform between measured chip boxes. Letting
  // framer-motion animate layout here meant re-measuring a horizontal
  // scroller and the whole list under it on every frame.
  const chipRefs = useRef([])
  const [pill, setPill] = useState(null)
  useLayoutEffect(() => {
    const el = chipRefs.current[active]
    if (!el) return
    const place = () => setPill({
      x: el.offsetLeft, y: el.offsetTop,
      w: el.offsetWidth, h: el.offsetHeight,
    })
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [active, topicId, units.length])
  const unit = units[active] || units[0]

  function openVerse(item) {
    // The reference carries the passage, so the whole thing lights up rather
    // than one verse out of the middle of it. "Matthew 13:1-23" lands on 1
    // and marks through 23.
    const m = /(\d+):(\d+)(?:-(\d+))?/.exec(item.ref) || []
    const start = m[2] ? parseInt(m[2], 10) : item.verse
    const end = m[3] ? parseInt(m[3], 10) : start
    navigate('/bible', {
      state: {
        preview: {
          slug: item.slug,
          chapter: m[1] ? parseInt(m[1], 10) : item.chapter,
          verse: start,
          verseEnd: end,
          land: true,
          testament: 'NT',
        },
        returnTo: '/learn?topic=' + topicId,
      },
    })
  }

  const q = query.trim().toLowerCase()
  const results = q
    ? units.flatMap(u => u.sub.flatMap(sg => sg.items
        .filter(it => it.title.toLowerCase().includes(q) ||
                      String(it.ref).toLowerCase().includes(q) ||
                      String(it.num || '') === q)
        .map(it => ({ it, era: u.name, gospel: sg.gospel }))))
    : []

  if (!unit) return null

  return (
    <div className="parables">
      {searchable && (
        <input
          type="search"
          className="parable-search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search"
          aria-label="Search"
        />
      )}

      {q ? (
        <div className="parable-group">
          {results.length === 0 ? (
            <p className="parable-empty">Nothing found</p>
          ) : results.map(({ it, era }) => (
            <button
              type="button"
              className="parable-row"
              key={era + it.title + it.ref}
              onClick={() => (onPick ? onPick(it) : it.slug && openVerse(it))}
              disabled={!onPick && !it.slug}
            >
              {it.num ? <span className="parable-num">{it.num}</span> : null}
              {POPE_IMAGES[it.num] ? (
                <img className="parable-thumb" src={POPE_IMAGES[it.num]} alt="" loading="lazy" />
              ) : it.num ? <span className="parable-thumb blank" /> : null}
              <span className="parable-name">{it.title}</span>
              <span className="parable-ref">{it.ref}</span>
            </button>
          ))}
        </div>
      ) : (
      <>
      <div className="parable-chips">
        {pill && (
          <span
            className="parable-chip-pill"
            style={{
              transform: `translate3d(${pill.x}px, ${pill.y}px, 0)`,
              width: pill.w,
              height: pill.h,
            }}
          />
        )}
        {units.map((u, i) => (
          <button
            type="button"
            key={u.name}
            ref={el => { chipRefs.current[i] = el }}
            className={`parable-chip ${i === active ? 'active' : ''}`}
            onClick={() => { setActive(i); if (onActiveChange) onActiveChange(i) }}
          >
            {u.name}
            <span className="parable-chip-count">{u.count}</span>
          </button>
        ))}
      </div>

      {unit.sub.map(sg => (
        <div className="parable-group" key={sg.gospel}>
          {sg.gospel && unit.name !== sg.gospel
              ? <h4 className="parable-group-heading">{sg.gospel}</h4>
              : null}
          {sg.items.map(item => (
            item.slug ? (
              <button
                type="button"
                className="parable-row"
                key={item.ref + item.title}
                onClick={() => openVerse(item)}
              >
                {item.num ? <span className="parable-num">{item.num}</span> : null}
                <span className="parable-name">{item.title}</span>
                <span className="parable-ref">
                  {sg.gospel ? item.ref.replace(sg.gospel + ' ', '') : item.ref}
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="parable-row"
                key={item.ref + item.title}
                onClick={() => onPick && onPick(item)}
                disabled={!onPick}
              >
                {item.num ? <span className="parable-num">{item.num}</span> : null}
                {POPE_IMAGES[item.num] ? (
                  <img className="parable-thumb" src={POPE_IMAGES[item.num]} alt="" loading="lazy" />
                ) : item.num ? <span className="parable-thumb blank" /> : null}
                <span className="parable-name">{item.title}</span>
                <span className="parable-ref">{item.ref}</span>
              </button>
            )
          ))}
        </div>
      ))}
      </>
      )}
    </div>
  )
}
