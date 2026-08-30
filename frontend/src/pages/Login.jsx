import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API_URL from '../config'

// A shared read-only-ish account so anyone can see the app without
// creating one. The credentials are public on purpose: the login wall
// was hiding the entire app from anyone evaluating it.
const DEMO_EMAIL = 'demo@commune.app'
const DEMO_PASSWORD = 'demopass123'

function Login() {
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
        throw new Error(data.detail || 'Login failed')
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
        <h1 className="auth-title">Welcome back</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        {/* One tap into the app, no account needed. */}
        <div className="auth-demo-block">
          <p className="auth-demo-label">Just looking around?</p>
          <button
            type="button"
            className="auth-demo-btn"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            Explore with a demo account
          </button>
        </div>

        <p className="auth-switch">
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>
        <p className="auth-switch">
          Don't have an account? <a href="/register">Create one</a>
        </p>
      </div>
    </div>
  )
}
export default Login
