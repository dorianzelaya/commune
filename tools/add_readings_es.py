"""Columns for the readings in Spanish, resolved from bible_verses_es."""
from sqlalchemy import text
from database import engine
with engine.begin() as c:
    for col in ("first_reading_text_es", "psalm_text_es",
                "second_reading_text_es", "gospel_text_es"):
        c.execute(text(f"alter table daily_content add column if not exists {col} text"))
        print('->', col)
with engine.connect() as c:
    print([r[0] for r in c.execute(text(
        "select column_name from information_schema.columns "
        "where table_name='daily_content' order by ordinal_position"))])
