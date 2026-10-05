"""
Add the Virtues group to the Seek scripture pool.

Run ONCE from the backend directory:

    source venv/bin/activate
    python3 seed_virtues.py

Same design as seed_struggle_passages.py: only the CITATIONS are authored
by hand. The verse TEXT is fetched from the Douay-Rheims source through
the app's existing fetch_reading_text(), so a bad citation fails loudly
and is skipped rather than shipping scripture that does not exist.

Psalm citations are widened by one verse on purpose. In Douay-Rheims some
psalms carry the superscription as a separate verse and some do not, so
the intended verse can land one position off; widening guarantees it is
included.

Idempotent: skips any (category, reference) pair already in the table.
"""

import asyncio

from database import SessionLocal
from models import ScripturePassage
from services import fetch_reading_text
from reference_parser import parse_reference


CITATIONS = {
    # --- Seven capital virtues, each the remedy for a deadly sin ---
    "Humility": [
        "Philippians 2:3-8", "James 4:10", "Matthew 23:11-12",
        "1 Peter 5:5-7", "Proverbs 11:2-3", "Luke 14:10-11",
        "Micah 6:8-9", "Sirach 3:18-20", "Romans 12:3-4",
        "Proverbs 22:4-5", "Matthew 18:3-4", "Psalm 25:8-10",
        "Isaiah 66:2-3", "Colossians 3:12-13", "John 13:14-16",
        "2 Chronicles 7:14-15", "Proverbs 29:23-24", "Zephaniah 2:3-4",
        "Luke 18:13-14", "Galatians 6:3-4", "Psalm 149:4-5",
        "Ephesians 4:2-3", "Proverbs 15:33", "Mark 10:43-45",
        "1 Corinthians 1:27-29",
    ],
    "Generosity": [
        "Acts 20:35", "2 Corinthians 9:6-8", "Proverbs 11:24-25",
        "Luke 6:38", "1 Timothy 6:17-19", "Proverbs 19:17",
        "Matthew 6:2-4", "Sirach 4:1-5", "Deuteronomy 15:10-11",
        "Proverbs 22:9", "2 Corinthians 8:12-14", "Luke 3:11",
        "Tobit 4:7-9", "Hebrews 13:16", "Proverbs 28:27",
        "Matthew 25:35-40", "1 John 3:17-18", "Psalm 112:5-6",
        "Romans 12:13", "Sirach 29:12-13", "Luke 12:33-34",
        "Proverbs 3:27-28", "James 2:15-16", "Isaiah 58:7-8",
        "2 Corinthians 9:10-11",
    ],
    "Temperance": [
        "Galatians 5:22-24", "1 Corinthians 9:25-27", "Titus 2:11-13",
        "Proverbs 25:27-28", "2 Peter 1:5-7", "1 Timothy 3:2-3",
        "Sirach 31:19-20", "Proverbs 23:20-21", "Romans 13:13-14",
        "1 Peter 4:7-8", "Ecclesiastes 7:16-17", "Philippians 4:5-6",
        "1 Thessalonians 5:6-8", "Proverbs 16:32-33", "Daniel 1:12-16",
        "Luke 21:34-35", "1 Corinthians 6:12-13", "Sirach 37:30-31",
        "Proverbs 21:17", "Romans 14:17-18", "1 Corinthians 10:31",
        "Colossians 3:5-6", "Titus 1:7-8", "Proverbs 30:8-9",
        "2 Timothy 1:7",
    ],
    "Chastity": [
        "1 Thessalonians 4:3-5", "1 Corinthians 6:18-20",
        "Matthew 5:8", "Job 31:1-2", "Psalm 51:10-12",
        "Proverbs 4:23-25", "2 Timothy 2:22-23", "Hebrews 13:4",
        "Galatians 5:16-17", "1 Peter 2:11-12", "Colossians 3:5",
        "Ephesians 5:3-4", "Sirach 23:5-6", "1 John 3:2-3",
        "Psalm 119:9-10", "Romans 12:1-2", "Titus 2:11-12",
        "1 Corinthians 7:34", "Proverbs 6:25-26", "Matthew 5:27-28",
        "2 Corinthians 7:1", "Wisdom 4:1-2", "1 Timothy 4:12",
        "Philippians 4:8-9", "Psalm 24:3-5",
    ],
    "Patience": [
        "James 5:7-8", "Romans 12:12", "Galatians 5:22-23",
        "Colossians 3:12-13", "Proverbs 14:29-30", "Ecclesiastes 7:9-10",
        "Romans 8:25-26", "1 Corinthians 13:4-5", "Hebrews 6:12-13",
        "Psalm 37:7-8", "Proverbs 15:18-19", "2 Peter 3:9-10",
        "James 1:2-4", "Sirach 2:4-5", "Isaiah 40:31-32",
        "Lamentations 3:25-27", "1 Thessalonians 5:14-15",
        "Proverbs 16:32", "Romans 15:4-6", "Psalm 40:1-2",
        "2 Timothy 2:24-25", "Ephesians 4:2", "Habakkuk 2:3-4",
        "Luke 21:19", "Hebrews 10:36-37",
    ],
    "Charity": [
        "1 Corinthians 13:1-8", "1 John 4:7-8", "John 13:34-35",
        "Colossians 3:14-15", "Matthew 22:37-40", "Romans 13:8-10",
        "1 Peter 4:8-9", "1 John 3:16-18", "Galatians 5:13-14",
        "Ephesians 5:1-2", "Luke 6:35-36", "1 John 4:11-12",
        "Proverbs 10:12", "Mark 12:30-31", "Romans 12:9-10",
        "1 Thessalonians 3:12-13", "Sirach 4:8-10", "John 15:12-13",
        "1 Corinthians 16:14", "Hebrews 13:1-2", "Matthew 5:43-45",
        "1 John 4:18-19", "Deuteronomy 6:5-6", "Philippians 2:1-2",
        "Psalm 133:1-2",
    ],
    "Diligence": [
        "Colossians 3:23-24", "Proverbs 12:24", "Ecclesiastes 9:10",
        "Galatians 6:9-10", "Proverbs 13:4-5", "1 Corinthians 15:58",
        "2 Peter 1:10-11", "Proverbs 10:4-5", "Romans 12:11-12",
        "Hebrews 6:11-12", "Proverbs 21:5-6", "2 Thessalonians 3:10-13",
        "Proverbs 6:6-8", "1 Timothy 4:15-16", "Sirach 7:15-16",
        "Proverbs 22:29", "Philippians 3:13-14", "Luke 16:10-11",
        "Proverbs 27:23-24", "1 Peter 5:8-9", "Titus 3:14",
        "Matthew 25:20-21", "Psalm 90:17-18", "Proverbs 14:23",
        "2 Timothy 2:15",
    ],

    # --- Cardinal virtues ---
    "Prudence": [
        "Proverbs 14:15-16", "Matthew 10:16", "Proverbs 22:3-4",
        "James 1:5-6", "Proverbs 13:16", "Ephesians 5:15-17",
        "Proverbs 27:12", "Luke 14:28-30", "Proverbs 15:22",
        "Sirach 32:19-20", "Proverbs 19:2-3", "Colossians 4:5-6",
        "Proverbs 21:5", "Wisdom 8:7-8", "Proverbs 12:15-16",
        "1 Peter 4:7", "Proverbs 18:13", "Romans 12:2-3",
        "Proverbs 11:14", "Matthew 7:24-25", "Sirach 18:19-20",
        "Proverbs 16:9", "Psalm 111:10-11", "Proverbs 24:3-4",
        "Titus 2:6-7",
    ],
    "Justice": [
        "Micah 6:8", "Isaiah 1:17-18", "Proverbs 21:3",
        "Amos 5:24-25", "Deuteronomy 16:19-20", "Psalm 82:3-4",
        "Proverbs 31:8-9", "Zechariah 7:9-10", "Jeremiah 22:3-4",
        "Isaiah 58:6-7", "Proverbs 29:7", "Leviticus 19:15-16",
        "James 2:1-4", "Sirach 4:9-10", "Psalm 106:3-4",
        "Proverbs 11:1-2", "Ezekiel 18:7-9", "Matthew 23:23",
        "Romans 13:7-8", "Proverbs 17:15", "Isaiah 61:8-9",
        "Psalm 37:27-28", "Exodus 23:6-7", "Proverbs 28:5",
        "Hosea 12:6-7",
    ],
    "Fortitude": [
        "Joshua 1:9", "1 Corinthians 16:13-14", "Ephesians 6:10-13",
        "Deuteronomy 31:6-7", "Psalm 27:14-15", "Isaiah 41:10-11",
        "2 Timothy 1:7-8", "Philippians 4:13", "Psalm 31:24-25",
        "1 Chronicles 28:20", "Hebrews 12:1-3", "Sirach 2:2-3",
        "Psalm 138:3-4", "2 Corinthians 12:9-10", "Nehemiah 8:10",
        "Isaiah 40:29-31", "Psalm 18:32-34", "1 Peter 5:10-11",
        "Romans 8:35-37", "Daniel 3:16-18", "Psalm 46:1-2",
        "Micah 3:8", "2 Chronicles 32:7-8", "Acts 4:29-31",
        "Ephesians 3:16-17",
    ],

    # --- Theological ---
    "Faith": [
        "Hebrews 11:1-3", "Mark 11:22-24", "2 Corinthians 5:7-8",
        "Ephesians 2:8-9", "James 2:17-18", "Romans 10:17",
        "Matthew 17:20-21", "Hebrews 11:6-7", "1 Peter 1:6-8",
        "Galatians 2:20-21", "Romans 1:17", "John 20:29",
        "Habakkuk 2:4", "Luke 17:5-6", "1 John 5:4-5",
        "Hebrews 10:22-23", "Romans 4:20-21", "2 Timothy 4:7-8",
        "Psalm 91:1-3", "Matthew 21:21-22", "James 1:6-7",
        "Hebrews 12:2-3", "Romans 5:1-2", "1 Corinthians 2:4-5",
        "Colossians 2:6-7",
    ],

    # --- Requested additions ---
    "Resilience": [
        "2 Corinthians 4:8-10", "Romans 5:3-5", "James 1:2-4",
        "Isaiah 40:30-31", "Proverbs 24:16-17", "Psalm 34:19-20",
        "1 Peter 5:10", "Micah 7:8-9", "Job 5:17-19",
        "2 Corinthians 12:9-10", "Psalm 40:1-3", "Hebrews 12:11-13",
        "Philippians 4:12-13", "Psalm 55:22-23", "Romans 8:37-39",
        "Sirach 2:4-6", "2 Timothy 2:3", "Psalm 73:26-27",
        "Isaiah 43:2-3", "Lamentations 3:22-24", "Galatians 6:9",
        "Psalm 30:5-6", "1 Corinthians 10:13", "Nahum 1:7-8",
        "Psalm 27:13-14",
    ],
    "Discipline": [
        "Hebrews 12:11-12", "1 Corinthians 9:26-27", "Proverbs 12:1-2",
        "2 Timothy 1:7", "Proverbs 25:28", "Titus 1:8-9",
        "Proverbs 13:24", "1 Timothy 4:7-8", "Hebrews 12:5-7",
        "Proverbs 5:23", "Galatians 5:22-23", "Proverbs 15:32-33",
        "2 Peter 1:5-6", "Sirach 18:30-31", "Proverbs 10:17",
        "1 Corinthians 6:12", "Romans 6:12-13", "Proverbs 19:20",
        "Job 5:17-18", "Deuteronomy 8:5-6", "Proverbs 29:17",
        "Revelation 3:19", "Psalm 94:12-13", "Proverbs 23:12",
        "1 Thessalonians 5:6",
    ],
    "Gratitude": [
        "1 Thessalonians 5:16-18", "Colossians 3:15-17",
        "Psalm 100:4-5", "Philippians 4:6-7", "Psalm 107:1-2",
        "Ephesians 5:19-20", "Psalm 136:1-3", "1 Chronicles 16:34",
        "Sirach 51:1-2", "Psalm 9:1-2", "2 Corinthians 9:15",
        "Luke 17:15-16", "Psalm 118:1-2", "Daniel 2:23",
        "Hebrews 12:28-29", "Psalm 95:1-3", "1 Timothy 4:4-5",
        "Psalm 103:1-3", "Colossians 2:6-7", "Psalm 30:11-12",
        "Revelation 7:11-12", "Psalm 116:12-13", "James 1:17",
        "Psalm 34:1-2", "1 Corinthians 15:57",
    ],
    "Forgiveness": [
        "Matthew 6:14-15", "Colossians 3:13", "Ephesians 4:31-32",
        "Luke 6:37", "Matthew 18:21-22", "Mark 11:25-26",
        "Sirach 28:2-4", "Luke 23:34", "1 John 1:9",
        "Psalm 103:10-12", "Isaiah 43:25-26", "Proverbs 17:9",
        "Matthew 5:23-24", "Romans 12:17-19", "Luke 17:3-4",
        "Micah 7:18-19", "Acts 3:19-20", "2 Corinthians 2:7-8",
        "Genesis 50:19-21", "Psalm 32:1-2", "Daniel 9:9-10",
        "Hebrews 8:12", "James 5:15-16", "Matthew 18:32-35",
        "Ephesians 1:7-8",
    ],
    "Courage": [
        "Joshua 1:6-7", "Psalm 27:1-3", "Deuteronomy 31:8",
        "1 Corinthians 16:13", "Isaiah 41:13-14", "2 Timothy 1:7",
        "Psalm 31:24-25", "Acts 4:13", "Ephesians 6:10-11",
        "Proverbs 28:1-2", "Psalm 118:6-7", "Matthew 10:28",
        "Hebrews 13:6", "1 Chronicles 22:13", "Daniel 3:17-18",
        "Psalm 56:3-4", "Mark 6:50", "2 Chronicles 15:7-8",
        "Judith 8:24-25", "Psalm 3:5-6", "1 Samuel 17:45-47",
        "Isaiah 35:3-4", "Luke 12:4-5", "Romans 8:31-32",
        "Psalm 23:4-5",
    ],
}


