// The liturgical season in the current language.
//
// The season arrives from the backend as an English string, and it is a
// CLOSED set: the upstream calendar API returns one of six values, the
// same six the backend maps to vestment colours in services.py. So the
// translation is a lookup, not a parse.
//
// An unrecognised value falls through unchanged, which is the right
// failure here: if the upstream API ever adds or renames a season, the
// screen shows the English name rather than a blank or a key.

const KEY_BY_SEASON = {
  'Advent': 'season.advent',
  'Christmas': 'season.christmas',
  'Lent': 'season.lent',
  'Holy Week': 'season.holyWeek',
  'Eastertide': 'season.eastertide',
  'Ordinary Time': 'season.ordinary',
}

/** seasonName(readings?.liturgical_season, t) */
export function seasonName(season, t) {
  if (!season) return ''
  const key = KEY_BY_SEASON[season.trim()]
  return key ? t(key) : season
}

export default KEY_BY_SEASON
