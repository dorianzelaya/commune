// Liturgical day names the calendar generates rather than names.
//
// A feria or a Sunday arrives as "Monday of the 30th week of Ordinary
// Time" or "30th Sunday of Ordinary Time": built from a weekday, a
// number and a season rather than being a proper name. Those are
// formulaic enough to render in Spanish exactly.
//
// A saint's own name is NOT formulaic and is left alone: anything this
// does not recognise comes back unchanged, so a day is never shown
// under a wrong name.

const WEEKDAY = {
  Sunday: 'Domingo', Monday: 'Lunes', Tuesday: 'Martes',
  Wednesday: 'Miércoles', Thursday: 'Jueves', Friday: 'Viernes',
  Saturday: 'Sábado',
}

const SEASON = {
  'Ordinary Time': 'del Tiempo Ordinario',
  Advent: 'de Adviento',
  Lent: 'de Cuaresma',
  Easter: 'de Pascua',
  Christmas: 'de Navidad',
  'Holy Week': 'de Semana Santa',
}

const NAMED = {
  'Ash Wednesday': 'Miércoles de Ceniza',
  'Palm Sunday': 'Domingo de Ramos',
  'Holy Thursday': 'Jueves Santo',
  'Good Friday': 'Viernes Santo',
  'Holy Saturday': 'Sábado Santo',
  'Easter Sunday': 'Domingo de Pascua',
  'Pentecost Sunday': 'Domingo de Pentecostés',
  Pentecost: 'Pentecostés',
  Christmas: 'Navidad',
  Epiphany: 'Epifanía',
  Ascension: 'Ascensión',
  'Trinity Sunday': 'Santísima Trinidad',
  'Corpus Christi': 'Corpus Christi',
  'Christ the King': 'Jesucristo, Rey del Universo',
}

/** "Monday of the 30th week of Ordinary Time" -> Spanish, or unchanged. */
export function dayName(name, lang) {
  if (!name || lang !== 'es') return name
  if (NAMED[name]) return NAMED[name]

  let m = name.match(/^(\w+) of the (\d+)(?:st|nd|rd|th) week of (.+)$/)
  if (m && WEEKDAY[m[1]] && SEASON[m[3]]) {
    return `${WEEKDAY[m[1]]} de la ${m[2]}.ª semana ${SEASON[m[3]]}`
  }

  m = name.match(/^(\d+)(?:st|nd|rd|th) Sunday of (.+)$/)
  if (m && SEASON[m[2]]) {
    return `${m[1]}.º Domingo ${SEASON[m[2]]}`
  }

  m = name.match(/^(\w+) of (.+)$/)
  if (m && WEEKDAY[m[1]] && SEASON[m[2]]) {
    return `${WEEKDAY[m[1]]} ${SEASON[m[2]]}`
  }

  return name
}

export default dayName
