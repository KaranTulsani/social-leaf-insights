# 🌿 Social Leaf

> AI-powered social media content analysis platform with viral hook detection, voice coaching, and cross-platform analytics.

![Status](https://img.shields.io/badge/status-hackathon%20demo-brightgreen)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Auth](https://img.shields.io/badge/auth-Supabase-3FCF8E)

## ✨ Features

- **📱 Full Mobile Support** - 100% responsive layout with new Sidebar/MobileNav system.
- **📄 Pro PDF Reporting** - Export beautiful analytics reports directly from the dashboard.
- **⚡ Supercharged APIs** - Real-time YouTube integration with smart backend caching for instant loads.
- **🎯 Hook Detector** - AI analyzes video frames to find the scroll-stopping moments (Business plan)
- **🎙️ Voice Coach** - AI-powered script analysis with voice synthesis via ElevenLabs (Professional+)
- **📊 Analytics Dashboard** - Cross-platform social media performance metrics
- **🔍 Competitor Spyglass** - Benchmark against any YouTube channel using real API data
- **📈 Trend Analysis** - Discover trending niches and content styles
- **🔐 Secure Auth** - Supabase-managed authentication with profile-based permissions
- **💳 Plan-based Access** - Automated feature gating for Starter, Professional, and Business tiers

## 📋 Plans

| Feature | Starter (Free) | Professional ($19/mo) | Business ($49/mo) |
|---------|----------------|----------------------|-------------------|
| Social Accounts | 1 | Up to 5 | Unlimited |
| Data History | 7 days | 90 days | 1 year |
| AI Voice Coach | ❌ | ✅ | ✅ |
| Hook Detector (VLM) | ❌ | ❌ | ✅ |
| PDF Export | ✅ | ✅ | ✅ |
| Competitor Spyglass | ❌ | ✅ | ✅ |
| Team Collaboration | ❌ | ❌ | 5 seats |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.10+
- **Git**
- **Supabase** account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/KaranTulsani/social-leaf-insights.git
cd social-leaf-insights
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migration in `backend/supabase/profiles.sql`
3. Go to **Authentication > Providers > Email** and disable "Confirm email" for dev
4. Copy your project URL, anon key, and service role key

### 3. Backend Setup

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

### 4. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "VITE_SUPABASE_URL=your-supabase-url" > .env
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env
echo "VITE_API_URL=http://localhost:8000" >> .env
```

### 5. Run the Application

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

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase Anon key |
| `OPENROUTER_API_KEY` | Required for VLM Hook Detection |
| `GEMINI_API_KEY` | Primary AI for script analysis & benchmarking |
| `ELEVENLABS_API_KEY` | Required for AI Voice Coach audio generation |
| `YOUTUBE_API_KEY` | Required for real-time Competitor analytics |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_API_URL` | Backend URL (default: http://localhost:8000) |

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Framer Motion, Lucide
- **Backend:** FastAPI (Python), OpenCV, Pydantic, HTTPX (Async API calls)
- **Auth & DB:** Supabase (Postgres), JWT, RLS
- **AI Models:** Google Gemini 1.5, Qwen-VL (via OpenRouter), ElevenLabs TTS
- **Data:** YouTube Data API v3, Instagram Graph API (Simulated)

## 📄 License

MIT Licensed

---

Built with 💚 by [@KaranTulsani](https://github.com/KaranTulsani)
