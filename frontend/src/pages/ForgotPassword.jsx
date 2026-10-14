import { useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { Link } from 'react-router-dom'
import API_URL from '../config'

function ForgotPassword() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || loading) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!res.ok) throw new Error('Something went wrong. Please try again.')

      // Backend always returns success regardless of whether the email
      // exists, so this branch covers both cases deliberately.
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="page">
        <div className="page-content auth-page">
          <div className="auth-form">
            <h1 className="auth-title">{t('auth.checkEmail')}</h1>
            <p className="auth-subtitle">
              If an account exists for {email}, we've sent a link to reset your password.
              It expires in 30 minutes.
            </p>
            <Link to="/login" className="auth-link-back">
              ← Back to log in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-content auth-page">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1 className="auth-title">{t('auth.forgot')}</h1>
          <p className="auth-subtitle">{t('auth.forgotBlurb')}</p>

          {error && <p className="auth-error">{error}</p>}

          <input
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <Link to="/login" className="auth-link-back">
            ← Back to log in
          </Link>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
