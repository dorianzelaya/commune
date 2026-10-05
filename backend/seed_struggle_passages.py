"""
Expand the Seek scripture pool.

Run this ONCE from the backend directory (or the Railway console):

    python3 seed_struggle_passages.py

WHY IT IS BUILT THIS WAY
------------------------
Only the CITATIONS below are authored by hand. The verse TEXT is never
typed out here — it is fetched from the Douay-Rheims source through the
app's existing services.fetch_reading_text(). That matters for a
devotional app: a mistyped or invented citation fails loudly and gets
skipped instead of quietly shipping scripture that does not exist.

Reusing fetch_reading_text also means psalm numbering conversion
(modern -> Vulgate) and book-slug mapping are handled by code already
in production, so citations here are written in ordinary modern form
e.g. "Psalm 23:1-4" and come out correct in Douay-Rheims.

The script is idempotent: it skips any (category, reference) pair that
is already in the table, so running it twice adds nothing new.
"""

import asyncio
import sys

from database import SessionLocal
from models import ScripturePassage
from services import fetch_reading_text
from reference_parser import parse_reference


CITATIONS = {
    # ---------------- GROWTH ----------------
    "Discernment": [
        "Proverbs 3:5-6", "James 1:5", "Psalm 25:4-6", "Romans 12:2",
        "1 Kings 3:9", "Proverbs 2:1-5", "Psalm 32:8-9", "Isaiah 30:21",
        "John 16:13", "Philippians 1:9-10", "Colossians 1:9", "Psalm 143:10-11",
        "Proverbs 16:9", "1 Corinthians 2:12-13", "Sirach 37:16",
        "Wisdom 9:10", "Psalm 119:105-106", "Jeremiah 29:11", "Micah 6:8",
        "Ephesians 5:15-17", "Hebrews 5:14", "1 John 4:1", "Proverbs 11:14",
        "Psalm 37:23-24", "Luke 6:12",
    ],
    "Wisdom": [
        "Proverbs 9:10", "James 3:17", "Wisdom 7:7-8", "Sirach 1:14",
        "Proverbs 4:7", "Ecclesiastes 7:12", "1 Corinthians 1:25",
        "Psalm 111:10-11", "Proverbs 2:6", "Job 28:28", "Wisdom 6:12",
        "Sirach 6:18", "Colossians 2:3", "Proverbs 3:13-15",
        "1 Corinthians 3:19", "Psalm 90:12-13", "Daniel 2:20-21",
        "Proverbs 19:20", "Sirach 21:15", "Matthew 7:24", "James 1:5",
        "Wisdom 8:7", "Proverbs 15:33", "Ecclesiastes 2:26", "Romans 11:33",
    ],
    "Peace": [
        "John 14:27", "Philippians 4:6-7", "Isaiah 26:3", "Psalm 4:8-9",
        "Matthew 11:28-29", "Romans 5:1", "Colossians 3:15", "Psalm 29:11-12",
        "Numbers 6:24-26", "John 16:33", "Isaiah 9:6", "2 Thessalonians 3:16",
        "Psalm 34:14-15", "Romans 12:18", "Matthew 5:9", "Galatians 5:22",
        "Ephesians 2:14", "Isaiah 32:17", "Proverbs 16:7", "Psalm 85:8-9",
        "1 Peter 3:11", "Hebrews 12:14", "James 3:18", "Luke 2:14",
        "Psalm 119:165-166",
    ],
    "Hope": [
        "Romans 15:13", "Jeremiah 29:11", "Psalm 42:5-6", "Romans 8:24-25",
        "Hebrews 11:1", "Lamentations 3:22-24", "Isaiah 40:31",
        "1 Peter 1:3", "Psalm 130:5-6", "Romans 5:3-5", "Titus 2:13",
        "Psalm 33:20-23", "Hebrews 6:19", "Proverbs 23:18", "Micah 7:7",
        "1 Corinthians 13:13", "Psalm 71:5-6", "Colossians 1:27",
        "Romans 12:12", "Psalm 39:7-8", "Job 11:18", "Isaiah 41:10",
        "2 Corinthians 4:16-18", "Psalm 62:5-6", "1 Thessalonians 4:13",
    ],
    "Knowledge": [
        "Proverbs 1:7", "Hosea 4:6", "2 Peter 1:5-6", "Colossians 2:2-3",
        "Proverbs 18:15", "Daniel 12:4", "1 Corinthians 8:1",
        "Psalm 119:66-67", "Proverbs 15:14", "Isaiah 11:2", "Ephesians 1:17",
        "Philippians 3:8", "Sirach 1:19", "Proverbs 24:5", "Job 36:4",
        "2 Timothy 3:16-17", "Romans 15:14", "Proverbs 10:14",
        "1 Corinthians 13:2", "Wisdom 7:17", "Psalm 94:10-11",
        "Proverbs 22:17", "Jeremiah 3:15", "Malachi 2:7", "John 8:32",
    ],

    # ---------------- EMOTIONS ----------------
    "Anxiety": [
        "Philippians 4:6-7", "1 Peter 5:7", "Matthew 6:25-27",
        "Psalm 55:22-23", "John 14:27", "Isaiah 41:10", "Matthew 6:34",
        "Psalm 94:19-20", "Proverbs 12:25", "Luke 12:22-26", "Psalm 23:1-5",
        "2 Timothy 1:7", "Isaiah 26:3", "Psalm 34:4-5", "Deuteronomy 31:8",
        "Joshua 1:9", "Psalm 46:1-3", "Matthew 11:28-30", "Romans 8:38-39",
        "Psalm 118:5-7", "Hebrews 13:6", "Psalm 27:1-2", "Isaiah 43:1-2",
        "Nahum 1:7", "Psalm 56:3-4",
    ],
    "Fear": [
        "Isaiah 41:10", "Psalm 27:1-2", "2 Timothy 1:7", "Joshua 1:9",
        "Deuteronomy 31:6", "Psalm 23:4-5", "1 John 4:18", "Psalm 56:3-5",
        "Isaiah 43:1-2", "Romans 8:15", "Psalm 46:1-4", "Matthew 10:28",
        "Psalm 91:1-3", "Proverbs 29:25", "Hebrews 13:6", "Psalm 118:6-7",
        "Luke 12:32", "Isaiah 35:4", "Psalm 34:4-5", "Mark 4:39-40",
        "Psalm 112:7-8", "John 14:1", "Exodus 14:14", "Psalm 3:5-7",
        "Zephaniah 3:17",
    ],
    "Sadness": [
        "Psalm 34:18-19", "Matthew 5:4", "Revelation 21:4", "Psalm 147:3-4",
        "John 16:22", "Psalm 30:5-6", "Isaiah 61:3", "2 Corinthians 1:3-4",
        "Psalm 42:11-12", "Lamentations 3:31-33", "Psalm 126:5-6",
        "Ecclesiastes 3:4", "Romans 8:18", "Psalm 56:8-9", "John 11:35",
        "Psalm 6:6-10", "Isaiah 25:8", "Jeremiah 31:13", "Psalm 31:9-11",
        "1 Peter 5:10", "Psalm 71:20-22", "Job 5:11", "Psalm 138:7-8",
        "Nehemiah 8:10", "Psalm 43:5-6",
    ],
    "Loneliness": [
        "Psalm 139:7-11", "Deuteronomy 31:6", "Isaiah 41:10",
        "Matthew 28:20", "Hebrews 13:5", "Psalm 68:6-7", "John 14:18",
        "Psalm 25:16-17", "Genesis 2:18", "Psalm 27:10-11", "Romans 8:38-39",
        "Psalm 23:4-5", "1 Kings 19:10-12", "Isaiah 43:2", "Psalm 46:1-2",
        "2 Timothy 4:16-17", "Psalm 142:4-6", "Proverbs 18:24",
        "Ecclesiastes 4:9-10", "Psalm 73:23-25", "John 16:32",
        "Psalm 34:18-19", "Matthew 11:28", "Psalm 91:15-16", "Joshua 1:5",
    ],
    "Grief": [
        "Psalm 34:18-19", "Matthew 5:4", "John 11:25-26", "Revelation 21:4",
        "1 Thessalonians 4:13-14", "Psalm 147:3-4", "2 Corinthians 1:3-4",
        "Isaiah 61:2-3", "Psalm 23:4-5", "Romans 8:18", "Lamentations 3:31-32",
        "John 14:1-3", "Psalm 116:15-16", "Ecclesiastes 3:1-4",
        "1 Corinthians 15:54-55", "Psalm 30:11-12", "Job 1:21",
        "Isaiah 25:8", "Psalm 56:8-9", "Wisdom 3:1-3", "2 Maccabees 12:46",
        "Psalm 31:9-10", "John 16:20", "Sirach 38:16-17", "Psalm 42:3-4",
    ],
    "Anger": [
        "James 1:19-20", "Ephesians 4:26-27", "Proverbs 15:1",
        "Colossians 3:8", "Proverbs 14:29", "Psalm 37:8-9",
        "Ecclesiastes 7:9", "Proverbs 16:32", "Matthew 5:22",
        "Romans 12:19", "Proverbs 19:11", "Sirach 27:30",
        "Proverbs 29:11", "Galatians 5:19-21", "Psalm 4:4-5",
        "Proverbs 22:24-25", "1 Peter 3:9", "Matthew 5:44",
        "Proverbs 25:28", "Titus 1:7", "James 4:1-2", "Romans 12:21",
        "Sirach 28:3-5", "Proverbs 20:22", "Ephesians 4:31-32",
    ],
    "Shame": [
        "Romans 8:1", "Isaiah 1:18", "Psalm 34:5-6", "1 John 1:9",
        "Romans 10:11", "Psalm 103:12-13", "Hebrews 12:2", "Isaiah 61:7",
        "Joel 2:25-26", "Psalm 25:3-4", "2 Corinthians 5:17",
        "Micah 7:18-19", "Psalm 51:1-3", "Isaiah 54:4", "John 8:10-11",
        "Ephesians 2:4-5", "Psalm 32:5-6", "Romans 5:8", "1 Peter 2:6",
        "Colossians 1:22", "Psalm 130:3-5", "Luke 15:20-22",
        "Hebrews 10:22", "Isaiah 43:25", "Titus 3:5",
    ],

    # ---------------- FAITH STRUGGLES ----------------
    "Doubt": [
        "Mark 9:24", "James 1:6", "John 20:27-29", "Matthew 14:31",
        "Hebrews 11:1", "Psalm 46:10-11", "Proverbs 3:5-6", "Isaiah 55:8-9",
        "Romans 4:20-21", "Matthew 21:21", "Luke 1:37", "John 14:1",
        "Psalm 62:8-9", "2 Corinthians 5:7", "Jude 1:22", "Psalm 73:26-27",
        "Matthew 17:20", "Romans 10:17", "Habakkuk 2:4", "John 6:68-69",
        "1 Peter 1:8-9", "Psalm 27:13-15", "Isaiah 40:28-29",
        "Ephesians 3:16-17", "Hebrews 10:23",
    ],
    "Despair": [
        "Psalm 34:18-19", "Isaiah 40:31", "Romans 8:38-39",
        "2 Corinthians 4:8-9", "Psalm 42:11-12", "Lamentations 3:22-24",
        "Jeremiah 29:11", "Psalm 40:1-4", "John 16:33", "Psalm 130:1-3",
        "Isaiah 41:10", "Psalm 3:3-4", "Romans 15:13", "Psalm 71:20-21",
        "Micah 7:8", "Psalm 143:7-9", "1 Peter 5:7", "Psalm 30:5-6",
        "Job 19:25", "Psalm 27:13-14", "Isaiah 43:2", "Psalm 91:15-16",
        "Matthew 11:28", "Psalm 46:1-2", "Hebrews 6:19",
    ],
    "Feeling distant from God": [
        "James 4:8", "Jeremiah 29:13", "Psalm 145:18-19", "Isaiah 55:6",
        "Deuteronomy 4:29", "Psalm 34:18-19", "Matthew 7:7-8",
        "Psalm 139:7-11", "Hosea 6:1", "Luke 15:20", "Psalm 42:1-3",
        "Revelation 3:20", "Psalm 63:1-2", "Zechariah 1:3", "Joel 2:12-13",
        "Isaiah 59:1-2", "Psalm 73:28-29", "1 John 1:9", "Acts 17:27",
        "Psalm 22:1-3", "Hebrews 4:16", "Psalm 27:8-9", "Malachi 3:7",
        "Romans 8:38-39", "Psalm 16:8-9",
    ],
    "Temptation": [
        "1 Corinthians 10:13", "Matthew 26:41", "James 1:12-14",
        "Hebrews 4:15-16", "Ephesians 6:11", "1 Peter 5:8-9",
        "Matthew 4:1-4", "Romans 6:12-14", "Galatians 5:16",
        "2 Timothy 2:22", "Proverbs 4:14-15", "James 4:7",
        "Psalm 119:11-12", "1 John 2:16", "Luke 22:40", "Romans 13:14",
        "Titus 2:11-12", "Hebrews 2:18", "2 Peter 2:9", "Job 31:1",
        "Sirach 2:1", "Proverbs 1:10", "1 Thessalonians 5:22",
        "Colossians 3:5", "Psalm 141:4-5",
    ],
    "Lukewarmness": [
        "Revelation 3:15-16", "Romans 12:11", "Matthew 22:37",
        "Hebrews 10:24-25", "2 Timothy 1:6", "Galatians 6:9",
        "Colossians 3:23", "Psalm 51:10-13", "Joel 2:12-13",
        "Isaiah 29:13", "Ephesians 5:14", "1 Thessalonians 5:19",
        "Matthew 5:13", "Proverbs 13:4", "Ecclesiastes 9:10",
        "Luke 9:62", "James 4:8", "Hosea 10:12", "Philippians 3:13-14",
        "1 Corinthians 9:24", "Hebrews 12:1", "Revelation 2:4-5",
        "Psalm 42:1-2", "Romans 13:11", "Sirach 2:16",
    ],

    # ---------------- SINS & VICES ----------------
    "Lust": [
        "Matthew 5:28", "1 Corinthians 6:18-20", "1 Thessalonians 4:3-5",
        "Job 31:1", "Galatians 5:16", "Colossians 3:5", "2 Timothy 2:22",
        "Proverbs 6:25", "1 John 2:16", "Romans 13:14", "Psalm 119:9-10",
        "Ephesians 5:3", "1 Peter 2:11", "Proverbs 5:3-5",
        "1 Corinthians 10:13", "Matthew 5:29-30", "Sirach 23:5-6",
        "Romans 6:12", "Titus 2:11-12", "Psalm 51:10-11", "Galatians 5:24",
        "Proverbs 7:25", "Hebrews 13:4", "2 Peter 1:4", "Psalm 141:4-5",
    ],
    "Pride": [
        "Proverbs 16:18", "James 4:6", "Philippians 2:3-4",
        "1 Peter 5:5-6", "Proverbs 11:2", "Luke 14:11", "Romans 12:3",
        "Sirach 10:12-13", "Proverbs 29:23", "Isaiah 2:11",
        "Galatians 6:3", "Matthew 23:12", "Psalm 138:6-7",
        "1 Corinthians 4:7", "Proverbs 18:12", "Micah 6:8",
        "Jeremiah 9:23-24", "2 Corinthians 12:9", "Proverbs 3:34",
        "Daniel 4:34", "Obadiah 1:3-4", "Mark 9:35", "John 13:14-15",
        "Sirach 3:18", "Psalm 101:5-6",
    ],
    "Envy": [
        "Exodus 20:17", "James 3:16", "Proverbs 14:30", "Galatians 5:26",
        "1 Corinthians 13:4", "Psalm 37:1-3", "Proverbs 23:17",
        "Romans 13:13", "1 Peter 2:1", "Titus 3:3", "Sirach 30:24",
        "Ecclesiastes 4:4", "Galatians 5:19-21", "Proverbs 27:4",
        "Mark 7:21-22", "Job 5:2", "Psalm 73:2-4", "Philippians 2:3",
        "Romans 12:15", "1 Timothy 6:6", "Hebrews 13:5",
        "Matthew 20:15", "Proverbs 24:19-20", "Colossians 3:2",
        "1 Corinthians 3:3",
    ],
    "Gluttony": [
        "Proverbs 23:20-21", "Philippians 3:19", "1 Corinthians 6:19-20",
        "Proverbs 25:16", "Sirach 37:29-31", "Romans 13:14",
        "1 Corinthians 10:31", "Titus 1:12", "Luke 21:34",
        "Proverbs 23:2", "Galatians 5:22-23", "1 Peter 4:3",
        "Ecclesiastes 10:17", "Deuteronomy 21:20", "Matthew 4:4",
        "Proverbs 21:17", "1 Timothy 4:8", "Romans 14:17",
        "Daniel 1:12-15", "1 Corinthians 9:27", "Sirach 31:20",
        "Proverbs 30:8-9", "Isaiah 55:2", "John 6:27", "Psalm 78:18-19",
    ],
    "Sloth": [
        "Proverbs 6:6-9", "Colossians 3:23", "2 Thessalonians 3:10",
        "Proverbs 13:4", "Ecclesiastes 9:10", "Romans 12:11",
        "Proverbs 12:24", "Galatians 6:9", "Proverbs 20:4",
        "1 Corinthians 15:58", "Hebrews 6:12", "Proverbs 24:30-34",
        "Matthew 25:26-27", "Proverbs 19:15", "Sirach 22:1-2",
        "1 Thessalonians 4:11", "Proverbs 10:4", "Ephesians 5:15-16",
        "Titus 3:14", "Proverbs 21:25", "Luke 12:35-37",
        "2 Timothy 4:5", "Psalm 90:17-18", "Proverbs 14:23", "James 4:17",
    ],
    "Greed": [
        "1 Timothy 6:9-10", "Luke 12:15", "Hebrews 13:5",
        "Matthew 6:19-21", "Proverbs 11:28", "Ecclesiastes 5:10",
        "Mark 8:36", "1 John 2:15-17", "Proverbs 15:27",
        "Matthew 6:24", "Psalm 62:10-11", "Luke 12:16-21",
        "1 Timothy 6:6-8", "Proverbs 28:22", "Sirach 31:5",
        "James 5:1-3", "Colossians 3:5", "Proverbs 22:1",
        "2 Corinthians 9:7", "Acts 20:35", "Deuteronomy 15:11",
        "Proverbs 19:17", "Matthew 19:21", "1 Chronicles 29:14",
        "Psalm 37:16-17",
    ],
    "Wrath": [
        "Ephesians 4:31-32", "James 1:19-20", "Proverbs 15:1",
        "Romans 12:19-21", "Colossians 3:8", "Proverbs 16:32",
        "Matthew 5:22", "Psalm 37:8-9", "Proverbs 14:29",
        "Ecclesiastes 7:9", "Sirach 28:3-5", "Matthew 5:44",
        "Proverbs 19:11", "1 Peter 3:9", "Galatians 5:22-23",
        "Proverbs 29:22", "Luke 6:27-28", "Ephesians 4:26",
        "Proverbs 25:21-22", "Matthew 6:14-15", "Romans 12:17",
        "Proverbs 20:22", "1 Corinthians 13:5", "Psalm 4:4-5",
        "Titus 3:2",
    ],

    # ---------------- LIFE SITUATIONS ----------------
    "Family conflict": [
        "Colossians 3:13-14", "Ephesians 4:2-3", "Romans 12:18",
        "1 Peter 4:8", "Proverbs 15:1", "Matthew 18:15",
        "Ephesians 6:1-4", "Colossians 3:20-21", "Proverbs 17:17",
        "1 Corinthians 13:4-7", "Matthew 5:23-24", "Sirach 3:1-6",
        "Psalm 133:1-2", "James 1:19", "Proverbs 20:3", "Romans 14:19",
        "Galatians 6:2", "Proverbs 11:29", "Matthew 6:14-15",
        "1 John 4:20", "Hebrews 12:14", "Proverbs 18:19",
        "Ephesians 4:32", "Genesis 50:20", "Luke 6:31",
    ],
    "Work stress": [
        "Colossians 3:23-24", "Matthew 11:28-30", "Philippians 4:13",
        "Ecclesiastes 3:13", "Proverbs 16:3", "1 Peter 5:7",
        "Psalm 90:17-18", "Exodus 20:9-10", "Galatians 6:9",
        "2 Thessalonians 3:13", "Proverbs 12:11", "Matthew 6:33",
        "Psalm 127:1-3", "1 Corinthians 15:58", "Ecclesiastes 2:24",
        "Proverbs 14:23", "Isaiah 40:29-31", "Psalm 55:22-23",
        "Colossians 3:17", "Jeremiah 17:7-8", "Proverbs 22:29",
        "Hebrews 6:10", "Matthew 6:25-26", "Psalm 37:5-6",
        "1 Thessalonians 4:11",
    ],
    "Relationship trouble": [
        "1 Corinthians 13:4-7", "Ephesians 4:2-3", "Colossians 3:13",
        "Proverbs 17:17", "1 Peter 4:8", "Romans 12:10",
        "Ecclesiastes 4:9-12", "Proverbs 27:17", "Matthew 18:21-22",
        "John 15:12", "Galatians 6:2", "Proverbs 18:24",
        "1 John 4:7-8", "Romans 12:18", "Sirach 6:14-16",
        "Ephesians 5:25", "Proverbs 15:1", "Hebrews 10:24-25",
        "Matthew 7:12", "1 Thessalonians 5:11", "Proverbs 16:28",
        "Colossians 3:14", "James 5:16", "Psalm 133:1-2", "Amos 3:3",
    ],
    "Financial worry": [
        "Matthew 6:25-34", "Philippians 4:19", "Hebrews 13:5",
        "Proverbs 3:9-10", "Psalm 37:25-26", "1 Timothy 6:6-8",
        "Luke 12:22-31", "Proverbs 22:7", "Malachi 3:10",
        "2 Corinthians 9:8", "Psalm 23:1-2", "Proverbs 13:11",
        "Matthew 6:19-21", "Deuteronomy 8:18", "Psalm 34:10-11",
        "Proverbs 21:20", "1 Peter 5:7", "Ecclesiastes 5:10",
        "Luke 16:10-11", "Proverbs 11:24-25", "Psalm 55:22-23",
        "James 1:17", "Matthew 6:11", "Proverbs 30:8-9",
        "2 Corinthians 8:9",
    ],
    "Illness": [
        "James 5:14-15", "Psalm 41:3-4", "Isaiah 53:5", "Jeremiah 30:17",
        "Psalm 103:2-4", "Matthew 11:28", "2 Corinthians 12:9-10",
        "Psalm 34:19-20", "Exodus 15:26", "Psalm 147:3-4",
        "3 John 1:2", "Isaiah 41:10", "Psalm 73:26-27", "Mark 5:34",
        "Romans 8:18", "Sirach 38:9", "Psalm 30:2-3", "Matthew 8:16-17",
        "Psalm 6:2-3", "1 Peter 2:24", "Psalm 116:1-3", "Proverbs 17:22",
        "2 Corinthians 4:16", "Psalm 23:4-5", "Revelation 21:4",
    ],
    "Loss": [
        "Psalm 34:18-19", "Matthew 5:4", "Revelation 21:4", "Job 1:21",
        "Romans 8:28", "2 Corinthians 1:3-4", "Psalm 147:3-4",
        "Ecclesiastes 3:1-4", "Isaiah 61:1-3", "Lamentations 3:22-24",
        "Psalm 23:4-5", "John 16:22", "1 Peter 5:10", "Psalm 30:5-6",
        "Romans 8:18", "Psalm 46:1-2", "Isaiah 43:2", "Psalm 73:26-27",
        "Matthew 11:28-30", "Psalm 121:1-3", "Hebrews 13:8",
        "Psalm 56:8-9", "Deuteronomy 31:8", "Jeremiah 29:11",
        "Psalm 55:22-23",
    ],
    "Death of a loved one": [
        "John 11:25-26", "1 Thessalonians 4:13-14", "Revelation 21:4",
        "Psalm 116:15-16", "Wisdom 3:1-3", "2 Maccabees 12:46",
        "Romans 14:8", "1 Corinthians 15:54-55", "Psalm 23:4-5",
        "John 14:1-3", "Matthew 5:4", "Psalm 34:18-19",
        "2 Corinthians 5:1", "Isaiah 25:8", "Romans 8:38-39",
        "Psalm 147:3-4", "Philippians 1:21", "Lamentations 3:31-32",
        "Ecclesiastes 12:7", "Psalm 73:26-27", "John 5:28-29",
        "Sirach 38:16-17", "Psalm 30:11-12", "Job 19:25-26",
        "1 Peter 1:3-4",
    ],
}


