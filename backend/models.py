from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, Boolean, JSON
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DailyContent(Base):
    __tablename__ = "daily_content"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, unique=True, index=True, nullable=False)
    liturgical_season = Column(String, nullable=True)
    # Derived in services.liturgical_color, not supplied by the calendar API.
    liturgical_color = Column(String, nullable=True)
    first_reading_ref = Column(String, nullable=True)
    first_reading_text = Column(String, nullable=True)
    psalm_ref = Column(String, nullable=True)
    psalm_text = Column(String, nullable=True)
    second_reading_ref = Column(String, nullable=True)
    second_reading_text = Column(String, nullable=True)
    gospel_ref = Column(String, nullable=True)
    gospel_text = Column(String, nullable=True)
    saint_name = Column(String, nullable=True)
    saint_type = Column(String, nullable=True)
    saint_description = Column(String, nullable=True)
    saint_quote = Column(String, nullable=True)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())

class ScripturePassage(Base):
    __tablename__ = "scripture_passages"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)
    book = Column(String, nullable=False)
    chapter = Column(Integer, nullable=False)
    verse_start = Column(Integer, nullable=False)
    verse_end = Column(Integer, nullable=False)
    reference = Column(String, nullable=False)
    text = Column(String, nullable=False)
    reference_es = Column(String, nullable=True)
    text_es = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StrugglePrayer(Base):
    __tablename__ = "struggle_prayers"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)
    prayer_name = Column(String, nullable=False)
    attribution = Column(String, nullable=True)
    text = Column(String, nullable=False)
    prayer_name_es = Column(String, nullable=True)
    attribution_es = Column(String, nullable=True)
    text_es = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StruggleSaint(Base):
    __tablename__ = "struggle_saints"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)
    saint_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    saint_name_es = Column(String, nullable=True)
    description_es = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StruggleBiblicalFigure(Base):
    __tablename__ = "struggle_biblical_figures"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)
    figure_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    figure_name_es = Column(String, nullable=True)
    description_es = Column(String, nullable=True)
    # book_slug and chapter match the Bible reader's URL scheme so the
    # frontend can link directly: /bible -> testament -> book -> chapter.
    book_slug = Column(String, nullable=False)
    chapter = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                     index=True, nullable=False)
    date = Column(String, index=True, nullable=False)
    text = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserState(Base):
    """
    One row per user holding the small bag of per-user settings and
    progress that used to live only in the browser's localStorage, which
    is per-device by definition: saved verses, saved prayers, rosary
    progress, Bible reader position and the pinned theme colour.

    Stored as a single JSON blob rather than a column per key. The keys
    are a UI concern that changes as pages change, and a blob avoids a
    schema migration every time one is added. The server validates the
    key names and the overall size but does not interpret the values.

    Writes are last-one-wins. That is fine for one person moving between
    their own phone and laptop, and wrong for two people editing at once,
    which is not a case this app has.
    """
    __tablename__ = "user_state"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                     primary_key=True)
    data = Column(JSON, nullable=False, default=dict)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(),
                        onupdate=func.now())

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                     index=True, nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Fast lookup of one user's entries, newest first
Index("ix_journal_user_date", JournalEntry.user_id, JournalEntry.date)
