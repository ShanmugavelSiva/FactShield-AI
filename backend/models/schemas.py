"""Pydantic models for request/response validation."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


# ── Auth ──

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str = "user"
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Prediction ──

class PredictRequest(BaseModel):
    news_text: str = Field(..., min_length=10, max_length=50000)


class PredictUrlRequest(BaseModel):
    url: str = Field(..., min_length=5)


class KeywordInfluence(BaseModel):
    word: str
    influence: float


class PredictResponse(BaseModel):
    prediction: str
    confidence: float
    keywords: List[KeywordInfluence] = []
    explanation: str = ""
    id: Optional[str] = None


# ── Verification ──

class VerifyRequest(BaseModel):
    claim: str = Field(..., min_length=5, max_length=5000)


class VerifyResponse(BaseModel):
    status: str
    verification_result: str
    sources: List[str] = []
    id: Optional[str] = None


# ── Summarization ──

class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=50, max_length=50000)


class SummarizeResponse(BaseModel):
    summary: str
    original_length: int
    summary_length: int


# ── Dashboard ──

class DashboardStats(BaseModel):
    total_analyses: int = 0
    fake_count: int = 0
    real_count: int = 0
    verification_count: int = 0


class ChartDataPoint(BaseModel):
    name: str
    value: int


class BarChartPoint(BaseModel):
    day: str
    fake: int
    real: int


class DashboardCharts(BaseModel):
    pie_chart: List[ChartDataPoint] = []
    bar_chart: List[BarChartPoint] = []


# ── History ──

class HistoryItem(BaseModel):
    id: str
    news_text: str
    prediction: str
    confidence: float
    keywords: List[KeywordInfluence] = []
    explanation: str = ""
    created_at: datetime


class HistoryListResponse(BaseModel):
    items: List[HistoryItem]
    total: int


# ── Admin ──

class SystemStats(BaseModel):
    total_users: int = 0
    total_predictions: int = 0
    total_verifications: int = 0
    active_today: int = 0


class ActivityLog(BaseModel):
    action: str
    details: str
    created_at: datetime
