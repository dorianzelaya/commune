import { useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API_URL from '../config'

// A shared read-only-ish account so anyone can see the app without
// creating one. The credentials are public on purpose: the login wall
// was hiding the entire app from anyone evaluating it.
const DEMO_EMAIL = 'demo@commune.app'
const DEMO_PASSWORD = 'demopass123'

function Login() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  // Shared by the form and the demo button so there is one login path.
  async function doLogin(emailValue, passwordValue) {
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue, password: passwordValue })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || t('auth.loginFailed'))
      }
      const data = await response.json()
      login(data.access_token)
      navigate('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    doLogin(email, password)
  }

  function handleDemoLogin() {
    doLogin(DEMO_EMAIL, DEMO_PASSWORD)
  }

  return (
    <div className="page">
      <div className="auth-page">
        <h1 className="auth-title">{t('auth.welcomeBack')}</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
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
            {loading ? t('auth.loggingIn') : t('auth.logIn')}
          </button>
        </form>

        {/* One tap into the app, no account needed. */}
        <div className="auth-demo-block">
          <p className="auth-demo-label">{t('auth.lookingAround')}</p>
          <button
            type="button"
            className="auth-demo-btn"
            onClick={handleDemoLogin}
            disabled={loading}
          >{t('auth.demo')}</button>
        </div>

        <p className="auth-switch">
          <Link to="/forgot-password">{t('auth.forgot')}</Link>
        </p>
        <p className="auth-switch">{t('auth.noAccount')}<a href="/register">{t('auth.createOne')}</a>
        </p>
      </div>
    </div>
  )
}
export default Login
