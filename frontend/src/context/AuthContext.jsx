import { createContext, useContext, useState, useEffect } from 'react'
import API_URL from '../config'
import * as syncedState from '../utils/syncedState'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Resolve the logged-in user whenever we hold a token.
  // Without this, `user` stayed null forever and the account card
  // fell back to a placeholder name.
  useEffect(() => {
    let cancelled = false

    async function loadUser() {
      const saved = localStorage.getItem('token')

      if (!saved) {
        if (!cancelled) {
          setUser(null)
          setToken(null)
          setLoading(false)
        }
        return
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${saved}` },
        })

        if (cancelled) return

        if (res.ok) {
          setUser(await res.json())
          setToken(saved)

          // Pull this user's cross-device state down BEFORE loading
          // finishes. ProtectedRoute renders null while loading, so every
          // page mounts afterwards and its useState initialisers read
          // localStorage once it is already correct. hydrate() never
          // throws and times itself out, so a sync problem cannot leave
          // the app stuck on a blank screen.
          await syncedState.hydrate()
          syncedState.start()
        } else if (res.status === 401) {
          // Token expired or invalid — clear it so the user is sent to login
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
          syncedState.stop()
          syncedState.clearLocal()
        }
      } catch {
        // Network failure: keep the token, just leave user unresolved
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadUser()
    return () => { cancelled = true }
  }, [token])

  function login(newToken) {
    localStorage.setItem('token', newToken)
    setToken(newToken)   // triggers the effect above, which fetches the user
    setLoading(true)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    // Stop pushing, then drop this user's synced keys so the next person
    // to log in on this device does not inherit them. Their copy is on
    // the server and comes back at their next login.
    syncedState.stop()
    syncedState.clearLocal()
  }

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
