# Create new file: backend/routers/user.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import database, schemas, models
from auth.deps import get_current_user

router = APIRouter()

@router.get("/notifications", response_model=List[schemas.NotificationResponse])
def get_user_notifications(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == 'guest':
         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Guests do not have a notification history.")
         
    return db.query(models.NotificationHistory).filter(
        models.NotificationHistory.user_id == current_user.id
    ).order_by(models.NotificationHistory.sent_at.desc()).all()
@router.post("/notifications/clear-all", status_code=status.HTTP_204_NO_CONTENT)
def clear_notification_history(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Deletes all notification history for the currently logged-in user.
    """
    if current_user.role == 'guest':
        return # Guests have nothing to clear

    try:
        # Find all notifications for this user and delete them
        db.query(models.NotificationHistory).filter(
            models.NotificationHistory.user_id == current_user.id
        ).delete(synchronize_session=False) # More efficient for bulk deletes
        
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error clearing notification history: {e}")
        raise HTTPException(status_code=500, detail="Could not clear history.")
    
    return