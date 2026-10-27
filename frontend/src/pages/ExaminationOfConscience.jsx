import { useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import BackButton from '../components/BackButton'
import { getExamination } from '../data/examinationIndex'


const ACT_OF_CONTRITION = "O My God, I am heartily sorry for having offended you, and I detest all my sins, because of your just punishments, but most of all, because they offend you, my God, who are all good and deserving of all my love. I firmly resolve, with the help of your grace, to sin no more, and to avoid the near occasions of sin. Amen."
// The same prayer as prayers.es.js carries under act-of-contrition,
// so the examination and the prayer page never disagree.
const ACT_OF_CONTRITION_ES = "Dios mío, me arrepiento de todo corazón de todos mis pecados y los aborrezco, por el castigo que merecen, pero sobre todo porque te ofenden a ti, que eres todo bondad y digno de todo mi amor. Propongo firmemente, con el auxilio de tu gracia, no volver a pecar y evitar las ocasiones próximas de pecado. Amén."

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
            {t('exam.closing')}
          </p>
        </div>
        <div className="examination-act-of-contrition">
          <p className="examination-act-label">{t('exam.contrition')}</p>
          <p className="examination-act-text">
            {lang === 'es' ? ACT_OF_CONTRITION_ES : ACT_OF_CONTRITION}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ExaminationOfConscience
