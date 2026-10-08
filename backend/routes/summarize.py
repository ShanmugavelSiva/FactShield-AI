"""Summarization routes."""
from fastapi import APIRouter, Depends, Request

from middleware.rate_limit import limiter
from models.schemas import SummarizeRequest, SummarizeResponse
from services.summarizer_service import summarize_text
from utils.auth import get_current_user
from utils.logger import log_activity

router = APIRouter()


@router.post("", response_model=SummarizeResponse)
@limiter.limit("20/minute")
async def summarize(
    request: Request,
    body: SummarizeRequest,
    current_user: dict = Depends(get_current_user),
):
    result = summarize_text(body.text)

    await log_activity(str(current_user["_id"]), "summarize", f"Summarized {result['original_length']} chars")

    return SummarizeResponse(
        summary=result["summary"],
        original_length=result["original_length"],
        summary_length=result["summary_length"],
    )
