// Display names for the Seek groups and topics.
//
// The English names in Struggle.jsx are IDENTIFIERS, not display text:
// the topic is posted to /struggle/search as the category and matched
// against the category column in Postgres. Translating GROUPS itself
// would break every lookup, so the English names stay and the label is
// resolved here at render time.
//
// Same partial-override shape as the glossary and the prayers: a name
// missing from a language simply renders in English, so a new topic can
// ship before its translation exists.

const ES = {
  // Groups
  'Growth': 'Crecimiento',
  'Virtues': 'Virtudes',
  'Emotions': 'Emociones',
  'Faith Struggles': 'Luchas de fe',
  'Sins & Vices': 'Pecados y vicios',
  'Life Situations': 'Situaciones de la vida',

  // Growth
  'Discernment': 'Discernimiento',
  'Wisdom': 'Sabiduría',
  'Peace': 'Paz',
  'Hope': 'Esperanza',
  'Knowledge': 'Conocimiento',

  // Virtues
  'Humility': 'Humildad',
  'Charity': 'Caridad',
  'Patience': 'Paciencia',
  'Courage': 'Valentía',
  'Gratitude': 'Gratitud',
  'Forgiveness': 'Perdón',
  'Faith': 'Fe',
  'Fortitude': 'Fortaleza',
  'Prudence': 'Prudencia',
  'Justice': 'Justicia',
  'Temperance': 'Templanza',
  'Chastity': 'Castidad',
  'Generosity': 'Generosidad',
  'Diligence': 'Diligencia',
  'Resilience': 'Resiliencia',
  'Discipline': 'Disciplina',

  // Emotions. Anger is the feeling, Wrath further down is the capital
  // sin; Spanish uses Ira for the sin, so the feeling is Enojo to keep
  // the two rows from reading identically.
  'Anxiety': 'Ansiedad',
  'Fear': 'Miedo',
  'Sadness': 'Tristeza',
  'Loneliness': 'Soledad',
  'Grief': 'Duelo',
  'Anger': 'Enojo',
  'Shame': 'Vergüenza',

  // Faith Struggles
  'Doubt': 'Duda',
  'Despair': 'Desesperación',
  'Feeling distant from God': 'Sentirse lejos de Dios',
  'Temptation': 'Tentación',
  'Lukewarmness': 'Tibieza',

  // Sins & Vices
  'Lust': 'Lujuria',
  'Pride': 'Soberbia',
  'Envy': 'Envidia',
  'Gluttony': 'Gula',
  'Sloth': 'Pereza',
  'Greed': 'Avaricia',
  'Wrath': 'Ira',

  // Life Situations
  'Family conflict': 'Conflicto familiar',
  'Work stress': 'Estrés laboral',
  'Relationship trouble': 'Problemas de pareja',
  'Financial worry': 'Preocupación económica',
  'Illness': 'Enfermedad',
  'Loss': 'Pérdida',
  'Death of a loved one': 'Muerte de un ser querido',
}

const OVERRIDES = { es: ES }

/** The display name for a Seek group or topic, falling back to English. */
export function seekLabel(name, lang) {
  return OVERRIDES[lang]?.[name] || name
}

export default OVERRIDES
