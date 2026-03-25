import json
import os
from schema.content import DailyContent, WeeklyPlan
from typing import Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DAILY_FILE = os.path.join(DATA_DIR, "daily_content.json")
WEEKLY_FILE = os.path.join(DATA_DIR, "weekly_plan.json")

def _load_data(filepath: str) -> dict:
    if not os.path.exists(filepath):
        return {}
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def _save_data(filepath: str, data: dict):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_daily_content(day_id: str) -> Optional[DailyContent]:
    data = _load_data(DAILY_FILE)
    if day_id in data:
        return DailyContent(**data[day_id])
    return None

def save_daily_content(day_id: str, content: DailyContent):
    data = _load_data(DAILY_FILE)
    data[day_id] = content.model_dump()
    _save_data(DAILY_FILE, data)

def get_weekly_plan(month: int, week: int) -> Optional[WeeklyPlan]:
    data = _load_data(WEEKLY_FILE)
    key = f"{month}-{week}"
    if key in data:
        return WeeklyPlan(**data[key])
    return None

def save_weekly_plan(month: int, week: int, plan: WeeklyPlan):
    data = _load_data(WEEKLY_FILE)
    key = f"{month}-{week}"
    data[key] = plan.model_dump()
    _save_data(WEEKLY_FILE, data)
