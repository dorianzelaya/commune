"""Serve the Bible reader in Spanish and put its entry points back.

The chapter cache is keyed by language too: it was keyed on slug and
chapter alone, so switching language would redisplay the English
verses already in memory.
"""
import io


def edit(path, pairs):
    s = io.open(path, encoding="utf-8").read()
    for old, new in pairs:
        assert s.count(old) == 1, "%s: anchor matched %d times: %r" % (
            path, s.count(old), old[:52])
        s = s.replace(old, new)
    return path, s


edits = [
    edit("src/pages/Bible.jsx", [
        ("""      const nextKey = `${book.slug}-${chapter + 1}`""",
         """      const nextKey = `${lang}-${book.slug}-${chapter + 1}`"""),
        ("""        authFetch(`/bible/chapter/${book.slug}/${chapter + 1}`)""",
         """        authFetch(`/bible/chapter/${book.slug}/${chapter + 1}?lang=${lang}`)"""),
        ("""      const prevKey = `${book.slug}-${chapter - 1}`""",
         """      const prevKey = `${lang}-${book.slug}-${chapter - 1}`"""),
        ("""        authFetch(`/bible/chapter/${book.slug}/${chapter - 1}`)""",
         """        authFetch(`/bible/chapter/${book.slug}/${chapter - 1}?lang=${lang}`)"""),
        ("""  }, [book, chapter])

  async function loadChapter(bookSlug, chapterNum) {
    const cacheKey = `${bookSlug}-${chapterNum}`""",
         """  }, [book, chapter, lang])

  // Switching language must refetch: the verses on screen are in the
  // other language, and the cache key below no longer matches them.
  useEffect(() => {
    if (book && chapter) loadChapter(book.slug, chapter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  async function loadChapter(bookSlug, chapterNum) {
    const cacheKey = `${lang}-${bookSlug}-${chapterNum}`"""),
        ("""      const response = await authFetch(`/bible/chapter/${bookSlug}/${chapterNum}`)""",
         """      const response = await authFetch(
        `/bible/chapter/${bookSlug}/${chapterNum}?lang=${lang}`)"""),
    ]),
    edit("src/components/NavBar.jsx", [
        ("""  ].filter(tab => lang === 'en' || tab.path !== '/bible')""", """  ]"""),
    ]),
    edit("src/pages/Home.jsx", [
        ("TILES.filter(tile => lang === 'en' || tile.key !== 'bible').map(",
         "TILES.map("),
    ]),
    edit("src/pages/Struggle.jsx", [
        ("""    // The reader has no Spanish text, so this link leads nowhere useful
    // in Spanish. Gated rather than removed.
    if (lang !== 'en') return
""", ""),
        ("""  function openVerse(r) {
    if (lang !== 'en') return
""", """  function openVerse(r) {
"""),
    ]),
]

for path, text in edits:
    io.open(path, "w", encoding="utf-8").write(text)
    print("patched", path)
