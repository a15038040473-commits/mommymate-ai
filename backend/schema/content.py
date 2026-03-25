from pydantic import BaseModel
from typing import List, Optional

class DailyContent(BaseModel):
    id: str
    warmup_audio_keyword: str
    warmup_title: str
    core_task_text: str
    core_sentences: List[str]
    review_text: str

class WeeklyPlan(BaseModel):
    month: int
    week: int
    focus: str
    resources: List[str]
    tips: List[str]
    indicators: List[str]