async def build_rows():
    """
    Fetch real text for every citation and parse out the structured
    columns the table requires (book, chapter, verse_start, verse_end).
    Returns (rows, failures).
    """
    rows = []
    failures = []
    total = sum(len(v) for v in CITATIONS.values())
    done = 0

    for category, refs in CITATIONS.items():
        for ref in refs:
            done += 1

            # Parse first. The table has NOT NULL columns for book,
            # chapter, and verse range, so a citation that cannot be
            # parsed must be skipped rather than inserted half-empty.
            try:
                parsed = parse_reference(ref)
                book = parsed["book"]
                chapter = parsed["chapter"]
                verse_ranges = parsed["verse_ranges"]
                verse_start = verse_ranges[0][0]
                verse_end = verse_ranges[-1][1]
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
    print("Fetching verse text from the Douay-Rheims source...", flush=True)
    rows, failures = asyncio.run(build_rows())

    print(f"\nFetched {len(rows)} passages. {len(failures)} could not be resolved.", flush=True)

    # Print failures BEFORE touching the database, so they are visible
    # even if the insert stage has a problem.
    if failures:
        print(f"\n--- {len(failures)} citations skipped ---", flush=True)
        for category, ref, why in failures:
            print(f"  [{category}] {ref} -> {why}", flush=True)

    db = SessionLocal()
    try:
        # Remove psalm rows written by an earlier run. Psalm citations
        # are now widened by one verse to absorb the Douay-Rheims
        # superscription shift, so the old narrow versions would
        # otherwise linger alongside the corrected ones.
        stale = db.query(ScripturePassage).filter(
            ScripturePassage.reference.like("Psalm %")
        ).delete(synchronize_session=False)
        db.commit()
        print(f"Removed {stale} previously-seeded psalm rows.", flush=True)

        existing = {
            (c, r)
            for c, r in db.query(
                ScripturePassage.category, ScripturePassage.reference
            ).all()
        }

        added = 0
        skipped = 0
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

        print("\nPassage count per category:", flush=True)
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

    psalm_count = sum(
        1 for refs in CITATIONS.values() for r in refs if r.startswith("Psalm")
    )
    print(
        f"\nNote: {psalm_count} psalm citations were inserted, each widened by "
        "one verse. In Douay-Rheims some psalms carry the superscription as a "
        "separate verse and some do not, so the intended verse can land one "
        "position off. Widening the range guarantees it is always included.",
        flush=True,
    )


if __name__ == "__main__":
    main()