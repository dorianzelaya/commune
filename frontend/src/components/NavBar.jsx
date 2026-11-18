import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import { useEffect, useRef, useState } from 'react'

const ICONS = {
  Home: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  ),
  Readings: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z"/>
      <path d="M12 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z"/>
    </svg>
  ),
  Bible: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5V4.5z"/>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <line x1="12" y1="6.5" x2="12" y2="12"/>
      <line x1="9.5" y1="9.25" x2="14.5" y2="9.25"/>
    </svg>
  ),
  Seek: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <line x1="16.2" y1="16.2" x2="21" y2="21"/>
    </svg>
  ),
  Profile: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
}

function NavBar() {
  const { t, lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [indicatorStyle, setIndicatorStyle] = useState({ opacity: 0 })
  const [ready, setReady] = useState(false)
  const tabRefs = useRef([])

  const tabs = [
    { label: 'Home',     path: '/home'     },
    { label: 'Readings', path: '/readings' },
    { label: 'Bible',    path: '/bible'    },
    { label: 'Seek',     path: '/struggle' },
    { label: 'Profile',  path: '/profile'  },
  ]

  const activeIndex = tabs.findIndex(tab => tab.path === location.pathname)

  useEffect(() => {
    const activeTab = tabRefs.current[activeIndex]
    if (activeTab) {
      const { offsetLeft, offsetWidth } = activeTab
      setIndicatorStyle({
        transform: `translateX(${offsetLeft}px)`,
        width: `${offsetWidth}px`,
        opacity: 1,
      })
      requestAnimationFrame(() => setReady(true))
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }))
    }
  }, [activeIndex])

  function handleTabClick(tab) {
    if (tab.path === '/bible' && location.pathname === '/bible') {
      // Same approach as Rosary and Profile: let the page reset itself. The
      // old version checked localStorage to decide whether to act, which
      // broke when the reader was opened from Seek, since preview mode never
      // writes those keys. Bible.jsx knows what view it is on; NavBar does
      // not, and should not have to guess.
      window.dispatchEvent(new CustomEvent('bible:reset'))
      return
    }

    if (tab.path === '/struggle' && location.pathname === '/struggle') {
      // Back to the directory from a passage or a search, the same way the
      // Bible and Profile tabs reset their own pages.
      window.dispatchEvent(new CustomEvent('seek:reset'))
      return
    }

    if (tab.path === '/profile' && location.pathname === '/profile') {
      // Already inside Profile — fire a custom event so Profile.jsx
      // can reset its view state without prop drilling or a remount
      window.dispatchEvent(new CustomEvent('profile:reset'))
      return
    }

    // Any other same-tab tap — do nothing
    if (tab.path === location.pathname) return

    navigate(tab.path)
  }

  return (
    <nav className="navbar">
      <div
        className={`nav-indicator ${ready ? 'animate' : ''}`}
        style={indicatorStyle}
      />
      <div className="nav-sheen" />
      {tabs.map((tab, i) => {
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            ref={el => tabRefs.current[i] = el}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            <span className="nav-icon">{ICONS[tab.label]}</span>
            {/* label stays English as the identifier for ICONS and the
                route logic; only what the user reads is translated. */}
            <span className="nav-label">{t(`nav.${tab.label.toLowerCase()}`)}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default NavBar
