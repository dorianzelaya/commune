// Language resolution for the glossary. Sorting is by the DISPLAYED term
// via localeCompare, because translation reorders the alphabet. Search
// strips diacritics from both sides so "oracion" finds "oración".

import GLOSSARY_EN from './glossary'
import GLOSSARY_ES from './glossary.es'

const OVERRIDES = { es: GLOSSARY_ES }
const CACHE = {}

export function normalize(str) {
  return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function getGlossary(lang) {
  const key = lang || 'en'
  if (CACHE[key]) return CACHE[key]

  const over = OVERRIDES[lang]
  const merged = GLOSSARY_EN.map(entry => {
    const o = over?.[entry.id]
    if (!o) return entry
    const out = { ...entry }
    if (o.term) out.term = o.term
    if (o.definition) out.definition = o.definition
    return out
  })

  merged.sort((a, b) => a.term.localeCompare(b.term, key, { sensitivity: 'base' }))
  CACHE[key] = merged
  return merged
}

export function searchGlossary(query, lang) {
  const all = getGlossary(lang)
  const q = normalize(query).trim()
  if (!q) return all
  return all.filter(e => normalize(e.term).includes(q) || normalize(e.definition).includes(q))
}
