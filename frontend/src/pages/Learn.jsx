import { useState, useEffect, useRef, useLayoutEffect } from 'react'
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
            <ParableList key={topic.id} groups={topic.parables} topicId={topic.id} />
          ) : topic.kind === 'timeline' ? (
            <div className="timeline">
              {topic.events.map(event => (
                <div className="timeline-entry" key={event.label + event.title}>
                  <span className="timeline-node" aria-hidden="true" />
                  <span className="timeline-year">{event.label}</span>
                  <h2 className="timeline-title">{event.title}</h2>
                  <p className="timeline-body">{event.body}</p>
                  {event.img ? (
                    <figure className="timeline-figure">
                      <img className="timeline-img" src={event.img} alt="" loading="lazy" />
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


function ParableList({ groups, topicId }) {
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

  const [active, setActive] = useState(0)
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

  if (!unit) return null

  return (
    <div className="parables">
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
            onClick={() => setActive(i)}
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
              <div className="parable-row static" key={item.ref + item.title}>
                {item.num ? <span className="parable-num">{item.num}</span> : null}
                <span className="parable-name">{item.title}</span>
                <span className="parable-ref">{item.ref}</span>
              </div>
            )
          ))}
        </div>
      ))}
    </div>
  )
}
