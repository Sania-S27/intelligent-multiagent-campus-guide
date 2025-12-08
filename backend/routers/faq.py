from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
import database, schemas, models
from agents import faq_agent
from auth.deps import get_current_admin_user

router = APIRouter()

@router.get("/", response_model=List[schemas.FAQ])
def read_faqs(search: str = None, db: Session = Depends(database.get_db)):
    if search:
        return faq_agent.search_faqs(db, query=search)
    return faq_agent.get_all_faqs(db)

@router.post("/", response_model=schemas.FAQ, status_code=status.HTTP_201_CREATED)
def create_new_faq(
    faq: schemas.FAQCreate, 
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(get_current_admin_user) # Protect this route
):
    return faq_agent.create_faq(db=db, faq=faq)