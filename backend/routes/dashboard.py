"""Dashboard analytics routes."""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends

from database.connection import get_db
from models.schemas import DashboardStats, DashboardCharts, ChartDataPoint, BarChartPoint
from utils.auth import get_current_user

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user["_id"]

    total = await db.predictions.count_documents({"user_id": user_id})
    fake_count = await db.predictions.count_documents({"user_id": user_id, "prediction": "fake"})
    real_count = await db.predictions.count_documents({"user_id": user_id, "prediction": "real"})
    verification_count = await db.verifications.count_documents({"user_id": user_id})

    return DashboardStats(
        total_analyses=total,
        fake_count=fake_count,
        real_count=real_count,
        verification_count=verification_count,
    )


@router.get("/charts", response_model=DashboardCharts)
async def get_dashboard_charts(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user["_id"]

    fake_count = await db.predictions.count_documents({"user_id": user_id, "prediction": "fake"})
    real_count = await db.predictions.count_documents({"user_id": user_id, "prediction": "real"})

    pie_chart = [
        ChartDataPoint(name="Fake", value=fake_count),
        ChartDataPoint(name="Real", value=real_count),
    ]

    bar_chart = []
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    now = datetime.now(timezone.utc)

    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_name = days[day_start.weekday()]

        fake = await db.predictions.count_documents({
            "user_id": user_id,
            "prediction": "fake",
            "created_at": {"$gte": day_start, "$lt": day_end},
        })
        real = await db.predictions.count_documents({
            "user_id": user_id,
            "prediction": "real",
            "created_at": {"$gte": day_start, "$lt": day_end},
        })

        bar_chart.append(BarChartPoint(day=day_name, fake=fake, real=real))

    return DashboardCharts(pie_chart=pie_chart, bar_chart=bar_chart)
