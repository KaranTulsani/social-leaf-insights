# 🌿 Social Leaf

> AI-powered social media content analysis platform with viral hook detection, voice coaching, and cross-platform analytics.

![Status](https://img.shields.io/badge/status-hackathon%20demo-brightgreen)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)

## ✨ Features

- **🎯 Hook Detector** - AI analyzes video frames to find the most scroll-stopping moment
- **🎙️ Voice Coach** - AI-powered script analysis with voice synthesis via ElevenLabs
- **📊 Analytics Dashboard** - Cross-platform social media performance metrics
- **🔍 Competitor Spyglass** - Track and analyze competitor content
- **📈 Trend Analysis** - Discover trending niches and content styles

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.10+
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/KaranTulsani/social-leaf-insights.git
cd social-leaf-insights
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys (see below)
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:8080** in your browser!

## 🔑 Environment Variables

Create a `.env` file in `backend/` with:

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `OPENROUTER_API_KEY` | AI vision (FREE) | [openrouter.ai/keys](https://openrouter.ai/keys) |
| `SUPABASE_URL` | Database URL | [supabase.com](https://supabase.com) |
| `SUPABASE_KEY` | Database key | [supabase.com](https://supabase.com) |
| `GEMINI_API_KEY` | Fallback AI | [aistudio.google.com](https://aistudio.google.com/apikey) |
| `ELEVENLABS_API_KEY` | Voice | [elevenlabs.io](https://elevenlabs.io) |

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS
- **Backend:** FastAPI, Python 3.10+, OpenCV
- **Database:** Supabase
- **AI:** OpenRouter (Qwen-VL), Google Gemini, ElevenLabs

## 📄 License

MIT Licensed

---

Built with 💚 by [@KaranTulsani](https://github.com/KaranTulsani)
