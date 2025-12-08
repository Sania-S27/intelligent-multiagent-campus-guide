from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas, database
from agents import support_agent 

router = APIRouter()
# ... imports ...
@router.post("/chat", response_model=schemas.SupportResponse)
def chat_with_support_agent(
    request: schemas.SupportRequest,
    db: Session = Depends(database.get_db)
):
    # The agent now returns a DICT
    response_dict = support_agent.get_support_response(db, request.message)
    
    # Map dictionary to schema
    return schemas.SupportResponse(
        reply=response_dict["text"],
        action=response_dict.get("action"),
        action_data=response_dict.get("data")
    )