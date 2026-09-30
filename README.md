# 🧞 GoalGenie AI

**An AI-powered personal finance planner that turns your income, expenses, and savings into a realistic roadmap toward your goals — a house, a car, an investment, or anything else you're saving for.**

🔗 **Live Demo:** [goal-genie-ai.vercel.app](https://goal-genie-ai.vercel.app)
📦 **Backend API:** [goalgenie-ai.onrender.com](https://goalgenie-ai.onrender.com)

> ⚠️ The backend is hosted on Render's free tier, which spins down after inactivity. The first request after idle time may take 30–50 seconds to respond.

---

## 🖼️ Screenshots

| Login | Dashboard |
|---|---|
| _add screenshot_ | _add screenshot_ |

| Goal Detail | AI Advisor |
|---|---|
| _add screenshot_ | _add screenshot_ |

---

## ✨ Features

- **Multi-goal tracking** — House, Car, and Investment goals, each with type-specific details (down payment %, loan tenure, expected returns, etc.)
- **Goal dashboard** — Live progress bars, savings-allocation pie chart, and a growth trend chart
- **Expense tracking** — Log expenses by category, see monthly totals and top spending category
- **AI Advisor chatbot** — A context-aware assistant that answers questions about your actual goals and spending, not generic advice
- **JWT authentication** — Signup/login with hashed passwords and protected API routes
- **Fully responsive, branded UI** — Custom design system, not a default template

---

## 🧠 How the AI Advisor Actually Works

A common mistake in "AI-powered" apps is asking an LLM to do everything — including math it's bad at. GoalGenie AI splits the work by what each part is good at:

| Task | Handled by |
|---|---|
| Months remaining, required monthly savings, on-track status | **Plain JavaScript** (deterministic, always correct) |
| Understanding the user's free-text question | **Gemini (LLM)** |
| Turning the pre-calculated numbers into a natural, helpful answer | **Gemini (LLM)** |

Before every chat response, the backend:
1. Fetches the user's real goals and expenses from MongoDB
2. Calculates completion timelines, required monthly contributions, and on-track/behind-schedule status in code
3. Passes only that **already-correct** data to Gemini as context
4. Gemini explains it conversationally — it is explicitly instructed never to recalculate or invent numbers

This means the assistant can't hallucinate a wrong savings timeline, because it never does the math — it only explains math that's already been done.

---

## 🛠️ Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Recharts, Axios
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt
**AI:** Google Gemini API (`gemini-3.5-flash-lite`)
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

---

## 📁 Project Structure

```
goalgenie-ai/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── models/          # User, Goal, Expense schemas
│   │   ├── controllers/     # Business logic (auth, goals, expenses, advisor)
│   │   ├── routes/          # API endpoints
│   │   └── middleware/      # JWT auth protection
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── pages/            # Login, Signup, Dashboard, GoalDetail, AddGoal, ExpenseTracker
    │   ├── components/       # Reusable UI (ChatWidget, etc.)
    │   ├── context/          # AuthContext (global login state)
    │   └── services/         # Axios instance
    └── vite.config.js
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas connection string
- A Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.

---

## 📌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/goals` | Get all goals for the logged-in user |
| POST | `/api/goals` | Create a new goal |
| GET | `/api/goals/:id` | Get a single goal |
| PUT | `/api/goals/:id` | Update a goal (e.g. add savings) |
| DELETE | `/api/goals/:id` | Delete a goal |
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Log a new expense |
| DELETE | `/api/expenses/:id` | Delete an expense |
| POST | `/api/advisor/ask` | Ask the AI advisor a question |

All `/goals`, `/expenses`, and `/advisor` routes require a `Bearer` token in the `Authorization` header.

---

## 🗺️ Roadmap

- [ ] Bank statement upload with AI-powered expense categorization
- [ ] Multi-goal savings allocation engine (AI-suggested split when funds are limited)
- [ ] Rent-vs-buy comparison tool for house goals
- [ ] Email/OTP verification on signup

---

## 👤 Author

Built by **Sangita Das** — [GitHub](https://github.com/Saberstone)
