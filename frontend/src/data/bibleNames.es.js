// Spanish book names, keyed by the SLUG from bible.js.
//
// Keyed on the slug rather than the English name because the slug is the
// identifier: it is what the API returns, what the reader's URL uses, and
// what read-progress and saved verses are stored under. The English names
// are display text and could be reworded; the slugs cannot.
//
// The slugs follow the Douay-Rheims source, so several look nothing like
// either name: 1-kings is 1 Samuel, 3-kings is 1 Kings, 1-paralipomenon
// is 1 Chronicles, ecclesiasticus is Sirach, apocalypse is Revelation.
//
// Written as "slug=Nombre" pairs rather than an object literal purely so
// the whole table is a few lines instead of seventy-three.
const ES = `
genesis=Génesis|exodus=Éxodo|leviticus=Levítico|numbers=Números
deuteronomy=Deuteronomio|josue=Josué|judges=Jueces|ruth=Rut
1-kings=1 Samuel|2-kings=2 Samuel|3-kings=1 Reyes|4-kings=2 Reyes
1-paralipomenon=1 Crónicas|2-paralipomenon=2 Crónicas|1-esdras=Esdras|2-esdras=Nehemías
tobias=Tobías|judith=Judit|esther=Ester|1-machabees=1 Macabeos
2-machabees=2 Macabeos|job=Job|psalms=Salmos|proverbs=Proverbios
ecclesiastes=Eclesiastés|canticle-of-canticles=Cantar de los Cantares|wisdom=Sabiduría|ecclesiasticus=Eclesiástico
isaie=Isaías|jeremie=Jeremías|lamentations=Lamentaciones|baruch=Baruc
ezechiel=Ezequiel|daniel=Daniel|osee=Oseas|joel=Joel
amos=Amós|abdias=Abdías|jonas=Jonás|micheas=Miqueas
nahum=Nahúm|habacuc=Habacuc|sophonias=Sofonías|aggeus=Ageo
zacharias=Zacarías|malachie=Malaquías|matthew=Mateo|mark=Marcos
luke=Lucas|john=Juan|acts=Hechos|romans=Romanos
1-corinthians=1 Corintios|2-corinthians=2 Corintios|galatians=Gálatas|ephesians=Efesios
philippians=Filipenses|colossians=Colosenses|1-thessalonians=1 Tesalonicenses|2-thessalonians=2 Tesalonicenses
1-timothy=1 Timoteo|2-timothy=2 Timoteo|titus=Tito|philemon=Filemón
hebrews=Hebreos|james=Santiago|1-peter=1 Pedro|2-peter=2 Pedro
1-john=1 Juan|2-john=2 Juan|3-john=3 Juan|jude=Judas
apocalypse=Apocalipsis
`

// English names the BACKEND may put at the front of a reference string.
// The lectionary uses modern names ("Galatians 4:22-24"), but the verse
// source is Douay-Rheims, so the older forms can appear too. Both map to
// the same Spanish name, and anything unrecognised is left alone.
const EXTRA = `
Psalm=Salmos|Canticle of Canticles=Cantar de los Cantares|Canticle=Cantar de los Cantares
Sirach=Eclesiástico|Ecclesiasticus=Eclesiástico|Apocalypse=Apocalipsis
Isaias=Isaías|Jeremias=Jeremías|Ezechiel=Ezequiel
Osee=Oseas|Abdias=Abdías|Jonas=Jonás
Micheas=Miqueas|Sophonias=Sofonías|Aggeus=Ageo
Zacharias=Zacarías|Malachias=Malaquías|Tobias=Tobías
Josue=Josué|1 Paralipomenon=1 Crónicas|2 Paralipomenon=2 Crónicas
1 Machabees=1 Macabeos|2 Machabees=2 Macabeos|1 Esdras=Esdras
2 Esdras=Nehemías
`

// "|" and newlines are the ONLY separators. Whitespace is never a
// separator, because both sides can contain spaces: the key "Canticle of
// Canticles" and the value "1 Samuel" would both be cut in half by a
// whitespace split.
function parse(block) {
  const out = {}
  for (const pair of block.split(/[|\n]/)) {
    const at = pair.indexOf('=')
    if (at > 0) out[pair.slice(0, at).trim()] = pair.slice(at + 1).trim()
  }
  return out
}

const ES_BY_SLUG = parse(ES)
const EXTRA_EN = parse(EXTRA)

export default ES_BY_SLUG
export { EXTRA_EN }
