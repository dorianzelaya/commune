import { useState, useEffect } from 'react'
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
  const [view, setView] = useState(null)
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
            <ParableList groups={topic.parables} />
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


function ParableList({ groups }) {
  const navigate = useNavigate()
  function open(item) {
    navigate('/bible', {
      state: {
        preview: {
          slug: item.slug,
          chapter: item.chapter,
          verse: item.verse,
          land: true,
          testament: 'NT',
        },
        returnTo: '/learn',
      },
    })
  }
  let section = null
  let kind = null
  return (
    <div className="parables">
      {groups.map((group, gi) => {
        const newSection = group.section && group.section !== section
        if (newSection) { section = group.section; kind = null }
        const newKind = group.kind && group.kind !== kind
        if (newKind) kind = group.kind
        return (
          <div className="parable-group" key={gi}>
            {newSection ? <h2 className="parable-section">{group.section}</h2> : null}
            {newKind ? <h3 className="parable-kind">{group.kind}</h3> : null}
            <h4 className="parable-group-heading">{group.gospel}</h4>
            {group.items.map(item => (
              <button
                type="button"
                className="parable-row"
                key={item.ref + item.title}
                onClick={() => open(item)}
              >
                <span className="parable-name">{item.title}</span>
                <span className="parable-ref">{item.ref}</span>
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}
