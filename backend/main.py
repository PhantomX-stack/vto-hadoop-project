from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import time
import os

app = FastAPI(title="VTryOn API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImagePayload(BaseModel):
    user_image_base64: str

class TryOnPayload(BaseModel):
    user_image_base64: str
    clothing_image_base64: str = ""

@app.get("/")
async def root():
    return {"status": "ok", "service": "VTryOn API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0", "models_loaded": True}

@app.get("/api/v1/health")
async def api_health():
    return {"status": "ok", "version": "1.0.0", "models_loaded": True}

@app.post("/api/v1/analyze")
async def analyze_body(payload: ImagePayload):
    start_time = time.time()
    try:
        image_bytes = base64.b64decode(payload.user_image_base64)
        from ai_engine import analyze_user_image
        analysis = analyze_user_image(image_bytes)
        analysis["processing_time_ms"] = int((time.time() - start_time) * 1000)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/tryon")
async def try_on(payload: TryOnPayload):
    start_time = time.time()
    try:
        user_bytes = base64.b64decode(payload.user_image_base64)
        from ai_engine import process_tryon
        result = process_tryon(user_bytes)
        result["processing_time_ms"] = int((time.time() - start_time) * 1000)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/recommendations")
async def get_recommendations(payload: ImagePayload):
    try:
        image_bytes = base64.b64decode(payload.user_image_base64)
        from ai_engine import analyze_user_image
        analysis = analyze_user_image(image_bytes)
        return {"recommendations": analysis.get("recommendations", [])}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("  VTryOn Backend Starting...")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000)
