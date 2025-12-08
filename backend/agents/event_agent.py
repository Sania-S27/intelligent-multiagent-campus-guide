import datetime
from typing import Optional
from unicodedata import category
from sqlalchemy.orm import Session, joinedload 
from sqlalchemy import or_, func
# VVV FIX: Use absolute imports VVV
import models
import schemas
# ^^^ END FIX ^^^

def get_all_events(db: Session, category: Optional[str], sort_by: Optional[str]):
    """
    Gets all events that are happening today or in the future.
    Includes the location name via joinedload.
    """
    today = datetime.date.today()
    query= db.query(models.Event).options(
        # Eager load the 'location' relationship defined in models.py
        joinedload(models.Event.location) 
    ).filter(
        models.Event.event_date >= today
    )
    if category:
        query = query.filter(models.Event.category == category)
    if sort_by == 'recent':
        query = query.order_by(models.Event.created_at.desc())
    else: # Default sort by event date
        query = query.order_by(models.Event.event_date.asc())    
    return query.all()
def search_events(db: Session, query_str: str, category: Optional[str],sort_by: Optional[str]):
    """
    Searches for events, with optional filters.
    """
    today = datetime.date.today()
    search_term = f"%{query_str}%"
    
    query = db.query(models.Event).options(
        joinedload(models.Event.location)
    ).filter(
        models.Event.event_date >= today,
        or_(
            models.Event.title.like(search_term),
            models.Event.description.like(search_term)
        )
    )
    
    if category:
        query = query.filter(models.Event.category == category)
    if sort_by == 'recent':
        query = query.order_by(models.Event.created_at.desc())
    else: # Default sort by event date
        query = query.order_by(models.Event.event_date.asc())
        
    return query.all()
def create_event(db: Session, event: schemas.EventCreate):
    """
    Creates a new event entry in the database.
    """
    # event.dict() is used here since the schema structure matches the model structure
    db_event = models.Event(**event.model_dump()) # Use model_dump() for Pydantic v2
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event