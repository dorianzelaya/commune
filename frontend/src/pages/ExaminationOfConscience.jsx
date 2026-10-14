import { useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import BackButton from '../components/BackButton'
import { getExamination } from '../data/examinationIndex'


const ACT_OF_CONTRITION = "O My God, I am heartily sorry for having offended you, and I detest all my sins, because of your just punishments, but most of all, because they offend you, my God, who are all good and deserving of all my love. I firmly resolve, with the help of your grace, to sin no more, and to avoid the near occasions of sin. Amen."

function ExaminationOfConscience() {
  const { t, lang } = useLang()
  const EXAMINATION = getExamination(lang)
  const [expanded, setExpanded] = useState(null)

  function toggleExpanded(index) {
    setExpanded(expanded === index ? null : index)
  }

  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">{t('exam.eyebrow')}</p>
        <h1 className="examination-title">{t('exam.title')}</h1>
        <p className="examination-subtitle">{t('exam.instructions')}</p>
      </div>
      <div className="page-content">
        <div className="examination-intro">
          <p className="examination-intro-text">{t('exam.opening')}</p>
        </div>
        <div className="examination-list">
          {EXAMINATION.map((item, index) => (
            <div key={index} className="examination-item">
              <button
                className="examination-commandment"
                onClick={() => toggleExpanded(index)}
              >
                <span>{item.commandment}</span>
                <span className="examination-chevron">
                  {expanded === index ? '−' : '+'}
                </span>
              </button>
              {expanded === index && (
                <div className="examination-questions">
                  {item.questions.map((q, qi) => (
                    <p key={qi} className="examination-question">• {q}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="examination-closing">
          <p className="examination-closing-text">
            After your examination, make an Act of Contrition and approach the sacrament of Confession with confidence in God's mercy.
          </p>
        </div>
        <div className="examination-act-of-contrition">
          <p className="examination-act-label">{t('exam.contrition')}</p>
          <p className="examination-act-text">{ACT_OF_CONTRITION}</p>
        </div>
      </div>
    </div>
  )
}

export default ExaminationOfConscience
