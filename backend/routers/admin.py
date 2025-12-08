from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
import database, schemas, models
from auth.deps import get_current_admin_user

router = APIRouter()

@router.get(
    "/unanswered-questions", 
    response_model=List[schemas.UnansweredQuery], 
    dependencies=[Depends(get_current_admin_user)]
)
def get_top_unanswered_questions(db: Session = Depends(database.get_db)):
    """
    Gets the top 20 most frequently asked questions
    that the Support chatbot could not answer.
    """
    return db.query(models.UnansweredQuery).order_by(
        models.UnansweredQuery.ask_count.desc()
    ).limit(20).all()
@router.get(
    "/event-registrations",
    response_model=List[schemas.EventWithRegistrationsResponse],
    dependencies=[Depends(get_current_admin_user)]
)
def get_event_registrations(db: Session = Depends(database.get_db)):
    """
    Gets all events that have at least one registration,
    and includes the list of users registered for each.
    """
    events = db.query(models.Event).options(
        # This is a double-join: 
        # 1. Join Event with EventRegistration
        # 2. Then join EventRegistration with User
        joinedload(models.Event.registrations).joinedload(models.EventRegistration.user)
    ).filter(
        models.Event.registrations.any() # Only get events with 1+ registrations
    ).order_by(models.Event.event_date.desc()).all()
    
    return events
# VVV ADD THIS NEW ENDPOINT VVV

@router.post("/notifications/clear-all-history", status_code=status.HTTP_204_NO_CONTENT)
def admin_clear_all_notification_history(
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(get_current_admin_user)
):
    """
    (Admin Only) Deletes all notification history for all users.
    """
    try:
        num_rows_deleted = db.query(models.NotificationHistory).delete()
        db.commit()
        print(f"Admin {admin.email} deleted {num_rows_deleted} notification records.")
    except Exception as e:
        db.rollback()
        print(f"Error clearing all notification history: {e}")
        raise HTTPException(status_code=500, detail="Could not clear history.")
    
    return