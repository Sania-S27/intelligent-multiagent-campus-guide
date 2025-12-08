from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import database, schemas, models
from agents import event_agent, notification_agent
from auth.deps import get_current_user, get_current_admin_user

router = APIRouter()

# ^^^ END OF HELPER ^^^
# 1. Update GET /events to determine registration status for the user
@router.get("/", response_model=List[schemas.EventResponse])
def read_events(
    search: str = None, 
    category: Optional[str] = None,
    sort_by: Optional[str] = None, # 'date' or 'recent'
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only logged-in users or registered guests can access (protected by get_current_user)
    
    if search:
        events_db = event_agent.search_events(db, query_str=search, category=category, sort_by=sort_by)
    else:
        events_db = event_agent.get_all_events(db, category=category, sort_by=sort_by)     # Pass user ID to the helper
    current_user_id = current_user.id if current_user.role != 'guest' else None
    
    return [format_event_response(event, current_user_id) for event in events_db]
@router.post("/", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED) # <-- CHANGED response_model
def create_new_event(
    event: schemas.EventCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(get_current_admin_user)
):
    db_event = event_agent.create_event(db=db, event=event)
    
    # Eager load the location for the response and notification
    db.refresh(db_event, ['location']) 
    
    background_tasks.add_task(
        notification_agent.notify_all_users_of_new_event,
        db_event.id 
    )
    
    return format_event_response(db_event, admin.id) # <-- Use helper here
# 2. Add the registration endpoint
@router.post("/register/{event_id}", status_code=status.HTTP_201_CREATED)
def register_for_event(
    event_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == 'guest':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Guests cannot register for events. Please log in.")

    # 1. Check if user is already registered
    existing_reg = db.query(models.EventRegistration).filter(
        models.EventRegistration.user_id == current_user.id,
        models.EventRegistration.event_id == event_id
    ).first()
    
    if existing_reg:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You are already registered for this event.")
        
    # 2. Check if event exists
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    # 3. Create the registration
    new_reg = models.EventRegistration(user_id=current_user.id, event_id=event_id)
    db.add(new_reg)
    db.commit()
    
    # Send a registration confirmation email (Optional: could be added to notification_agent)
    
def format_event_response(event: models.Event, current_user_id: Optional[int]) -> schemas.EventResponse:
    is_registered = False
    if current_user_id:
        # Check if a registration exists for this user and this event
        is_registered = any(reg.user_id == current_user_id for reg in event.registrations)

    return schemas.EventResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        event_date=event.event_date,
        location_id=event.location_id,
        registration_link=event.registration_link,
        location_name=event.location.name if event.location else None,
        is_registered=is_registered
    )
    return {"message": "Registration successful"}