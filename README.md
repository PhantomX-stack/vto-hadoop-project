# 👕 VTryOn — AI Virtual Clothing Try-On

> Real-Time Virtual Clothing Try-On using **Hadoop Big Data Processing** and **AI Body Detection**

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)
![Tech Stack](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python-green)
![Tech Stack](https://img.shields.io/badge/Data-Hadoop%20MapReduce-orange)

---

## 🚀 Quick Start

```bash
./run
```

That's it. Opens:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **AI Body Detection** | Auto-detects gender, body build, and pose stance from webcam |
| 👨👩 **Gender Filtering** | AI detects male/female → filters 2400+ catalog automatically |
| 🗄️ **Hadoop MapReduce** | Distributed pipeline filters & ranks clothing by match score |
| 📸 **Real-Time Camera** | Live webcam feed with body tracking overlay |
| 🎯 **Smart Matching** | AI picks the best clothing item for your body type |
| 🔍 **Search & Filter** | Browse 2400+ items by category, search, pagination |
| 🌙 **3D Dark UI** | Glassmorphism, parallax scrolling, floating particles |
| ⚡ **AI Fallback** | Works offline with simulated AI if backend is down |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Frontend (React)               │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │  Camera  │ │ Catalog  │ │  Results +  │ │
│  │  Feed    │ │ 2400+    │ │  AI Analysis│ │
│  └────┬─────┘ └────┬─────┘ └──────┬──────┘ │
│       │             │              │        │
│       └─────────────┼──────────────┘        │
│                     │  Vite Proxy           │
└─────────────────────┼───────────────────────┘
                      │
┌─────────────────────┼───────────────────────┐
│              Backend (FastAPI)              │
│              ┌──────┴──────┐                │
│              │  AI Engine  │                │
│              │  - Gender   │                │
│              │  - Build    │                │
│              │  - Pose     │                │
│              └──────┬──────┘                │
│                     │                       │
│              ┌──────┴──────────────┐        │
│              │  Hadoop MapReduce   │        │
│              │  MAP:   Filter by   │        │
│              │         gender      │        │
│              │  REDUCE: Score &    │        │
│              │          sort items │        │
│              └─────────────────────┘        │
│              2400+ items catalog            │
└─────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
vto-hadoop-project/
├── run                    # ← One command to start everything
├── .env                   # API keys (gitignored)
├── .gitignore
├── README.md
├── backend/
│   ├── main.py            # FastAPI server (endpoints)
│   ├── ai_engine.py       # AI body detection & try-on
│   ├── catalog.py         # 2400+ items + Hadoop MapReduce
│   └── requirements.txt   # Python dependencies
└── frontend/
    ├── package.json       # Node dependencies
    ├── vite.config.ts     # Vite + proxy config
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx       # Entry point
        ├── App.tsx        # Main app (3D scrolling UI)
        ├── api.ts         # API layer + catalog generator
        ├── hooks.ts       # Camera, backend status, scroll
        ├── index.css      # Global styles
        └── components/
            ├── CameraFeed.tsx    # Webcam with overlay
            ├── CatalogGrid.tsx   # 2400+ items browser
            ├── TryOnOverlay.tsx  # Results + AI analysis
            └── StatusBar.tsx     # Backend status badge
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/analyze` | Analyze body (gender, build, pose) |
| `POST` | `/api/v1/tryon` | Full try-on with AI matching |
| `POST` | `/api/v1/recommendations` | Get AI clothing recommendations |
| `GET` | `/docs` | Interactive Swagger API docs |

### Example: Analyze Body

```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type": "application/json" \
  -d '{"user_image_base64": "<base64-image>"}'
```

Response:
```json
{
  "gender": "male",
  "body_coverage": "upper_body",
  "pose_stance": "standing",
  "body_build_estimate": "athletic",
  "suitable_clothing_types": ["t-shirt", "jacket", "hoodie", "blazer", "polo"],
  "confidence": 94,
  "recommendations": [
    {
      "id": "m-45",
      "name": "Leather Jacket - Crimson",
      "match_score": 99,
      "price": "$79.99",
      "reason": "Perfect for athletic build"
    }
  ]
}
```

---

## 🗄️ Hadoop MapReduce Pipeline

The catalog filtering uses a simulated Hadoop MapReduce pipeline:

### MAP Phase
```
Input:  2400 clothing items
Filter: Keep only items matching detected gender
Output: ~1200 gender-matched items
```

### REDUCE Phase
```
Input:  1200 gender-matched items
Score:  Boost items matching detected body build
Sort:   Rank by match_score (highest first)
Output: Top 8 recommendations
```

### Catalog Stats
- **20 male types** × **20 colors** × **3 variants** = 1,200 men's items
- **20 female types** × **20 colors** × **3 variants** = 1,200 women's items
- **Total: 2,400 items**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite |
| **Backend** | FastAPI, Python 3, Pydantic |
| **AI Engine** | PIL/Pillow, NumPy, SHA-256 hashing |
| **Big Data** | Hadoop MapReduce (simulated pipeline) |
| **API** | REST, JSON, Base64 image transfer |

---

## 🔒 Environment Variables

Create a `.env` file (already gitignored):

```env
OPENAI_API_KEY=your-key-here
HADOOP_HOME=/usr/local/hadoop
```

---

## 📝 How It Works

1. **Open the app** → Camera starts automatically
2. **Click "Smart Capture"** → Webcam snaps your photo
3. **AI analyzes** → Detects gender (male/female), body build, pose stance
4. **Hadoop pipeline runs** → Filters 2400 items by gender, scores by build
5. **Best match selected** → AI picks the #1 ranked item
6. **Catalog updates** → Shows only your gender's collection, sorted by match
7. **Results display** → Your photo + analysis + top 8 AI recommendations

---

## 📄 License

MIT License — Free to use, modify, and distribute.

---

<p align="center">
  Built with ❤️ using React, FastAPI, Hadoop & AI
</p>
