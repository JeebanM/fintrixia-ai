# Fintrixia AI 🚀

> **AI-powered financial assistant — track spending, get insights, talk to your money.**

---

## 🏗️ Stack
| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion · Recharts |
| Backend | FastAPI · Python 3.12 · Motor (async MongoDB) |
| AI | Hugging Face Inference API · Hybrid rule+LLM engine |
| Auth | Google OAuth 2.0 · JWT |
| Database | MongoDB Atlas |

---

## 🚀 Local Setup

### 1. Clone
```bash
git clone https://github.com/JeebanM/fintrixia-ai.git
cd fintrixia-ai
```

### 2. Backend
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Fill in your credentials in .env

uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Fill in your credentials in .env.local

npm run dev
```

### 4. Open
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🔑 Required Credentials
| Variable | Where to get |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | [console.cloud.google.com](https://console.cloud.google.com) |
| `MONGO_URI` | [cloud.mongodb.com](https://cloud.mongodb.com) |
| `HF_API_KEY` | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |

---

## 📁 Project Structure
```
fintrixia-ai/
├── frontend/              # Next.js 15 app
│   └── src/
│       ├── app/           # Pages (dashboard, transactions, assistant, budget, notifications)
│       ├── components/    # UI components + layout
│       ├── store/         # Zustand auth store
│       └── lib/           # Axios API client
├── backend/               # FastAPI app
│   └── app/
│       ├── api/routes/    # Auth, transactions, budgets, notifications, AI, dashboard
│       ├── services/      # Categorizer, insights, budget alerts
│       ├── ai/            # Context builder + hybrid orchestrator
│       └── models/        # Pydantic schemas
└── docs/
```
