from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON

from app.db.session import Base


class Extraction(Base):
    __tablename__ = "extractions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source_type = Column(String, nullable=False)  # screenshot | text
    source_url = Column(String, nullable=True)
    raw_text = Column(String, nullable=True)
    parsed = Column(JSON, nullable=True)
    confidence = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
