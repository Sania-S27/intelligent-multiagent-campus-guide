import re
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from sqlalchemy.dialects.mysql import insert
import models

# Import tools
from . import weather_agent
from . import wikipedia_agent
from . import event_agent 
from . import navigation_agent

CAMPUS_LAT = 14.444
CAMPUS_LNG = 75.903

def format_time_and_distance(seconds, meters):
    minutes = round(seconds / 60)
    km = round(meters / 1000, 1)
    return f"{km} km, {minutes} min walk"

def log_unanswered_query(db: Session, question: str):
    try:
        stmt = insert(models.UnansweredQuery).values(
            question_text=question, ask_count=1
        ).on_duplicate_key_update(
            ask_count=models.UnansweredQuery.ask_count + 1,
            last_asked_at=func.now()
        )
        db.execute(stmt)
        db.commit()
    except Exception:
        db.rollback()

def extract_locations(db: Session, message: str) -> list:
    """Extract location names from message by matching against database locations."""
    locations = db.query(models.Location).all()
    found = []
    msg_lower = message.lower()
    
    for loc in locations:
        if loc.name.lower() in msg_lower:
            found.append(loc.name)
    
    return found

# --- MAIN AGENT FUNCTION ---
# Returns a Dict: { "text": str, "action": str|None, "data": dict|None }
# ... imports ...

# ... (format_time_and_distance, log_unanswered_query, extract_locations are fine) ...

# --- MAIN AGENT FUNCTION ---
def get_support_response(db: Session, message: str) -> dict:
    msg_lower = message.lower()
    
    # --- 1. INTENT: NAVIGATION ---
    # Check for navigation keywords
    if any(x in msg_lower for x in [" to ", "from ", "distance", "far", "walk", "route", "directions", "way", "go to"]):
        
        # Use the extract_locations helper which handles partial matches
        found_locations = extract_locations(db, message)

        if len(found_locations) >= 2:
            origin = found_locations[0]
            destination = found_locations[1]
            
            # Ensure we don't try to route from A to A
            if origin == destination and len(found_locations) > 2:
                destination = found_locations[2]
            
            if origin != destination:
                print(f"Agent: Navigation Query ({origin} -> {destination})")
                route_info = navigation_agent.get_simple_route_info(db, origin, destination)
                
                if route_info:
                    time_dist = format_time_and_distance(route_info['duration'], route_info['distance'])
                    return {
                        "text": f"The route from {origin} to {destination} is {time_dist}. Would you like to see it on the map?",
                        "action": "navigate",
                        "data": { "destination": destination }
                    }
                else:
                     # Fallback if route calc fails (e.g. Mapbox error)
                     return {
                        "text": f"I found '{origin}' and '{destination}', but I couldn't calculate the path. Please try selecting them on the Map tab.",
                        "action": "navigate",
                        "data": { "destination": destination } # Still try to navigate to destination
                    }
        
        elif len(found_locations) == 1:
             return {
                "text": f"I found '{found_locations[0]}', but I need a second location (Origin -> Destination). Try 'Main Gate to {found_locations[0]}'.",
                "action": None
            }

    # ... (Rest of the function: Events, Weather, Fallback remains the same)
    # --- 2. INTENT: EVENTS ---
    if "event" in msg_lower or "fest" in msg_lower:
        # VVV CALL THE CORRECT FUNCTION VVV
        events = event_agent.get_all_events(db, category=None, sort_by='date')
        if events:
            next_event = events[0]
            return {
                "text": f"The next event is '{next_event.title}' on {next_event.event_date}. Venue: {next_event.location.name if next_event.location else 'Online'}.",
                "action": "view_events",
                "data": {}
            }
        return {"text": "No upcoming events found.", "action": None}

    # --- 3. INTENT: WEATHER ---
    if re.search(r'\b(weather|temperature|hot|cold|rain)\b', msg_lower):
        text = weather_agent.get_current_weather(CAMPUS_LAT, CAMPUS_LNG)
        return {"text": text, "action": None}

    # --- 4. FALLBACK ---
    # Check DB FAQs
    faq = db.query(models.FAQ).filter(models.FAQ.question.like(f"%{message}%")).first()
    if faq:
         return {"text": faq.answer, "action": None}

    log_unanswered_query(db, message)
    return {
        "text": "I'm sorry, I don't have that info. I've logged your question for the admin.",
        "action": None
    }