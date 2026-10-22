// Book names and reference strings in the current language.
//
// Two jobs, because book names reach the screen two different ways.
//
// bookName() handles the places that already have a book object or slug:
// the Bible reader's book list, its chapter header, the search results.
//
// localizeRef() handles the places where the name arrives INSIDE a string
// the backend built, like "Ephesians 3:14" from the lectionary. Those
// cannot be looked up by slug because the slug was never sent, so the
// English name at the front of the string is rewritten in place and the
// chapter and verse numbers are left exactly as they came.

import BIBLE_BOOKS from './bible'
import ES_BY_SLUG, { EXTRA_EN } from './bibleNames.es'

const BY_SLUG = { es: ES_BY_SLUG }

/** A book's display name. Takes a book object or a slug. */
export function bookName(book, lang) {
  if (!book) return ''
  const slug = typeof book === 'string' ? book : book.slug
  const translated = BY_SLUG[lang]?.[slug]
  if (translated) return translated
  if (typeof book === 'string') {
    for (const list of Object.values(BIBLE_BOOKS)) {
      const hit = list.find(b => b.slug === slug)
      if (hit) return hit.name
    }
    return slug
  }
  return book.name
}

// English name -> translated name, for rewriting reference strings.
// Longest first, so "1 John" is tried before "John" and "Song of Songs"
// before "Song".
const REF_TABLE = (() => {
  const out = {}
  for (const [lang, table] of Object.entries(BY_SLUG)) {
    const pairs = []
    for (const list of Object.values(BIBLE_BOOKS)) {
      for (const b of list) {
        if (table[b.slug]) pairs.push([b.name, table[b.slug]])
      }
    }
    if (lang === 'es') {
      for (const [en, es] of Object.entries(EXTRA_EN)) pairs.push([en, es])
    }
    pairs.sort((a, b) => b[0].length - a[0].length)
    out[lang] = pairs
  }
  return out
})()

/**
 * "Ephesians 3:14" -> "Efesios 3:14".
 *
 * Only the leading book name is touched. An unrecognised name comes back
 * unchanged, which is the right failure: a reference that still reads in
 * English is usable, a mangled one is not.
 */
export function localizeRef(ref, lang) {
  if (!ref) return ref
  const pairs = REF_TABLE[lang]
  if (!pairs) return ref

  for (const [en, translated] of pairs) {
    if (ref.startsWith(en)) return translated + ref.slice(en.length)
  }
  return ref
}
