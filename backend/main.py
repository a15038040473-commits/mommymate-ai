import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from api.router import router

app = FastAPI(title="MommyMate AI Backend")

# NOTE: 允许来自 Vercel 前端的跨域请求
# 生产环境通过 ALLOWED_ORIGINS 环境变量配置，如 "https://mommymate.vercel.app"
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    # Render 会自动设置 PORT 环境变量
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

