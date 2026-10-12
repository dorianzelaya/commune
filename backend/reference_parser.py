import re


def _parse_verse_list(verses_str: str) -> list:
    """
    Parses a verse-list portion (no book, no chapter, no semicolons) into
    a list of (start, end) tuples. Handles comma-separated lists, "and" as
    a separator, hyphenated ranges, and letter suffixes like "15a" or
    "10AB" marking partial verses — the letters carry no information the
    Douay-Rheims API understands, so they are dropped once they've done
    their job of telling us this citation is lectionary-formatted.
    """
    verses_str = re.sub(r'\s+and\s+', ', ', verses_str)

    verse_ranges = []
    segments = [s.strip() for s in verses_str.split(',')]
    for segment in segments:
        segment = segment.strip()
        if not segment:
            continue

        # Strip letter suffixes like "15a", "3Ab", "7bc", "10AB" -> the number
        segment = re.sub(r'([0-9]+)[a-zA-Z]+', r'\1', segment)

        # Lectionary citations sometimes carry a stray trailing period on
        # the last verse of a list, e.g. "Psalm 98:1, 2-3, 3-4, 5-6." —
        # which used to reach int() as '6.' and raise. Only punctuation at
        # the edges is dropped; anything unexpected INSIDE the segment is
        # still allowed to raise rather than be silently reinterpreted.
        segment = segment.strip('. ')
        if not segment:
            continue

        if '-' in segment:
            parts = segment.split('-')
            start = int(parts[0].strip())
            end = int(parts[1].strip())
            verse_ranges.append((start, end))
        else:
            v = int(segment.strip())
            verse_ranges.append((v, v))

    return verse_ranges


def parse_reference(reference: str) -> dict:
    """
    Parses a USCCB reading reference string into structured data.

    Examples:
        "Matthew 6:24-34"                       -> single range
        "Psalm 89:4-5, 29-30"                   -> multiple ranges
        "2 Kings 17:5-8, 13-15a"                -> range with letter suffix
        "2 Chronicles 24:17-25"                 -> book with number prefix
        "Psalm 85:9 and 10, 11-12"              -> "and" as verse separator
        "Matthew 10:34-11:1"                    -> cross-chapter range (hyphen)
        "Habakkuk 1:12—2:4"                     -> cross-chapter range (em dash)
        "Revelation 11:19a; 12:1-6a, 10ab"      -> semicolon jump to a new
                                                    chapter within the same
                                                    reading, common in
                                                    lectionary citations for
                                                    major feasts

    The USCCB source is inconsistent about which dash character marks a
    cross-chapter range — hyphen (-), en dash (–), and em dash (—) have
    all been observed. All three are treated as equivalent throughout.

    A semicolon is a DIFFERENT thing from a cross-chapter dash. A dash
    means "read continuously through the chapter break." A semicolon means
    "jump to this other chapter, possibly with a gap, possibly with its
    own letter suffixes and comma list." "11:19a; 12:1-6a, 10ab" is one
    reading built from chapter 11 verse 19, then separately chapter 12
    verses 1-6 and 10.

    Returns:
        {
            "book": "Matthew",
            "chapter": 6,
            "verse_ranges": [(24, 34)],
            "cross_chapter_end": None,  # or (chapter, verse) if range crosses chapters
            "additional_segments": [
                # one entry per semicolon-separated chapter jump after the first
                {"chapter": 12, "verse_ranges": [(1, 6), (10, 10)]},
            ],
        }

    Raises ValueError if the reference cannot be parsed.
    """
    reference = reference.strip()

    # Normalize every dash variant to a plain hyphen up front, so nothing
    # downstream needs to know these characters exist.
    reference = reference.replace('—', '-').replace('–', '-')

    # Semicolons separate independent chapter:verse groups within one
    # reading. Split on them first so nothing downstream has to worry
    # about a stray chapter number showing up mid verse-list.
    parts = [p.strip() for p in reference.split(';') if p.strip()]

    if not parts:
        raise ValueError(f"Could not parse reference: '{reference}'")

    first = parts[0]

    # Split book name from chapter:verse portion, on the first part only —
    # the book is stated once, everything after a semicolon reuses it.
    match = re.match(r'^(.+?)\s+(\d+):(.+)$', first)
    if not match:
        raise ValueError(f"Could not parse reference: '{reference}'")

    book = match.group(1).strip()
    chapter = int(match.group(2))
    verses_str = match.group(3).strip()

    # Detect cross-chapter range like "34-11:1" or "12-2:4", hyphen-joined
    # within the FIRST part only. A hyphen cross-chapter range and a
    # semicolon chapter jump don't combine in practice, and treating them
    # as separate cases keeps each one simple.
    # The cross-chapter span is the LAST thing in the verse list, but it is
    # not necessarily the only thing. "4:22-24, 26-27, 31-5:1" is a comma
    # list followed by a run from 4:31 through 5:1. Match at the end rather
    # than against the whole string, then rewrite the tail as a bare verse
    # number so the comma list ahead of it parses normally.
    cross_chapter_end = None
    cross_chapter_match = re.search(r'(\d+)-(\d+):(\d+)[a-zA-Z]*[.\s]*$', verses_str)
    if cross_chapter_match:
        cross_chapter_end = (
            int(cross_chapter_match.group(2)),
            int(cross_chapter_match.group(3)),
        )
        verses_str = (
            verses_str[:cross_chapter_match.start()] + cross_chapter_match.group(1)
        )

    # The last range's START is where the continuous run to
    # cross_chapter_end begins; everything before it is a plain list.
    verse_ranges = _parse_verse_list(verses_str)

    # Everything after the first semicolon: each is "chapter:verses",
    # reusing the same book. Letter suffixes and comma lists inside each
    # are handled the same way as the main verse list.
    additional_segments = []
    for part in parts[1:]:
        seg_match = re.match(r'^(\d+):(.+)$', part.strip())
        if not seg_match:
            raise ValueError(f"Could not parse reference segment: '{part}' in '{reference}'")

        seg_chapter = int(seg_match.group(1))
        seg_verses_str = seg_match.group(2).strip()
        seg_verse_ranges = _parse_verse_list(seg_verses_str)

        additional_segments.append({
            "chapter": seg_chapter,
            "verse_ranges": seg_verse_ranges,
        })

    return {
        "book": book,
        "chapter": chapter,
        "verse_ranges": verse_ranges,
        "cross_chapter_end": cross_chapter_end,
        "additional_segments": additional_segments,
    }


def strip_markup(text: str) -> str:
    """
    Removes Douay-Rheims API markup tags from verse text.
    """
    text = re.sub(r'<cr>.*?</cr>', '', text)
    text = re.sub(r'<na>.*?</na>', '', text)
    text = re.sub(r'<sc>(.*?)</sc>', r'\1', text)
    text = re.sub(r'<i>(.*?)</i>', r'\1', text)
    text = re.sub(r'<alt>(.*?)</alt>', r'\1', text)
    text = re.sub(r' +', ' ', text)

    # Replace archaic ligatures
    text = text.replace('Ægypt', 'Egypt')
    text = text.replace('Æ', 'Ae')
    text = text.replace('æ', 'ae')
    text = text.replace('Œ', 'Oe')
    text = text.replace('œ', 'oe')

    return text.strip()