import { useLang } from '../i18n/LanguageContext'
import { LANGUAGES } from '../i18n/strings'

/**
 * Language control for the Profile page, built to match ThemePicker so
 * the two read as one settings block.
 *
 * Each language is labelled in its own language - "Español", not
 * "Spanish" - because someone who has the app in the wrong language needs
 * to recognise their own, not read English.
 *
 * The choice is written to localStorage under "language", which is in
 * SYNCED_KEYS, so it follows the account to every device.
 */
function LanguagePicker() {
  const { lang, setLang, t } = useLang()

  return (
    <>
      <p className="profile-section-label">{t('lang.heading')}</p>
      <div className="profile-section">
        {LANGUAGES.map((l, i) => (
          <div key={l.key}>
            {i > 0 && <div className="profile-divider" />}
            <button
              className={`profile-feature-row profile-lang-row ${lang === l.key ? 'active' : ''}`}
              onClick={() => setLang(l.key)}
            >
              <span className="profile-theme-radio" aria-hidden="true" />
              <span className="profile-row-label">{l.label}</span>
            </button>
          </div>
        ))}
        <div className="profile-divider" />
        <p className="profile-lang-desc">{t('lang.desc')}</p>
      </div>
    </>
  )
}

export default LanguagePicker
