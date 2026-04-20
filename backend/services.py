import base64
import asyncio
from ml.engine import PoseEstimator, TryOnEngine, AIAnalyzer
from backend.models import TryOnRequest, TryOnResponse, BodyAnalysisResponse

# Initialize heavy objects once
pose_estimator = PoseEstimator()
try_on_engine = TryOnEngine()
ai_analyzer = AIAnalyzer()

async def perform_try_on(request: TryOnRequest) -> TryOnResponse:
    user_bytes = base64.b64decode(request.user_image_base64)
    clothing_bytes = base64.b64decode(request.clothing_image_base64)
    
    # 1. Start AI Analysis in the background (async)
    analysis_task = asyncio.create_task(ai_analyzer.analyze_body(user_bytes))
    
    # 2. Run CPU-bound Pose Estimation in a thread (non-blocking)
    keypoints = await asyncio.to_thread(pose_estimator.get_keypoints, user_bytes)
    
    if not keypoints:
        analysis = await analysis_task
        return TryOnResponse(
            result_image_base64=request.user_image_base64,
            pose_detected=False,
            analysis=analysis
        )
    
    # 3. Run CPU-bound Try-On Overlay in a thread (non-blocking)
    result_bytes = await asyncio.to_thread(
        try_on_engine.overlay_clothing, user_bytes, clothing_bytes, keypoints
    )
    
    # 4. Wait for AI analysis to finish
    analysis = await analysis_task
    
    return TryOnResponse(
        result_image_base64=base64.b64encode(result_bytes).decode("utf-8"),
        pose_detected=True,
        analysis=analysis
    )
