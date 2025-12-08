from sqlalchemy.orm import Session
import models, schemas
from sqlalchemy import or_

def get_all_faqs(db: Session):
    return db.query(models.FAQ).all()

def search_faqs(db: Session, query: str):
    search_term = f"%{query}%"
    return db.query(models.FAQ).filter(
        or_(
            models.FAQ.question.like(search_term),
            models.FAQ.answer.like(search_term)
        )
    ).all()

def create_faq(db: Session, faq: schemas.FAQCreate):
    db_faq = models.FAQ(**faq.dict())
    db.add(db_faq)
    db.commit()
    db.refresh(db_faq)
    return db_faq