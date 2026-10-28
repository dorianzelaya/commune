"""Columns for the Spanish saint blurb and quote, filled on first request."""
from sqlalchemy import text
from database import engine
with engine.begin() as c:
    for s in ["alter table daily_content add column if not exists saint_description_es text",
              "alter table daily_content add column if not exists saint_quote_es text"]:
        print('->', s)
        c.execute(text(s))
with engine.connect() as c:
    print([r[0] for r in c.execute(text(
        "select column_name from information_schema.columns "
        "where table_name='daily_content' order by ordinal_position"))])
