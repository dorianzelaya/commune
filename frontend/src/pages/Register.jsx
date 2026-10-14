import { useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API_URL from '../config'

function Register() {
  const { t } = useLang()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const registerResponse = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, email, password })
      })

      if (!registerResponse.ok) {
        const data = await registerResponse.json()
        throw new Error(data.detail || 'Registration failed')
      }

      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const loginData = await loginResponse.json()
      login(loginData.access_token)
      navigate('/home')

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="auth-page">
        <h1 className="auth-title">{t('auth.createAccount')}</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t('auth.firstName')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">{t('auth.haveAccount')}<a href="/login">{t('auth.logIn')}</a>
        </p>
      </div>
    </div>
  )
}

export default Register