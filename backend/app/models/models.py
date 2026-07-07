from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Officer(Base):
    __tablename__ = "officers"
    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), nullable=False)
    email       = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(256))
    branch      = Column(String(100))
    zone        = Column(String(100))
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, default=datetime.utcnow)
    prospects   = relationship("Prospect", back_populates="officer")

class Prospect(Base):
    __tablename__ = "prospects"
    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(100), nullable=False)
    phone           = Column(String(15))
    email           = Column(String(100))
    age             = Column(Integer)
    income          = Column(Float)
    occupation      = Column(String(100))
    city            = Column(String(100))
    cibil_score     = Column(Integer)
    existing_products = Column(String(200))
    recommended_product = Column(String(100))
    prospect_score  = Column(Float, default=0.0)
    score_reasons   = Column(Text)           # JSON string
    status          = Column(String(50), default="new")   # new | contacted | converted | lost
    officer_id      = Column(Integer, ForeignKey("officers.id"))
    officer         = relationship("Officer", back_populates="prospects")
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class OutreachScript(Base):
    __tablename__ = "outreach_scripts"
    id           = Column(Integer, primary_key=True, index=True)
    prospect_id  = Column(Integer, ForeignKey("prospects.id"))
    script_type  = Column(String(50))   # call | email | whatsapp
    language     = Column(String(20), default="english")
    content      = Column(Text)
    created_at   = Column(DateTime, default=datetime.utcnow)

class Interaction(Base):
    __tablename__ = "interactions"
    id           = Column(Integer, primary_key=True, index=True)
    prospect_id  = Column(Integer, ForeignKey("prospects.id"))
    officer_id   = Column(Integer, ForeignKey("officers.id"))
    type         = Column(String(50))   # call | email | meeting
    outcome      = Column(String(50))   # interested | not_interested | callback | converted
    notes        = Column(Text)
    created_at   = Column(DateTime, default=datetime.utcnow)
