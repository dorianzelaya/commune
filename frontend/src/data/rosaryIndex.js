// Language resolution for the rosary mysteries, mirroring prayerIndex.js.
//
// The mystery SET keys (Joyful, Sorrowful, Glorious, Luminous) stay
// English forever. rosary_mystery stores one in localStorage and it syncs
// across devices, so translating a key would orphan saved progress and
// strand anyone mid-rosary. Their display names come from the string
// table via setLabelKey().

import { MYSTERIES as MYSTERIES_EN, PRAYERS as PRAYERS_EN } from './rosary'
import MYSTERIES_ES from './rosary.es'
import PRAYERS_ES from './rosaryPrayers.es'

const OVERRIDES = {
  es: MYSTERIES_ES,
}

export const SET_LABEL_KEY = {
  Joyful: 'rosary.set.joyful',
  Sorrowful: 'rosary.set.sorrowful',
  Glorious: 'rosary.set.glorious',
  Luminous: 'rosary.set.luminous',
}

/** String key for a mystery set's display name, or the raw key. */
export function setLabelKey(setName) {
  return SET_LABEL_KEY[setName] || setName
}

// Field-by-field, so an untranslated mystery still renders and an empty
// value never wins.
function merge(mystery, lang) {
  const over = OVERRIDES[lang]?.[mystery.id]
  if (!over) return mystery

  const out = { ...mystery }
  for (const [field, value] of Object.entries(over)) {
    if (value) out[field] = value
  }
  return out
}

const CACHE = { en: MYSTERIES_EN }

/**
 * The whole MYSTERIES table in one language, same shape as the English
 * one, so buildRosarySteps and the day lookup keep working unchanged.
 */
export function getMysteries(lang) {
  if (!lang || !OVERRIDES[lang]) return MYSTERIES_EN
  if (!CACHE[lang]) {
    const out = {}
    for (const [set, data] of Object.entries(MYSTERIES_EN)) {
      out[set] = { ...data, mysteries: data.mysteries.map(m => merge(m, lang)) }
    }
    CACHE[lang] = out
  }
  return CACHE[lang]
}

// ---------------------------------------------------------------------
// The prayers recited at each bead.
//
// These live in rosary.js rather than prayers.js and their wording
// differs on purpose, so they get their own override file instead of
// being resolved through prayerIndex. Same field-by-field fallback: an
// entry with a Spanish name but no Spanish text yet shows the Spanish
// title above the English prayer.

const PRAYER_OVERRIDES = {
  es: PRAYERS_ES,
}

const PRAYER_CACHE = { en: PRAYERS_EN }

export function getRosaryPrayers(lang) {
  if (!lang || !PRAYER_OVERRIDES[lang]) return PRAYERS_EN
  if (!PRAYER_CACHE[lang]) {
    const out = {}
    for (const [key, prayer] of Object.entries(PRAYERS_EN)) {
      const over = PRAYER_OVERRIDES[lang][key]
      if (!over) {
        out[key] = prayer
        continue
      }
      const merged = { ...prayer }
      for (const [field, value] of Object.entries(over)) {
        if (value) merged[field] = value
      }
      out[key] = merged
    }
    PRAYER_CACHE[lang] = out
  }
  return PRAYER_CACHE[lang]
}
