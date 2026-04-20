import hashlib

MALE_TYPES = ["T-Shirt", "Jacket", "Hoodie", "Blazer", "Polo", "Shirt", "Vest", "Coat", "Sweater", "Cardigan", "Windbreaker", "Denim Jacket", "Leather Jacket", "Bomber", "Parka", "Flannel", "Henley", "Tank Top", "Puffer Jacket", "Sport Coat"]
FEMALE_TYPES = ["Blouse", "Dress", "Cardigan", "Top", "Jacket", "Skirt", "Jumpsuit", "Tunic", "Crop Top", "Wrap Top", "Blazer", "Coat", "Sweater", "Hoodie", "Peplum", "Kimono", "Cami", "Trench Coat", "Maxi Dress", "Mini Dress"]
COLORS = [
    {"name": "Crimson", "hex": "#DC2626"}, {"name": "Ocean Blue", "hex": "#2563EB"},
    {"name": "Forest", "hex": "#16A34A"}, {"name": "Royal Purple", "hex": "#7C3AED"},
    {"name": "Sunset", "hex": "#EA580C"}, {"name": "Rose", "hex": "#E11D48"},
    {"name": "Teal", "hex": "#0D9488"}, {"name": "Amber", "hex": "#D97706"},
    {"name": "Indigo", "hex": "#4F46E5"}, {"name": "Emerald", "hex": "#059669"},
    {"name": "Slate", "hex": "#475569"}, {"name": "Pink", "hex": "#EC4899"},
    {"name": "Cyan", "hex": "#06B6D4"}, {"name": "Lime", "hex": "#65A30D"},
    {"name": "Fuchsia", "hex": "#C026D3"}, {"name": "Navy", "hex": "#1E3A5F"},
    {"name": "Coral", "hex": "#F87171"}, {"name": "Mint", "hex": "#34D399"},
    {"name": "Lavender", "hex": "#A78BFA"}, {"name": "Charcoal", "hex": "#374151"},
]
BUILDS = ["slim", "average", "athletic", "heavy", "petite", "tall"]
PRICES = ["$19.99", "$24.99", "$29.99", "$34.99", "$39.99", "$44.99", "$49.99", "$54.99", "$59.99", "$64.99", "$69.99", "$74.99", "$79.99", "$89.99", "$99.99"]

def generate_full_catalog():
    items = []
    item_id = 0
    for m_type in MALE_TYPES:
        for color in COLORS:
            for k in range(3):
                item_id += 1
                seed = hashlib.md5(f"m-{item_id}".encode()).hexdigest()
                score = 50 + (int(seed[:4], 16) % 50)
                rating = round(3 + (int(seed[4:6], 16) % 20) / 10, 1)
                items.append({
                    "id": f"m-{item_id}",
                    "name": f"{m_type} - {color['name']}",
                    "type": m_type.lower(),
                    "color": color["name"],
                    "colorHex": color["hex"],
                    "match_score": score,
                    "reason": f"Perfect for {BUILDS[int(seed[6:8], 16) % len(BUILDS)]} build",
                    "image_base64": "",
                    "category": m_type.lower(),
                    "gender": "male",
                    "price": PRICES[int(seed[8:10], 16) % len(PRICES)],
                    "rating": rating,
                })
    item_id = 0
    for f_type in FEMALE_TYPES:
        for color in COLORS:
            for k in range(3):
                item_id += 1
                seed = hashlib.md5(f"f-{item_id}".encode()).hexdigest()
                score = 50 + (int(seed[:4], 16) % 50)
                rating = round(3 + (int(seed[4:6], 16) % 20) / 10, 1)
                items.append({
                    "id": f"f-{item_id}",
                    "name": f"{f_type} - {color['name']}",
                    "type": f_type.lower(),
                    "color": color["name"],
                    "colorHex": color["hex"],
                    "match_score": score,
                    "reason": f"Great for {BUILDS[int(seed[6:8], 16) % len(BUILDS)]} build",
                    "image_base64": "",
                    "category": f_type.lower(),
                    "gender": "female",
                    "price": PRICES[int(seed[8:10], 16) % len(PRICES)],
                    "rating": rating,
                })
    return items

def hadoop_map(items, target_gender):
    mapped = []
    for item in items:
        if item["gender"] == target_gender:
            mapped.append(item)
    return mapped

def hadoop_reduce(mapped_items, target_build):
    build_keywords = {
        "slim": ["fitted", "slim", "tailored"],
        "average": ["regular", "classic", "standard"],
        "athletic": ["athletic", "performance", "flex"],
        "heavy": ["relaxed", "loose", "comfort"],
        "petite": ["petite", "cropped", "short"],
        "tall": ["tall", "long", "extended"],
    }
    keywords = build_keywords.get(target_build, [])
    for item in mapped_items:
        bonus = 0
        for kw in keywords:
            if kw in item["reason"].lower():
                bonus += 5
        item["match_score"] = min(99, item["match_score"] + bonus)
    reduced = sorted(mapped_items, key=lambda x: x["match_score"], reverse=True)
    return reduced

def run_hadoop_pipeline(catalog, gender, build):
    mapped = hadoop_map(catalog, gender)
    reduced = hadoop_reduce(mapped, build)
    return reduced
