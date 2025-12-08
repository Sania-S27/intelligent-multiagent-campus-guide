from sqlalchemy import Boolean, Column, Integer, String, Enum, Date, Text, DECIMAL, TIMESTAMP, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# User, Event, FAQ models (No change)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    
    # THIS IS THE LINE YOU ARE MISSING
    email = Column(String(100), unique=True, index=True, nullable=False)
    
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('user', 'admin'), nullable=False, default='user')
    created_at = Column(TIMESTAMP, server_default=func.now())
    receives_notifications = Column(Boolean, nullable=False, default=True)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(Date, nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    registration_link = Column(String(255), nullable=True) # <-- Event registration link
    location = relationship("Location")
    category = Column(String(100), nullable=True) # e.g., "Technical", "Cultural", "Sports"
    created_at = Column(TIMESTAMP, server_default=func.now())
    # New relationship to registrations
    registrations = relationship("EventRegistration", back_populates="event")# ^^^ ADD THIS LINE ^^^
class EventRegistration(Base):
    __tablename__ = "event_registrations"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), primary_key=True)
    registered_at = Column(TIMESTAMP, server_default=func.now())
    
    user = relationship("User")
    event = relationship("Event", back_populates="registrations")
class NotificationHistory(Base):
    __tablename__ = "notification_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(255), nullable=False)
    sent_at = Column(TIMESTAMP, server_default=func.now())
    is_read = Column(Boolean, default=False)
    
    user = relationship("User")
class FAQ(Base):
    __tablename__ = "faqs"
    id = Column(Integer, primary_key=True, index=True)
    
    # VVV MAKE SURE THESE TWO LINES EXIST VVV
    question = Column(String(255), nullable=False)
    answer = Column(Text, nullable=False)
class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    latitude = Column(DECIMAL(10, 8), nullable=False)
    longitude = Column(DECIMAL(11, 8), nullable=False)

# NEW MODEL
class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    path_json = Column(JSON, nullable=False)
    # ... (your other models) ...

class UnansweredQuery(Base):
    __tablename__ = "unanswered_queries"
    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(String(255), unique=True, index=True, nullable=False)
    ask_count = Column(Integer, nullable=False, default=1)
    last_asked_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())