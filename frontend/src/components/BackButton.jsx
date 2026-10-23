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
    <button className="back-button" onClick={handleClick}>
      {`\u2190 ${t('common.back')}`}
    </button>
  )
}

export default BackButton