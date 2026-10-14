import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { STRINGS, DEFAULT_LANG } from './strings'
import { SYNC_EVENT } from '../utils/syncedState'

// Why a context rather than the trick ThemePicker uses:
//
// Changing the theme only sets data-color on <html>, so CSS does the work
// and React never has to re-render. Language is different - the strings
// are in the rendered output, so the tree genuinely has to render again.
// That means state, and state that every screen can read means context.
//
// The alternative was writing localStorage and calling location.reload().
// It would work, and in an installed app a full reload to change a
// setting is a bad enough experience that it is not worth the saved code.

const LanguageContext = createContext(null)

const STORAGE_KEY = 'language'

function readStored() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && STRINGS[saved]) return saved
  } catch {
    // Private mode or blocked storage. Fall through to the device.
  }
  return null
}

// A Spanish phone should open in Spanish without the user hunting for a
// setting. navigator.language is "es", "es-MX", "es-419" and so on, so
// match on the prefix rather than the whole tag.
function fromDevice() {
  const tags = [navigator.language, ...(navigator.languages || [])]
  for (const tag of tags) {
    if (!tag) continue
    const base = String(tag).toLowerCase().split('-')[0]
    if (STRINGS[base]) return base
  }
  return DEFAULT_LANG
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => readStored() || fromDevice())

  // <html lang> is not decoration. Screen readers pick their voice and
  // pronunciation from it, and the browser uses it for hyphenation.
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Cross-device sync writes localStorage directly and then fires
  // SYNC_EVENT. Without listening for it, a language chosen on the phone
  // would sit in storage unread until the next reload. Same hook
  // LiturgicalTheme uses for the same reason.
  useEffect(() => {
    function onSynced() {
      const saved = readStored()
      if (saved) setLang(saved)
    }
    window.addEventListener(SYNC_EVENT, onSynced)
    return () => window.removeEventListener(SYNC_EVENT, onSynced)
  }, [])

  const choose = useCallback(next => {
    if (!STRINGS[next]) return
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Unwritable storage: the choice still applies for this session.
    }
    setLang(next)
  }, [])

  // A missing key falls back to English and then to the key itself, so a
  // gap in a translation shows readable English rather than a blank or a
  // crash. In development it also complains, which is how a missing
  // string gets noticed before a user finds it.
  const t = useCallback(key => {
    const table = STRINGS[lang] || STRINGS[DEFAULT_LANG]
    if (key in table) return table[key]

    const english = STRINGS[DEFAULT_LANG][key]
    if (english !== undefined) {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] missing ${lang} string: ${key}`)
      }
      return english
    }

    if (import.meta.env.DEV) {
      console.warn(`[i18n] unknown string key: ${key}`)
    }
    return key
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang: choose, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

/**
 * const { t, lang, setLang } = useLang()
 *
 * Throws rather than returning a no-op t() if the provider is missing,
 * because a silent fallback would ship English to everyone and look like
 * a translation problem instead of a wiring problem.
 */
export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}
