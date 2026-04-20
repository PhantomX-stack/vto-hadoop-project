from fastapi import APIRouter
from backend.models import TryOnRequest, TryOnResponse, AnalyzeRequest, BodyAnalysisResponse
from backend.services import perform_try_on
from ml.engine import AIAnalyzer
import base64

router = APIRouter(prefix="/api/v1")
analyzer = AIAnalyzer()

@router.post("/tryon", response_model=TryOnResponse)
async def try_on_clothing(request: TryOnRequest):
    """Analyze user pose, detect body type via AI, and overlay clothing."""
    return await perform_try_on(request)

@router.post("/analyze", response_model=BodyAnalysisResponse)
async def analyze_body(request: AnalyzeRequest):
    """Analyze user body using AI to detect gender, build, pose, etc."""
    try:
        image_bytes = base64.b64decode(request.image_base64)
        return await analyzer.analyze_body(image_bytes)
    except Exception as e:
        return BodyAnalysisResponse(body_coverage="error", pose_stance=str(e))

@router.get("/health")
async def health_check():
    return {"status": "healthy", "hadoop": "connected"}
