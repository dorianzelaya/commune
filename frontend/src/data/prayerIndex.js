// One place that answers "what are the prayers, in this language" and
// "which prayer is this id".
//
// WHY IDS EXIST
//
// Saved prayers used to be keyed on the English name, and each save
// stored a full copy of the prayer: name, text, image, caption, history.
// That worked exactly as long as there was one language. With Spanish it
// breaks twice over - a prayer saved in English stops looking saved once
// the names are Spanish, and the stored copy keeps serving English text
// forever no matter what language the app is in.
//
// So every prayer now carries a stable id slugged from its English name
// ("our-father", "hail-holy-queen"). Saves store the id and nothing else.
// The text is resolved from whichever language's file is current, which
// means a prayer saved in English reads in Spanish the moment the user
// switches, with no migration of their data and no duplicate entries.
//
// The ids are derived from the English names but are NOT the English
// names: they are identifiers, so they stay fixed even if a display name
// is reworded later.

import PRAYERS_EN from './prayers'
import PRAYERS_ES from './prayers.es'

// Translations are PARTIAL AND FLAT, keyed by prayer id, and they only
// carry the fields that have been translated:
//
//   { 'sign-of-the-cross': { name: '...', text: '...' } }
//
// Two reasons it is shaped that way rather than as a full copy of the
// English structure. The categories and the image paths are not language
// specific, so duplicating them would just be two places to keep in step.
// And the prayers can be translated a few at a time: a prayer missing
// from this file, or carrying a name but no text yet, still appears in
// the list and still opens. It falls back FIELD BY FIELD to English, so
// there is never a half-built-looking page and never a blank prayer.
const OVERRIDES = {
  es: PRAYERS_ES,
}

// One prayer with its translated fields laid over the English ones. An
// empty or missing value never wins, which is what lets a half-finished
// entry be committed safely.
function merge(prayer, lang) {
  const over = OVERRIDES[lang]?.[prayer.id]
  if (!over) return prayer

  const out = { ...prayer }
  for (const [field, value] of Object.entries(over)) {
    if (value) out[field] = value
  }
  return out
}

// getPrayers is called on every render of the Prayers page, so the merged
// table is built once per language and kept.
const MERGED_CACHE = { en: PRAYERS_EN }

function buildMerged(lang) {
  const out = {}
  for (const [category, list] of Object.entries(PRAYERS_EN)) {
    out[category] = list.map(p => merge(p, lang))
  }
  return out
}

// Category keys are identifiers, not display text. They stay in English
// in every language's file so that getPrayers('es') and getPrayers('en')
// have the same shape and code can compare against a fixed key like
// 'Daily Prayers'. What the user reads comes from the string table.
export const CATEGORY_KEY_TO_LABEL = {
  'Daily Prayers': 'prayers.cat.daily',
  'Creeds': 'prayers.cat.creeds',
  'Marian Prayers': 'prayers.cat.marian',
  'Acts': 'prayers.cat.acts',
  'To the Holy Spirit': 'prayers.cat.spirit',
  'Eucharistic': 'prayers.cat.eucharist',
  'Saint Prayers': 'prayers.cat.saints',
  'Devotional': 'prayers.cat.devotional',
  'Divine Mercy': 'prayers.cat.mercy',
  'Penitential': 'prayers.cat.penitential',
  'Litany': 'prayers.cat.litany',
}

/** The string key for a category, or the raw key if it is unknown. */
export function categoryLabelKey(category) {
  return CATEGORY_KEY_TO_LABEL[category] || category
}

export function getPrayers(lang) {
  if (!lang || !OVERRIDES[lang]) return PRAYERS_EN
  if (!MERGED_CACHE[lang]) MERGED_CACHE[lang] = buildMerged(lang)
  return MERGED_CACHE[lang]
}

/**
 * Look up one prayer by id. Falls back to English so a prayer that has
 * not been translated yet still opens.
 */
export function findPrayer(id, lang) {
  if (!id) return null

  for (const list of Object.values(PRAYERS_EN)) {
    const hit = list.find(p => p.id === id)
    if (hit) return merge(hit, lang)
  }
  return null
}

/**
 * The category a prayer sits in, in the current language. Needed because
 * saves no longer store it.
 */
export function categoryFor(id, lang) {
  const table = getPrayers(lang)
  for (const [category, list] of Object.entries(table)) {
    if (list.some(p => p.id === id)) return category
  }
  return null
}

// Built once from the English table. Used only to migrate saves made
// before ids existed.
const ID_BY_EN_NAME = (() => {
  const map = {}
  for (const list of Object.values(PRAYERS_EN)) {
    for (const p of list) map[p.name] = p.id
  }
  return map
})()

/**
 * Normalise one stored saved-prayer entry to { id }.
 *
 * Old entries are full snapshots keyed on the English name; new ones
 * already carry an id. Anything that cannot be resolved returns null and
 * is dropped by the caller rather than rendered as a blank row.
 */
export function normalizeSaved(entry) {
  if (!entry) return null
  if (entry.id && findPrayer(entry.id, 'en')) return { id: entry.id }

  const id = ID_BY_EN_NAME[entry.name]
  return id ? { id } : null
}

export function normalizeSavedList(list) {
  if (!Array.isArray(list)) return []

  const out = []
  const seen = new Set()
  for (const entry of list) {
    const norm = normalizeSaved(entry)
    if (norm && !seen.has(norm.id)) {
      seen.add(norm.id)
      out.push(norm)
    }
  }
  return out
}
