"""Build frontend/src/data/daily_verses.es.js from bible_verses_es.

daily_verses.js uses Protestant book names and Hebrew psalm numbers, while
bible_verses uses Douay slugs and Vulgate numbering. Rather than trust a
mapping, each entry is resolved by matching its own stored English text
against bible_verses at the obvious reference and at one chapter back, and
the chapter that matches is the one used to pull the Spanish. An entry whose
English matches nothing keeps its English text and is reported, so a bad
guess never silently ships as scripture.
"""
import re
import unicodedata
from sqlalchemy import text
from database import engine

SRC = '/Users/dorianzelaya/catholic-companion/frontend/src/data/daily_verses.js'
OUT = '/Users/dorianzelaya/catholic-companion/frontend/src/data/daily_verses.es.js'

SLUG = {
    '1 Chronicles': '1-paralipomenon', '2 Chronicles': '2-paralipomenon',
    '1 Kings': '3-kings', '2 Kings': '4-kings', '1 Samuel': '1-kings',
    '2 Samuel': '2-kings', 'Nehemiah': '2-esdras', 'Ezra': '1-esdras',
    '1 Maccabees': '1-machabees', '2 Maccabees': '2-machabees',
    'Sirach': 'ecclesiasticus', 'Ecclesiasticus': 'ecclesiasticus',
    'Revelation': 'apocalypse', 'Isaiah': 'isaie', 'Jeremiah': 'jeremie',
    'Ezekiel': 'ezechiel', 'Hosea': 'osee', 'Obadiah': 'abdias',
    'Micah': 'micheas', 'Habakkuk': 'habacuc', 'Zephaniah': 'sophonias',
    'Zechariah': 'zacharias', 'Malachi': 'malachie', 'Joshua': 'josue',
    'Tobit': 'tobias', 'Psalm': 'psalms', 'Psalms': 'psalms',
    'Song of Songs': 'canticle-of-canticles', 'Canticles': 'canticle-of-canticles',
    'Haggai': 'aggeus', 'Judges': 'judges', 'Lamentations': 'lamentations',
}
ES = {
    'Genesis': 'Génesis', 'Exodus': 'Éxodo', 'Leviticus': 'Levítico',
    'Numbers': 'Números', 'Deuteronomy': 'Deuteronomio', 'Joshua': 'Josué',
    'Judges': 'Jueces', 'Ruth': 'Rut', '1 Samuel': '1 Samuel',
    '2 Samuel': '2 Samuel', '1 Kings': '1 Reyes', '2 Kings': '2 Reyes',
    '1 Chronicles': '1 Crónicas', '2 Chronicles': '2 Crónicas',
    'Ezra': 'Esdras', 'Nehemiah': 'Nehemías', 'Tobit': 'Tobías',
    'Judith': 'Judit', 'Esther': 'Ester', 'Job': 'Job',
    'Psalm': 'Salmos', 'Psalms': 'Salmos', 'Proverbs': 'Proverbios',
    'Ecclesiastes': 'Eclesiastés', 'Song of Songs': 'Cantar de los Cantares',
    'Canticles': 'Cantar de los Cantares', 'Wisdom': 'Sabiduría',
    'Sirach': 'Eclesiástico', 'Ecclesiasticus': 'Eclesiástico',
    'Isaiah': 'Isaías', 'Jeremiah': 'Jeremías', 'Lamentations': 'Lamentaciones',
    'Baruch': 'Baruc', 'Ezekiel': 'Ezequiel', 'Daniel': 'Daniel',
    'Hosea': 'Oseas', 'Joel': 'Joel', 'Amos': 'Amós', 'Obadiah': 'Abdías',
    'Jonah': 'Jonás', 'Micah': 'Miqueas', 'Nahum': 'Nahúm',
    'Habakkuk': 'Habacuc', 'Zephaniah': 'Sofonías', 'Haggai': 'Ageo',
    'Zechariah': 'Zacarías', 'Malachi': 'Malaquías',
    '1 Maccabees': '1 Macabeos', '2 Maccabees': '2 Macabeos',
    'Matthew': 'Mateo', 'Mark': 'Marcos', 'Luke': 'Lucas', 'John': 'Juan',
    'Acts': 'Hechos', 'Romans': 'Romanos', '1 Corinthians': '1 Corintios',
    '2 Corinthians': '2 Corintios', 'Galatians': 'Gálatas',
    'Ephesians': 'Efesios', 'Philippians': 'Filipenses',
    'Colossians': 'Colosenses', '1 Thessalonians': '1 Tesalonicenses',
    '2 Thessalonians': '2 Tesalonicenses', '1 Timothy': '1 Timoteo',
    '2 Timothy': '2 Timoteo', 'Titus': 'Tito', 'Philemon': 'Filemón',
    'Hebrews': 'Hebreos', 'James': 'Santiago', '1 Peter': '1 Pedro',
    '2 Peter': '2 Pedro', '1 John': '1 Juan', '2 John': '2 Juan',
    '3 John': '3 Juan', 'Jude': 'Judas', 'Revelation': 'Apocalipsis',
}

