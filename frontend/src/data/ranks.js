// The liturgical rank of the day, in the current language.
//
// saint_type is an ENUM from the calendar API: SOLEMNITY, FEAST,
// MEMORIAL, OPT_MEMORIAL, FERIA, SUNDAY, HOLY_WEEK, TRIDUUM. The page
// used to prettify it by replacing underscores and title-casing, which
// gave "Opt Memorial" in every language.
//
// An unrecognised value keeps that old prettifying, so a rank the API
// adds later still reads as words rather than SCREAMING_CASE.

const KEY_BY_RANK = {
  SOLEMNITY: 'rank.solemnity',
  FEAST: 'rank.feast',
  MEMORIAL: 'rank.memorial',
  OPT_MEMORIAL: 'rank.optMemorial',
  OPTIONAL_MEMORIAL: 'rank.optMemorial',
  FERIA: 'rank.feria',
  SUNDAY: 'rank.sunday',
  HOLY_WEEK: 'rank.holyWeek',
  TRIDUUM: 'rank.triduum',
}

function prettify(type) {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

/** rankName(data.saint_type, t) */
export function rankName(type, t) {
  if (!type) return ''
  const key = KEY_BY_RANK[type.trim().toUpperCase()]
  return key ? t(key) : prettify(type)
}

export default KEY_BY_RANK
