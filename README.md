# 🌿 Social Leaf

> AI-powered social media content analysis platform with viral hook detection, voice coaching, and cross-platform analytics.

![Status](https://img.shields.io/badge/status-hackathon%20demo-brightgreen)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Auth](https://img.shields.io/badge/auth-Supabase-3FCF8E)

## ✨ Features

- **🎯 Hook Detector** - AI analyzes video frames to find the most scroll-stopping moment (Business plan)
- **🎙️ Voice Coach** - AI-powered script analysis with voice synthesis via ElevenLabs (Professional+)
- **📊 Analytics Dashboard** - Cross-platform social media performance metrics
- **🔍 Competitor Spyglass** - Track and analyze competitor content
- **📈 Trend Analysis** - Discover trending niches and content styles
- **🔐 Supabase Auth** - Secure email/password authentication
- **💳 Plan-based Access** - Tiered feature access (Starter, Professional, Business)

## 📋 Plans

| Feature | Starter (Free) | Professional ($19/mo) | Business ($49/mo) |
|---------|----------------|----------------------|-------------------|
| Social Accounts | 1 | Up to 5 | Unlimited |
| Data History | 7 days | 90 days | 1 year |
| AI Voice Coach | ❌ | ✅ | ✅ |
| Hook Detector (VLM) | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |
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

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `SUPABASE_URL` | Project URL | Supabase Dashboard |
| `SUPABASE_KEY` | Anon key | Supabase Dashboard > API |
| `SUPABASE_SERVICE_KEY` | Service role key | Supabase Dashboard > API |
| `OPENROUTER_API_KEY` | AI vision (FREE) | [openrouter.ai/keys](https://openrouter.ai/keys) |
| `GEMINI_API_KEY` | Fallback AI | [aistudio.google.com](https://aistudio.google.com/apikey) |
| `ELEVENLABS_API_KEY` | Voice | [elevenlabs.io](https://elevenlabs.io) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_API_URL` | Backend URL (default: http://localhost:8000) |

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Framer Motion
- **Backend:** FastAPI, Python 3.10+, OpenCV
- **Auth & Database:** Supabase (PostgreSQL + Row Level Security)
- **AI:** OpenRouter (Qwen-VL), Google Gemini, ElevenLabs

## 📄 License

MIT Licensed

---

Built with 💚 by [@KaranTulsani](https://github.com/KaranTulsani)
