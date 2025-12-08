from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
# VVV 1. IMPORT THE NEW USER ROUTER VVV
from routers import navigation, events, faq, support, user as user_router
from routers import admin as admin_router
from auth import router as auth_router
from fastapi.staticfiles import StaticFiles

# Import the scheduler and the agent
from apscheduler.schedulers.background import BackgroundScheduler
from agents import scheduler_agent
import datetime

# Create all tables in the database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Intelligent Multi-Agent Campus Guide")

# Create and start the scheduler
scheduler = BackgroundScheduler(timezone="Asia/Kolkata") # Use your local timezone
scheduler.add_job(
    scheduler_agent.check_for_todays_events,
    'cron', 
    hour=8, 
    minute=0  # Run every day at 8:00 AM
)
scheduler.start()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(auth_router.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(navigation.router, prefix="/api/navigation", tags=["Navigation"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(faq.router, prefix="/api/faq", tags=["FAQ"])
app.include_router(support.router, prefix="/api/support", tags=["Support"])
app.include_router(admin_router.router, prefix="/api/admin", tags=["Admin"])

# VVV 2. ADD THE NEW USER ROUTER VVV
app.include_router(user_router.router, prefix="/api/user", tags=["User"])
# ^^^ END OF CHANGE ^^^

@app.get("/api")
def read_root():
    return {"message": "Welcome to the Campus Guide API"}

# Add a shutdown event to stop the scheduler gracefully
@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()