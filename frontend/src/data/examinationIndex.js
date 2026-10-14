// Language resolution for the examination of conscience.
//
// Same contract as prayerIndex and rosaryIndex: partial overrides, falling
// back to English. The questions are an array rather than a field, so a
// translated entry supplies the whole list or none of it - there is no
// sensible way to merge two lists of different lengths, and a half
// translated list would read worse than an English one.

import EXAMINATION_EN from './examination'
import EXAMINATION_ES from './examination.es'

const OVERRIDES = {
  es: EXAMINATION_ES,
}

const CACHE = { en: EXAMINATION_EN }

export function getExamination(lang) {
  if (!lang || !OVERRIDES[lang]) return EXAMINATION_EN
  if (!CACHE[lang]) {
    CACHE[lang] = EXAMINATION_EN.map(item => {
      const over = OVERRIDES[lang][item.id]
      if (!over) return item

      const out = { ...item }
      if (over.commandment) out.commandment = over.commandment
      if (Array.isArray(over.questions) && over.questions.length) {
        out.questions = over.questions
      }
      return out
    })
  }
  return CACHE[lang]
}
