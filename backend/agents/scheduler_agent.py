import datetime
from sqlalchemy.orm import Session
import database, models
from . import notification_agent

def check_for_todays_events():
    """
    This function is run by the scheduler every day.
    It checks for events happening today and triggers notifications.
    """
    print(f"Scheduler running at {datetime.datetime.now()}: Checking for today's events...")
    
    # We must create a new DB session because this runs in a separate thread
    db = database.SessionLocal()
    
    try:
        today = datetime.date.today()
        
        # Find all events where the event_date is today
        todays_events = db.query(models.Event).filter(models.Event.event_date == today).all()
        
        if todays_events:
            print(f"Found {len(todays_events)} events for today.")
            # Call the notification agent to send the emails
            notification_agent.notify_users_of_todays_events(db, todays_events)
        else:
            print("No events found for today.")
            
    finally:
        db.close()