from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import ChatRequest, ChatResponse
from ..services.ai_agent import process_message

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    result = process_message(request.message, db)
    return ChatResponse(
        message=result["message"],
        intent=result["intent"],
        data=result.get("data"),
    )
