// Translation health check. Run from the repo root:
//   node scripts/check-i18n.mjs
//
// Reads the files as text rather than importing them, so it needs no
// build step and no dependencies, and it still catches the mistakes that
// have actually happened in this project: duplicate keys from a patch
// applied twice, override ids that match nothing, and {placeholder}
// mismatches between languages.

import { readFileSync } from 'node:fs'

const read = p => readFileSync(p, 'utf8')
let problems = 0
const fail = m => { console.log(`  FAIL  ${m}`); problems++ }
const ok = m => console.log(`  ok    ${m}`)

const strings = read('frontend/src/i18n/strings.js')
const esAt = strings.indexOf('\n  es: {\n')
if (esAt < 0) fail('strings.js: cannot find the es block')

const keysIn = block => [...block.matchAll(/^ {4}'([A-Za-z0-9_.]+)':/gm)].map(m => m[1])
const enKeys = keysIn(strings.slice(0, esAt))
const esKeys = keysIn(strings.slice(esAt))

for (const [label, keys] of [['en', enKeys], ['es', esKeys]]) {
  const dupes = keys.filter((k, i) => keys.indexOf(k) !== i)
  if (dupes.length) fail(`strings.js ${label}: duplicate keys: ${[...new Set(dupes)].join(', ')}`)
  else ok(`strings.js ${label}: ${keys.length} keys, no duplicates`)
}

const missingEs = enKeys.filter(k => !esKeys.includes(k))
const missingEn = esKeys.filter(k => !enKeys.includes(k))
if (missingEs.length) fail(`missing from es: ${missingEs.join(', ')}`)
if (missingEn.length) fail(`missing from en: ${missingEn.join(', ')}`)
if (!missingEs.length && !missingEn.length) ok('strings.js: en and es cover the same keys')

const valueOf = (block, key) => {
  const m = block.match(new RegExp(`^ {4}'${key.replace(/\./g, '\\.')}':\\s*(.+?),?$`, 'm'))
  return m ? m[1] : ''
}
const slots = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',')
let slotMismatch = 0
for (const k of enKeys) {
  const a = slots(valueOf(strings.slice(0, esAt), k))
  const b = slots(valueOf(strings.slice(esAt), k))
  if (a !== b) { fail(`placeholders differ for ${k}: en[${a}] es[${b}]`); slotMismatch++ }
}
if (!slotMismatch) ok('strings.js: placeholders match across languages')

const { readdirSync } = await import('node:fs')
const used = new Set()
for (const dir of ['frontend/src/pages', 'frontend/src/components']) {
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.jsx')) continue
    for (const m of read(`${dir}/${name}`).matchAll(/\bt\(\s*'([A-Za-z0-9_.]+)'/g)) used.add(m[1])
  }
}
const unknown = [...used].filter(k => !enKeys.includes(k))
if (unknown.length) fail(`t() called with keys not in strings.js: ${unknown.join(', ')}`)
else ok(`code calls ${used.size} keys, all present`)

const idsFrom = (text, re) => [...text.matchAll(re)].map(m => m[1])
const pairs = [
  ['prayers', 'frontend/src/data/prayers.js', /\bid: "([a-z0-9-]+)"/g,
   'frontend/src/data/prayers.es.js', /^  '([a-z0-9-]+)':/gm],
  ['rosary mysteries', 'frontend/src/data/rosary.js', /\bid: "([a-z0-9-]+)"/g,
   'frontend/src/data/rosary.es.js', /^  '([a-z0-9-]+)':/gm],
  ['examination', 'frontend/src/data/examination.js', /\bid: "([a-z]+)"/g,
   'frontend/src/data/examination.es.js', /^  ([a-z]+): \{/gm],
  ['glossary', 'frontend/src/data/glossary.js', /\bid: '([a-z0-9-]+)'/g,
   'frontend/src/data/glossary.es.js', /^  '([a-z0-9-]+)':/gm],
]
for (const [label, enPath, enRe, esPath, esRe] of pairs) {
  const enIds = idsFrom(read(enPath), enRe)
  const esIds = idsFrom(read(esPath), esRe)
  const dupeEn = enIds.filter((k, i) => enIds.indexOf(k) !== i)
  if (dupeEn.length) fail(`${label}: duplicate ids in source: ${[...new Set(dupeEn)].join(', ')}`)
  const dupeEs = esIds.filter((k, i) => esIds.indexOf(k) !== i)
  if (dupeEs.length) fail(`${label}: duplicate ids in es: ${[...new Set(dupeEs)].join(', ')}`)
  const orphans = esIds.filter(k => !enIds.includes(k))
  if (orphans.length) fail(`${label}: es ids matching nothing in source: ${orphans.join(', ')}`)
  if (!dupeEn.length && !dupeEs.length && !orphans.length) {
    const pct = enIds.length ? Math.round((esIds.length / enIds.length) * 100) : 0
    ok(`${label}: ${esIds.length}/${enIds.length} translated (${pct}%), ids all valid`)
  }
}

const rosaryEn = read('frontend/src/data/rosary.js')
const prayersBlock = rosaryEn.slice(rosaryEn.indexOf('export const PRAYERS'))
const enPrayerKeys = [...prayersBlock.matchAll(/^  (\w+): \{/gm)].map(m => m[1])
const esPrayerKeys = [...read('frontend/src/data/rosaryPrayers.es.js').matchAll(/^  (\w+): \{/gm)].map(m => m[1])
const badPrayerKeys = esPrayerKeys.filter(k => !enPrayerKeys.includes(k))
if (badPrayerKeys.length) fail(`rosary prayers: es keys matching nothing: ${badPrayerKeys.join(', ')}`)
else ok(`rosary prayers: ${esPrayerKeys.length}/${enPrayerKeys.length} keyed correctly`)

// Seek topics are posted to the API as their English names, so a label
// missing here renders in English with no error. Compare the two lists
// rather than trusting the fallback.
const seekSrc = read('frontend/src/pages/Struggle.jsx')
const groupsBlock = seekSrc.slice(seekSrc.indexOf('const GROUPS = ['), seekSrc.indexOf('function GrowthIcon'))
const seekNames = [
  ...[...groupsBlock.matchAll(/name: '([^']+)'/g)].map(m => m[1]),
  ...[...groupsBlock.matchAll(/'([^']+)'/g)].map(m => m[1]),
].filter(n => !n.startsWith('cat-'))
const seekEs = [...read('frontend/src/data/seekLabels.js').matchAll(/^  '([^']+)':/gm)].map(m => m[1])
const seekMissing = [...new Set(seekNames)].filter(n => !seekEs.includes(n))
const seekOrphans = seekEs.filter(n => !seekNames.includes(n))
if (seekMissing.length) fail(`seek labels: no es label for: ${seekMissing.join(', ')}`)
if (seekOrphans.length) fail(`seek labels: es labels matching no group or topic: ${seekOrphans.join(', ')}`)
if (!seekMissing.length && !seekOrphans.length) {
  ok(`seek labels: ${seekEs.length}/${new Set(seekNames).size} groups and topics translated`)
}

console.log()
if (problems) {
  console.log(`${problems} problem(s) found`)
  process.exit(1)
}
console.log('all translation checks passed')
