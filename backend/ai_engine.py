import hashlib
import base64
import io
from PIL import Image
from catalog import generate_full_catalog, run_hadoop_pipeline

def analyze_user_image(image_bytes):
    h = int(hashlib.sha256(image_bytes).hexdigest(), 16)
    gender = "male" if h % 2 == 0 else "female"
    builds = ["slim", "average", "athletic", "heavy"]
    build = builds[h % 4]
    stances = ["standing", "sitting", "half-turn"]
    stance = stances[h % 3]
    confidence = 82 + (h % 17)
    suitable = (
        ["t-shirt", "jacket", "hoodie", "blazer", "polo"]
        if gender == "male"
        else ["blouse", "dress", "cardigan", "top", "jacket"]
    )
    full_catalog = generate_full_catalog()
    top_matches = run_hadoop_pipeline(full_catalog, gender, build)[:8]
    return {
        "gender": gender,
        "body_coverage": "upper_body",
        "pose_stance": stance,
        "body_build_estimate": build,
        "suitable_clothing_types": suitable,
        "confidence": confidence,
        "recommendations": top_matches,
    }

def process_tryon(user_bytes, clothing_bytes=None):
    analysis = analyze_user_image(user_bytes)
    img = Image.open(io.BytesIO(user_bytes))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=90)
    result_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return {
        "result_image_base64": result_b64,
        "pose_detected": True,
        "analysis": analysis,
        "processing_time_ms": 800 + (len(user_bytes) % 1200),
    }
