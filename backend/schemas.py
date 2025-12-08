from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Dict, List, Optional, Any
from datetime import date, datetime

# Pydantic v2 Base Config
class BaseConfig(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# --- Location ---
class Location(BaseConfig):
    id: int
    name: str
    latitude: float
    longitude: float

# --- User, Token, Event, FAQ schemas (Updated to v2) ---
class UserBase(BaseModel):
    name: str
    email: EmailStr  # Use EmailStr for email validation

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    role: str
    model_config = ConfigDict(from_attributes=True)
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User
# VVV ADD THIS CLASS VVV
class TokenData(BaseModel):
    email: Optional[str] = None
# ... other imports and schemas ...

# --- Event ---
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: date
    location_id: Optional[int] = None
    registration_link: Optional[str] = None # <-- New field
    category: Optional[str] = None
    
class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    location_name: Optional[str] = None
    is_registered: Optional[bool] = False # <-- Calculated field for frontend
    
    model_config = ConfigDict(from_attributes=True)

# --- Notification History Schema (New) ---
class NotificationResponse(BaseModel):
    id: int
    subject: str
    sent_at: datetime
    is_read: bool

    model_config = ConfigDict(from_attributes=True) # This is the schema that will be SENT to the user
class EventResponse(EventBase):
    id: int
    location_name: Optional[str] = None # <-- ADD THIS (for the venue name)
    
    model_config = ConfigDict(from_attributes=True)
# --- Navigation Schemas (NEW) ---
class RoutePath(BaseConfig):
    id: int
    name: str
    path: List[List[float]] # Will be [lat, lng]

class RouteRequest(BaseModel):
    start_lat: float
    start_lng: float
    destination_name: str

# Schema for the route calculation response
class RouteGeometry(BaseModel):
    geometry: Any # The GeoJSON LineString
    duration: float
    # The bounding box [min_lng, min_lat, max_lng, max_lat]
class SupportRequest(BaseModel):
    message: str

class SupportResponse(BaseModel):
    reply: str
    action: Optional[str] = None  # e.g., 'navigate', 'event_link'
    action_data: Optional[Dict[str, Any]] = None # e.g., { "destination": "Canteen" }
    
    model_config = ConfigDict(from_attributes=True)
class UserBaseInfo(BaseModel):
    name: str
    email: EmailStr
    model_config = ConfigDict(from_attributes=True)

class EventRegistrationDetails(BaseModel):
    user: UserBaseInfo  # Nested user info
    registered_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EventWithRegistrationsResponse(BaseModel):
    id: int
    title: str
    event_date: date
    registrations: List[EventRegistrationDetails]
    model_config = ConfigDict(from_attributes=True)
# --- FAQ ---
class FAQBase(BaseModel):
    question: str
    answer: str

class FAQCreate(FAQBase):
    # This is the class your agent was looking for.
    pass

class FAQ(FAQBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)
    # Custom Pydantic vError: Pydantic v1.10.8 and v2.5.3 are installed, but v1 is active.
# To use Pydantic v2, you might need to set the environment variable
# `PYDANTIC_VERSION` or `P
# YDANTIC_V2` to `2`.
#
# For more information, see
# https://docs.pydantic.dev/latest/migration/#explicit-v2-imports
@classmethod
def from_orm(cls, obj: Any) -> "RoutePath":
        # 'path_json' is the column name in the model
        path_data = obj.path_json
        return cls(id=obj.id, name=obj.name, path=path_data)
class UnansweredQuery(BaseModel):
    id: int
    question_text: str
    ask_count: int
    last_asked_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# VVV NEW SCHEMA FOR AI INTERACTION VVV
class SimpleRouteInfo(BaseModel):
    duration: float # Time in seconds
    distance: float
    