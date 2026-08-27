// Reading text size preference.
//
// Deliberately scoped to READING CONTENT only (Bible verses, verse
// numbers, section headings) rather than the whole interface. Scaling
// everything would break layouts that depend on fixed heights — the home
// tiles and the Seek verse slot both do — and the accessibility need here
// is specifically about reading long passages, not about nav labels.
//
// The chosen size is written to a data attribute on <html>, which CSS
// reads to set a --reading-scale multiplier. Persisted in localStorage so
// it survives reloads and app restarts.

const STORAGE_KEY = 'reading_text_size'

export const TEXT_SIZES = ['normal', 'large', 'larger']

export const TEXT_SIZE_LABELS = {
  normal: 'Normal',
  large: 'Large',
  larger: 'Larger',
}

export function getTextSize() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return TEXT_SIZES.includes(saved) ? saved : 'normal'
  } catch {
    return 'normal'
  }
}

export function setTextSize(size) {
  const value = TEXT_SIZES.includes(size) ? size : 'normal'
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // storage unavailable — the attribute below still applies for this session
  }
  applyTextSize(value)
  return value
}

// Sets the attribute CSS keys off of. Safe to call repeatedly.
export function applyTextSize(size) {
  const value = TEXT_SIZES.includes(size) ? size : 'normal'
  document.documentElement.setAttribute('data-text-size', value)
}
