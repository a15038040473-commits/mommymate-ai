from fastapi import APIRouter
from schema.content import DailyContent, WeeklyPlan
from repository.json_repo import get_daily_content, save_daily_content, get_weekly_plan, save_weekly_plan
from service.deepseek_service import generate_daily_content
from typing import Optional

router = APIRouter(prefix="/api")

@router.get("/schedule/weekly")
def read_weekly_schedule(month: int, week: int):
    """
    获取某月某周的学习安排
    """
    plan = get_weekly_plan(month, week)
    if not plan:
        from service.deepseek_service import generate_weekly_plan
        plan = generate_weekly_plan(month, week)
        save_weekly_plan(month, week, plan)
    return plan

@router.get("/schedule/daily/{day_id}")
def read_daily_schedule(day_id: str):
    """
    获取某日学习内容
    """
    content = get_daily_content(day_id)
    if not content:
        # Generate automatically if not exists
        content = generate_daily_content(day_id)
        save_daily_content(day_id, content)
    return content

@router.post("/generate/daily")
def post_generate_daily(day_id: str):
    """
    强制生成每日学习内容
    """
    content = generate_daily_content(day_id)
    save_daily_content(day_id, content)
    return content
