"""Spanish search found nothing because bible_verses_es had no tsv column.

The English table carries tsv (english config, stemming) and tsv_simple
(simple config, no stop-word removal, for quoted phrases). This gives the
Spanish table the same pair built with the spanish config, so stemming works
on Spanish forms and a quoted phrase can match words the spanish dictionary
would otherwise discard.

Generated columns, same as the English side, so they stay correct on any
later insert without application code.
"""
from sqlalchemy import text
from database import engine

STMTS = [
    "alter table bible_verses_es add column if not exists tsv tsvector "
    "generated always as (to_tsvector('spanish', text)) stored",
    "alter table bible_verses_es add column if not exists tsv_simple tsvector "
    "generated always as (to_tsvector('simple', text)) stored",
    "create index if not exists bible_verses_es_tsv on bible_verses_es using gin (tsv)",
    "create index if not exists bible_verses_es_tsv_simple on bible_verses_es using gin (tsv_simple)",
]

with engine.begin() as c:
    for s in STMTS:
        print('->', s[:78])
        c.execute(text(s))

with engine.connect() as c:
    print()
    print('columns:', [r[0] for r in c.execute(text(
        "select column_name from information_schema.columns "
        "where table_name='bible_verses_es' order by ordinal_position"))])
    print('indexes:', [r[0] for r in c.execute(text(
        "select indexname from pg_indexes where tablename='bible_verses_es'"))])
    print()
    for q in ['misericordia', 'no temas', 'pastor']:
        n = c.execute(text("select count(*) from bible_verses_es "
                           "where tsv @@ websearch_to_tsquery('spanish', :q)"), {'q': q}).scalar()
        print('  %-16s %d hits' % (q, n))
    n = c.execute(text("select count(*) from bible_verses_es "
                       "where tsv_simple @@ phraseto_tsquery('simple', :q)"),
                  {'q': 'no temas'}).scalar()
    print('  %-16s %d hits (exact phrase)' % ('"no temas"', n))
