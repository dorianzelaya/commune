import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'

function BackButton({ to = '/home', onClick }) {
  const navigate = useNavigate()
  const { t } = useLang()

  function handleClick() {
    if (onClick) {
      onClick()
    } else {
      navigate(to)
    }
  }

  return (
    <button className="back-button" onClick={handleClick} aria-label={t('common.back')}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  )
}

export default BackButton