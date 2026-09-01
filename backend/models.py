from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, Boolean
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StrugglePrayer(Base):
    __tablename__ = "struggle_prayers"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)
    prayer_name = Column(String, nullable=False)
    attribution = Column(String, nullable=True)
    text = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StruggleSaint(Base):
    __tablename__ = "struggle_saints"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)
    saint_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StruggleBiblicalFigure(Base):
    __tablename__ = "struggle_biblical_figures"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)
    figure_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
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