# Nine entries the matcher could not place, each checked by reading both
# texts. Two needed real correction: Oseas 14:5 in the Douay is the module's
# 14:4, and Hebrew 116 splits into Vulgate 114 and 115 so 116:15 is 115:6.
# The rest sit at the same number but fell foul of a merge point elsewhere
# in the chapter, which made the flat-offset check refuse them.
OVERRIDE = {
    'Hosea 14:5':      ('osee', 14, 4),
    'Psalm 126:3':     ('psalms', 125, 3),
    'Psalm 116:15':    ('psalms', 115, 6),
    'John 11:25':      ('john', 11, 25),
    'Revelation 12:1': ('apocalypse', 12, 1),
    'Ecclesiastes 4:9': ('ecclesiastes', 4, 9),
    'Matthew 5:16':    ('matthew', 5, 16),
    'Mark 9:23':       ('mark', 9, 23),
    'Isaiah 45:8':     ('isaie', 45, 8),
}

ENTRY = re.compile(r'\{\s*text:\s*"((?:[^"\\]|\\.)*)"\s*,\s*ref:\s*"([^"]+)"\s*\}')
MONTH = re.compile(r'^\s{2}(\d{1,2}):\s*\[(.*)$')
REF = re.compile(r'^(.+?)\s+(\d+):(\d+)(?:\s*-\s*(\d+))?$')


def words(s):
    s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z ]', ' ', s.lower()).split()


def keys(s):
    """Tokens cut to four characters, which absorbs the modernization.

    daily_verses.js says so in its own header: archaic verb forms were
    updated. So "says" has to match "saith" and "strengthens" has to match
    "strengtheneth", which exact comparison will never do.
    """
    return set(w[:4] for w in words(s) if len(w) > 2)


def contained(entry, candidate):
    """How much of the daily verse appears in the candidate verse.

    Containment rather than similarity because many entries are fragments:
    "With God all things are possible" is the tail of Matthew 19:26. A
    fragment is fully contained in its verse while scoring poorly on any
    symmetric measure.
    """
    a, b = keys(entry), keys(candidate)
    if not a or not b:
        return 0.0
    return len(a & b) / len(a)


