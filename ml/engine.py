import base64
import cv2
import numpy as np
import mediapipe as mp
import anthropic
import json
import os
import urllib.request
from backend.config import settings
from backend.models import BodyAnalysisResponse

# Modern MediaPipe Tasks API
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
MODEL_PATH = "ml/pose_landmarker_lite.task"

class PoseEstimator:
    def __init__(self):
        if not os.path.exists(MODEL_PATH):
            print("⬇️ Downloading MediaPipe Pose model...")
            urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
            print("✅ Model downloaded.")
        
        base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            output_segmentation_masks=False
        )
        self.detector = vision.PoseLandmarker.create_from_options(options)

    def get_keypoints(self, image_bytes: bytes) -> dict:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid image bytes")
        
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        
        results = self.detector.detect(mp_image)
        
        if not results.pose_landmarks or len(results.pose_landmarks) == 0:
            return {}
        
        lm = results.pose_landmarks[0]
        
        # Modern landmark indices: 11=left shoulder, 12=right shoulder, 23=left hip, 24=right hip
        return {
            "left_shoulder": [lm[11].x, lm[11].y],
            "right_shoulder": [lm[12].x, lm[12].y],
            "left_hip": [lm[23].x, lm[23].y],
            "right_hip": [lm[24].x, lm[24].y],
        }

class TryOnEngine:
    def overlay_clothing(self, user_img_bytes: bytes, clothing_img_bytes: bytes, keypoints: dict) -> bytes:
        user_img = cv2.imdecode(np.frombuffer(user_img_bytes, np.uint8), cv2.IMREAD_COLOR)
        cloth_img = cv2.imdecode(np.frombuffer(clothing_img_bytes, np.uint8), cv2.IMREAD_COLOR)
        
        if user_img is None or cloth_img is None:
            raise ValueError("Invalid image data")

        h, w, _ = user_img.shape
        
        ls = keypoints["left_shoulder"]
        rs = keypoints["right_shoulder"]
        lh = keypoints["left_hip"]
        rh = keypoints["right_hip"]
        
        shoulder_width = int(abs(ls[0] - rs[0]) * w * 1.2)
        center_x = int((ls[0] + rs[0]) / 2 * w)
        top_y = int((ls[1] + rs[1]) / 2 * h)
        bottom_y = int((lh[1] + rh[1]) / 2 * h)
        box_height = int((bottom_y - top_y) * 1.1)
        
        cloth_resized = cv2.resize(cloth_img, (shoulder_width, box_height), interpolation=cv2.INTER_AREA)
        
        x_offset = center_x - (shoulder_width // 2)
        y_offset = top_y
        
        y1, y2 = max(0, y_offset), min(h, y_offset + box_height)
        x1, x2 = max(0, x_offset), min(w, x_offset + shoulder_width)
        
        cloth_y1 = y1 - y_offset
        cloth_y2 = cloth_y1 + (y2 - y1)
        cloth_x1 = x1 - x_offset
        cloth_x2 = cloth_x1 + (x2 - x1)
        
        alpha = 0.75
        user_img[y1:y2, x1:x2] = cv2.addWeighted(
            cloth_resized[cloth_y1:cloth_y2, cloth_x1:cloth_x2], 
            alpha, 
            user_img[y1:y2, x1:x2], 
            1 - alpha, 
            0
        )
        
        _, buffer = cv2.imencode('.jpg', user_img)
        return buffer.tobytes()

class AIAnalyzer:
    def __init__(self):
        self.client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def analyze_body(self, image_bytes: bytes) -> BodyAnalysisResponse:
        if not settings.ANTHROPIC_API_KEY or settings.ANTHROPIC_API_KEY == "your_api_key_here":
            return BodyAnalysisResponse()
        
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        try:
            message = await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1024,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": b64,
                                },
                            },
                            {
                                "type": "text",
                                "text": "Analyze this person for a virtual clothing try-on. Return ONLY valid JSON: {\"gender\": \"\", \"body_coverage\": \"\", \"pose_stance\": \"\", \"body_build_estimate\": \"\", \"suitable_clothing_types\": []}. Be objective. Use 'unknown' if unsure."
                            }
                        ],
                    }
                ],
            )
            json_str = message.content[0].text.strip()
            if json_str.startswith("```json"): json_str = json_str[7:]
            if json_str.endswith("```"): json_str = json_str[:-3]
            
            data = json.loads(json_str)
            return BodyAnalysisResponse(**data)
        except Exception as e:
            print(f"AI Analysis failed: {e}")
            return BodyAnalysisResponse()
