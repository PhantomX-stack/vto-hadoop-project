from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import router
from backend.config import settings

app = FastAPI(
    title="Virtual Clothing Try-On API",
    description="Real-Time Virtual Clothing Try-On using Hadoop Big Data Processing",
    version="1.0.0"
)

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.on_event("startup")
async def startup_event():
    key_loaded = bool(settings.ANTHROPIC_API_KEY and settings.ANTHROPIC_API_KEY != "your_api_key_here")
    print(f"🚀 Server starting... Anthropic API Key Loaded: {key_loaded}")
