from pydantic import BaseModel
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    image_base64: str

class BodyAnalysisResponse(BaseModel):
    gender: str = "unknown"
    body_coverage: str = "unknown"
    pose_stance: str = "unknown"
    body_build_estimate: str = "unknown"
    suitable_clothing_types: List[str] = []

class TryOnRequest(BaseModel):
    user_image_base64: str
    clothing_image_base64: str

class TryOnResponse(BaseModel):
    result_image_base64: str
    pose_detected: bool
    analysis: Optional[BodyAnalysisResponse] = None