def main():
    src = open(SRC).read()
    months, order = {}, []
    cur = None
    for line in src.splitlines():
        m = MONTH.match(line)
        if m:
            cur = int(m.group(1))
            months[cur] = []
            order.append((cur, line.split('[', 1)[1].strip()))
        if cur is not None:
            for t, r in ENTRY.findall(line):
                months[cur].append((t, r))
    total = sum(len(v) for v in months.values())
    print('parsed %d months, %d verses' % (len(months), total))
    if not total:
        print('REFUSE: parsed nothing, the file shape must have changed')
        return

    out, unresolved, shifted = {}, [], 0
    weak, extended, offs = [], [], []

    # The Vulgate counts a psalm's superscription as verse 1 and the module
    # does not, so a Spanish psalm body sits one number lower all the way
    # down: Vulgate 91:2 "Bonum est confiteri" is the module's 91:1. Pulling
    # the Spanish at the Douay's number lands a verse late. The offset is
    # the difference in verse counts for that chapter.
    #
    # Four non-psalm chapters are one low from verse 1 for a similar reason.
    # Any OTHER chapter whose counts differ does so at a merge point partway
    # down, where a flat offset would be wrong, so those are reported.
    WHOLE_LOW = {('aggeus', 2), ('ecclesiastes', 7), ('jonas', 2), ('numbers', 13)}
    with engine.connect() as cc:
        en_max = {(b, c2): m for b, c2, m in cc.execute(text(
            'select book_slug, chapter_num, max(verse_num) from bible_verses group by 1,2'))}
        es_max = {(b, c2): m for b, c2, m in cc.execute(text(
            'select book_slug, chapter_num, max(verse_num) from bible_verses_es group by 1,2'))}
    with engine.connect() as c:
        def grab(table, slug, ch, a, b):
            rows = c.execute(text('select text from %s where book_slug=:s and chapter_num=:c '
                                  'and verse_num between :a and :b order by verse_num' % table),
                             {'s': slug, 'c': ch, 'a': a, 'b': b}).all()
            return ' '.join(r[0].strip() for r in rows) if rows else ''

        for mo in sorted(months):
            out[mo] = []
            for en_text, ref in months[mo]:
                ov = OVERRIDE.get(ref.strip())
                if ov:
                    oslug, och, ov1 = ov
                    obook = re.match(r'^(.+?)\s+\d+:\d+', ref.strip()).group(1).strip()
                    oes = ' '.join(r[0].strip() for r in __import__('sqlalchemy').text and [])
                    with engine.connect() as oc:
                        rows = oc.execute(text('select text from bible_verses_es where book_slug=:s '
                                               'and chapter_num=:c and verse_num=:v'),
                                          {'s': oslug, 'c': och, 'v': ov1}).all()
                    if rows:
                        out[mo].append((rows[0][0].strip(),
                                        '%s %d:%d' % (ES.get(obook, obook), och, ov1), True))
                        continue
                    unresolved.append((ref, 'override %s %d:%d has no spanish text'
                                       % (oslug, och, ov1)))
                    out[mo].append((en_text, ref, None))
                    continue
                m = REF.match(ref.strip())
                if not m:
                    unresolved.append((ref, 'unparseable'))
                    out[mo].append((en_text, ref, None))
                    continue
                book, ch, v1 = m.group(1).strip(), int(m.group(2)), int(m.group(3))
                v2 = int(m.group(4)) if m.group(4) else v1
                slug = SLUG.get(book, book.lower().replace(' ', '-'))
                if book not in ES:
                    unresolved.append((ref, 'no spanish book name'))
                    out[mo].append((en_text, ref, None))
                    continue
                scored = []
                for cand in (ch, ch - 1, ch + 1):
                    if cand < 1:
                        continue
                    scored.append((contained(en_text, grab('bible_verses', slug, cand, v1, v2)), cand))
                scored.sort(reverse=True)
                best = scored[0][0] if scored else 0.0
                runner = scored[1][0] if len(scored) > 1 else 0.0
                pick = None
                if best >= 0.7:
                    pick = scored[0][1]
                elif best >= 0.35 and best - runner >= 0.15:
                    pick = scored[0][1]
                    weak.append((ref, best))
                if pick is None:
                    unresolved.append((ref, 'best english match only %.2f' % best))
                    out[mo].append((en_text, ref, None))
                    continue
                if pick != ch:
                    shifted += 1
                off = en_max.get((slug, pick), 0) - es_max.get((slug, pick), 0)
                if off == 0:
                    sv1, sv2 = v1, v2
                elif slug == 'psalms' or (slug, pick) in WHOLE_LOW:
                    sv1, sv2 = max(1, v1 - off), max(1, v2 - off)
                    offs.append((ref, pick, off, sv1))
                else:
                    unresolved.append((ref, 'counts differ by %d at a merge point in %s %d'
                                       % (off, slug, pick)))
                    out[mo].append((en_text, ref, None))
                    continue
                es = grab('bible_verses_es', slug, pick, sv1, sv2)
                # Torres Amat sometimes breaks a verse where the Douay does
                # not, so the Spanish at the same number can be a clause
                # rather than the thought: Josue 1:9 is "Mira que yo soy el
                # que te lo mando" with the "no temas" in the next verse.
                # When the Spanish comes back far shorter than the English,
                # try taking one more verse and keep it only if that brings
                # the two to a comparable length.
                if es and en_text:
                    want_n = len(en_text.split())
                    if len(es.split()) < 0.55 * want_n:
                        wider = grab('bible_verses_es', slug, pick, sv1, sv2 + 1)
                        if wider and 0.7 <= len(wider.split()) / max(1, want_n) <= 1.6:
                            es = wider
                            sv2 = sv2 + 1
                            extended.append(ref)
                if not es:
                    unresolved.append((ref, 'no spanish text at %s %d:%d' % (slug, pick, v1)))
                    out[mo].append((en_text, ref, None))
                    continue
                rng = str(sv1) if sv1 == sv2 else '%d-%d' % (sv1, sv2)
                out[mo].append((es, '%s %d:%s' % (ES[book], pick, rng), True))

    ok = sum(1 for mo in out for e in out[mo] if e[2])
    print('resolved to spanish : %d of %d' % (ok, total))
    print('psalms taken a chapter back (hebrew -> vulgate): %d' % shifted)
    print('weak matches accepted: %d' % len(weak))
    for r, sc in weak:
        print('   %-26s %.2f' % (r, sc))
    print('ranges widened by one verse: %d' % len(extended))
    for r in extended:
        print('   %s' % r)
    print('verse numbers adjusted for the missing superscription: %d' % len(offs))
    print('unresolved          : %d' % len(unresolved))
    for r, why in unresolved[:25]:
        print('   %-26s %s' % (r, why))

    head = (
        '// Spanish daily verses, generated by tools/gen_daily_verses_es.py\n'
        '// Text is Torres Amat, pulled from bible_verses_es. Do not hand-edit:\n'
        '// rerun the generator so the text keeps matching the Spanish Bible.\n'
        '//\n'
        '// Each entry was resolved by matching the English verse text in\n'
        '// daily_verses.js against bible_verses, so psalm references land on the\n'
        '// right Vulgate chapter rather than on the Hebrew number.\n\n'
        'const DAILY_VERSES_ES = {\n'
    )
    body = []
    for mo in sorted(out):
        body.append('  %d: [\n' % mo)
        for t, r, good in out[mo]:
            esc = t.replace('\\', '\\\\').replace('"', '\\"')
            note = '' if good else '  // NOT TRANSLATED'
            body.append('    { text: "%s", ref: "%s" },%s\n' % (esc, r, note))
        body.append('  ],\n')
    tail = (
        '}\n\n'
        'export function getDailyVerseEs() {\n'
        '  const today = new Date()\n'
        '  const verses = DAILY_VERSES_ES[today.getMonth() + 1]\n'
        '  if (!verses) return null\n'
        '  return verses[today.getDate() - 1] || null\n'
        '}\n\n'
        'export default DAILY_VERSES_ES\n'
    )
    open(OUT, 'w').write(head + ''.join(body) + tail)
    print()
    print('wrote', OUT)
    print()
    print('=== first 5 of January ===')
    for t, r, good in out[min(out)][:5]:
        print('  %-22s %s' % (r, t[:86]))


main()
