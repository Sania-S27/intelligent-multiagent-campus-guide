import os
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import models, database

# --- Brevo Configuration ---
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
if BREVO_API_KEY:
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = BREVO_API_KEY
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
else:
    api_instance = None

# Use a verified sender email
SENDER_EMAIL = "sania2721s@gmail.com" 
SENDER_NAME = "Campus Guide Admin"
sender = {"email": SENDER_EMAIL, "name": SENDER_NAME}

def send_notification_email(user_email, user_name, subject, html_content):
    """Sends the actual email via Brevo."""
    if not api_instance:
        print("Brevo API key missing, skipping email.")
        return

    to = [{"email": user_email, "name": user_name}]
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=to,
        sender=sender,
        subject=subject,
        html_content=html_content
    )
    try:
        api_instance.send_transac_email(send_smtp_email)
        print(f"Email sent to {user_email}")
    except ApiException as e:
        print(f"Error sending email: {e}")

def notify_all_users_of_new_event(event_id: int):
    """
    Background Task:
    1. Fetches the event and all users.
    2. Sends emails.
    3. Logs the notification to the database history.
    """
    # Create a new DB session for this background task
    db = database.SessionLocal()
    
    try:
        print(f"Starting notification task for Event ID: {event_id}")
        
        # 1. Fetch the event
        event = db.query(models.Event).filter(models.Event.id == event_id).first()
        if not event:
            print("Event not found in background task.")
            return

        # 2. Fetch users who want notifications
        users_to_notify = db.query(models.User).filter(
            models.User.receives_notifications == True,
            models.User.role == 'user' # Optional: Don't spam other admins
        ).all()
        
        subject = f"New Event: {event.title}"
        
        # 3. Loop through users
        for user in users_to_notify:
            # A. Log to Database (This makes the In-App Banner appear!)
            new_history = models.NotificationHistory(
                user_id=user.id,
                subject=subject,
                is_read=False
            )
            db.add(new_history)
            
            # B. Send Email
            html_content = f"""
            <p>Hi {user.name},</p>
            <p>A new event <strong>{event.title}</strong> has been added.</p>
            <p>Date: {event.event_date}</p>
            <p>Check the app for details!</p>
            """
            send_notification_email(user.email, user.name, subject, html_content)
        
        # Commit all database logs at once
        db.commit()
        print(f"Notifications sent and logged for {len(users_to_notify)} users.")

    except Exception as e:
        print(f"Error in notification task: {e}")
        db.rollback()
    finally:
        db.close()