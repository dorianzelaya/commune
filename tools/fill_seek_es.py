"""Two gaps in the Seek passages.

text_es was null on 7 rows, all of them verses that only existed inside
another verse until the Torres Amat blocks were split: Eclesiastico 37:16,
27:30, 37:29-31, 18:30-31 and 2 Macabeos 12:46 twice. They now resolve and
each one's Spanish matches its English, so they are filled from the Bible.

Psalms are deliberately NOT regenerated. Seek's psalm references use Hebrew
numbering while bible_verses uses the Vulgate, so 195 of 214 psalm rows sit
one chapter off from the Bible table. Their existing Spanish is correct
against their own reference and pulling from the Bible would break it.

reference_es was null on every row, so Spanish mode showed English book
names. Those are formatted here from the book name and verse range.
"""
import sys
from sqlalchemy import text
from database import engine

APPLY = '--apply' in sys.argv

SLUG = {
    '1 Chronicles': '1-paralipomenon', '2 Chronicles': '2-paralipomenon',
    '1 Kings': '3-kings', '1 Samuel': '1-kings', 'Nehemiah': '2-esdras',
    '2 Maccabees': '2-machabees', 'Sirach': 'ecclesiasticus',
    'Revelation': 'apocalypse', 'Isaiah': 'isaie', 'Jeremiah': 'jeremie',
    'Ezekiel': 'ezechiel', 'Hosea': 'osee', 'Obadiah': 'abdias',
    'Micah': 'micheas', 'Habakkuk': 'habacuc', 'Zephaniah': 'sophonias',
    'Zechariah': 'zacharias', 'Malachi': 'malachie', 'Joshua': 'josue',
    'Tobit': 'tobias', 'Psalm': 'psalms', 'Psalms': 'psalms',
}

ES = {
    'Genesis': 'Génesis', 'Exodus': 'Éxodo', 'Leviticus': 'Levítico',
    'Numbers': 'Números', 'Deuteronomy': 'Deuteronomio', 'Joshua': 'Josué',
    'Judges': 'Jueces', '1 Samuel': '1 Samuel', '1 Kings': '1 Reyes',
    '1 Chronicles': '1 Crónicas', '2 Chronicles': '2 Crónicas',
    'Nehemiah': 'Nehemías', 'Tobit': 'Tobías', 'Judith': 'Judit',
    'Esther': 'Ester', 'Job': 'Job', 'Psalm': 'Salmos', 'Psalms': 'Salmos',
    'Proverbs': 'Proverbios', 'Ecclesiastes': 'Eclesiastés',
    'Wisdom': 'Sabiduría', 'Sirach': 'Eclesiástico', 'Isaiah': 'Isaías',
    'Jeremiah': 'Jeremías', 'Lamentations': 'Lamentaciones',
    'Ezekiel': 'Ezequiel', 'Daniel': 'Daniel', 'Hosea': 'Oseas',
    'Joel': 'Joel', 'Amos': 'Amós', 'Obadiah': 'Abdías', 'Micah': 'Miqueas',
    'Nahum': 'Nahúm', 'Habakkuk': 'Habacuc', 'Zephaniah': 'Sofonías',
    'Zechariah': 'Zacarías', 'Malachi': 'Malaquías',
    '1 Maccabees': '1 Macabeos', '2 Maccabees': '2 Macabeos',
    'Matthew': 'Mateo', 'Mark': 'Marcos', 'Luke': 'Lucas', 'John': 'Juan',
    'Acts': 'Hechos', 'Romans': 'Romanos', '1 Corinthians': '1 Corintios',
    '2 Corinthians': '2 Corintios', 'Galatians': 'Gálatas',
    'Ephesians': 'Efesios', 'Philippians': 'Filipenses',
    'Colossians': 'Colosenses', '1 Thessalonians': '1 Tesalonicenses',
    '2 Thessalonians': '2 Tesalonicenses', '1 Timothy': '1 Timoteo',
    '2 Timothy': '2 Timoteo', 'Titus': 'Tito', 'Hebrews': 'Hebreos',
    'James': 'Santiago', '1 Peter': '1 Pedro', '2 Peter': '2 Pedro',
    '1 John': '1 Juan', '2 John': '2 Juan', '3 John': '3 Juan',
    'Jude': 'Judas', 'Revelation': 'Apocalipsis',
}


def main():
    with engine.connect() as c:
        books = [r[0] for r in c.execute(text('select distinct book from scripture_passages'))]
        missing = [b for b in books if b not in ES]
        if missing:
            print('REFUSE: no spanish name for', missing)
            return

        fills = []
        for r in c.execute(text('select id, book, chapter, verse_start, verse_end, reference '
                                'from scripture_passages where text_es is null order by id')):
            slug = SLUG.get(r[1], r[1].lower().replace(' ', '-'))
            vs = c.execute(text('select text from bible_verses_es where book_slug=:b and chapter_num=:c '
                                'and verse_num between :a and :z order by verse_num'),
                           {'b': slug, 'c': r[2], 'a': r[3], 'z': r[4] or r[3]}).all()
            want = (r[4] or r[3]) - r[3] + 1
            if len(vs) != want:
                print('  id %-5d %-24s SKIP, got %d verses, wanted %d' % (r[0], r[5], len(vs), want))
                continue
            fills.append((r[0], r[5], ' '.join(v[0].strip() for v in vs)))

        refs = []
        for r in c.execute(text('select id, book, chapter, verse_start, verse_end '
                                'from scripture_passages order by id')):
            name = ES[r[1]]
            rng = str(r[3]) if not r[4] or r[4] == r[3] else '%d-%d' % (r[3], r[4])
            refs.append((r[0], '%s %d:%s' % (name, r[2], rng)))

    print('=== text_es to fill ===')
    for i, ref, t in fills:
        print('  id %-5d %-24s %s' % (i, ref, t[:110]))
    print('  total:', len(fills))
    print()
    print('=== reference_es, first 10 of %d ===' % len(refs))
    for i, s in refs[:10]:
        print('  id %-5d %s' % (i, s))

    if not APPLY:
        print()
        print('DRY RUN. nothing written. re-run with --apply to write.')
        return

    with engine.begin() as c:
        for i, ref, t in fills:
            c.execute(text('update scripture_passages set text_es=:t where id=:i'), {'t': t, 'i': i})
        for i, s in refs:
            c.execute(text('update scripture_passages set reference_es=:s where id=:i'), {'s': s, 'i': i})
    print()
    print('written.')
    with engine.connect() as c:
        print('rows still without text_es     :', c.execute(text(
            'select count(*) from scripture_passages where text_es is null')).scalar())
        print('rows still without reference_es:', c.execute(text(
            'select count(*) from scripture_passages where reference_es is null')).scalar())


main()