async def build_rows():
    rows, failures = [], []
    total = sum(len(v) for v in CITATIONS.values())
    done = 0

    for category, refs in CITATIONS.items():
        for ref in refs:
            done += 1
            try:
                parsed = parse_reference(ref)
                book = parsed["book"]
                chapter = parsed["chapter"]
                vr = parsed["verse_ranges"]
                verse_start, verse_end = vr[0][0], vr[-1][1]
            except Exception as e:
                failures.append((category, ref, f"parse failed: {type(e).__name__}: {e}"))
                continue

            try:
                text = await fetch_reading_text(ref)
            except Exception as e:
                failures.append((category, ref, f"fetch failed: {type(e).__name__}: {e}"))
                continue

            if not text or text.startswith("[Reading unavailable"):
                failures.append((category, ref, text or "empty"))
                continue

            rows.append({
                "category": category,
                "book": book,
                "chapter": chapter,
                "verse_start": verse_start,
                "verse_end": verse_end,
                "reference": ref,
                "text": text.strip(),
            })

            if done % 25 == 0:
                print(f"  ...{done}/{total} fetched", flush=True)

    return rows, failures


def main():
    print("Fetching verse text for the Virtues group...", flush=True)
    rows, failures = asyncio.run(build_rows())

    print(f"\nFetched {len(rows)} passages. {len(failures)} could not be resolved.", flush=True)

    if failures:
        print(f"\n--- {len(failures)} citations skipped ---", flush=True)
        for category, ref, why in failures:
            print(f"  [{category}] {ref} -> {why}", flush=True)

    db = SessionLocal()
    try:
        existing = {
            (c, r)
            for c, r in db.query(
                ScripturePassage.category, ScripturePassage.reference
            ).all()
        }

        added = skipped = 0
        for row in rows:
            key = (row["category"], row["reference"])
            if key in existing:
                skipped += 1
                continue
            db.add(ScripturePassage(**row))
            existing.add(key)
            added += 1

        db.commit()
        print(f"\nInserted {added} new passages. Skipped {skipped} already present.", flush=True)

        print("\nPassage count per virtue:", flush=True)
        for category in CITATIONS:
            n = db.query(ScripturePassage).filter(
                ScripturePassage.category == category
            ).count()
            print(f"  {category}: {n}", flush=True)

    except Exception as e:
        db.rollback()
        print(f"\nInsert failed, nothing was written: {type(e).__name__}: {e}", flush=True)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
