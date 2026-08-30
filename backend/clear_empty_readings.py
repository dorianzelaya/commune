"""
Delete cached daily_content rows that have a citation but no verse text.

When the upstream scripture source rejected the backend's requests, the
readings were still cached — with empty text. Those rows would keep being
served from cache forever, so they have to be removed before the fixed
fetch can repopulate them.

Run from the backend directory:

    source venv/bin/activate
    python3 clear_empty_readings.py
"""

from database import SessionLocal
import models


def main():
    db = SessionLocal()
    try:
        rows = db.query(models.DailyContent).all()

        bad = []
        for r in rows:
            # A row is broken if it names a reading but has no text for it.
            has_ref = any([
                r.first_reading_ref, r.psalm_ref,
                r.second_reading_ref, r.gospel_ref,
            ])
            has_text = any([
                (r.first_reading_text or "").strip(),
                (r.psalm_text or "").strip(),
                (r.second_reading_text or "").strip(),
                (r.gospel_text or "").strip(),
            ])
            if has_ref and not has_text:
                bad.append(r)

        if not bad:
            print("No empty-text rows found. Nothing to clear.")
            return

        print(f"Found {len(bad)} cached day(s) with citations but no verse text:")
        for r in bad:
            print(f"  {r.date}")

        for r in bad:
            db.delete(r)
        db.commit()
        print(f"\nDeleted {len(bad)} row(s). They will refetch on next request.")

    except Exception as e:
        db.rollback()
        print(f"Failed, nothing deleted: {type(e).__name__}: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
