# FinWise: Intelligent Personal Finance Management Web Application

> **A modern, academic-grade full-stack personal wealth operating system with rule-based AI spending insights, financial health scoring, debt payoff modeling, and gamified savings discipline.**

🌐 **Live Demo Website:** [https://fin-wise-intelligent-personal-finan.vercel.app](https://fin-wise-intelligent-personal-finan.vercel.app)

---

## Project Overview

**FinWise** is an enterprise-grade full-stack web application developed to empower individuals to master their finances, eliminate toxic debts, plan for recurring bills, track multi-asset investments, and achieve financial independence. 

Equipped with an intelligent **Financial Health Score Algorithm (0–100)**, **Rule-Based AI Spending Intelligence**, **No-Spend Day Streak Trackers**, **Expense Mood Correlation**, **Receipt OCR Scanning simulation**, and **Voice-Assisted Expense Entry**, FinWise bridges the gap between passive accounting and active financial habit transformation.

---

## Technology Stack

### Frontend Architecture
- **React.js 18** (Modern functional components, custom hooks, context state management)
- **Vite** (Next-generation high-speed build tool and dev server)
- **Tailwind CSS** (Curated custom palette, glassmorphism, responsive design tokens)
- **Recharts** (Interactive multi-axis cash flow area charts, category distribution pies, and bar charts)
- **Lucide React** (Clean, consistent fintech iconography)
- **Axios** (Configured with request/response interceptors and offline sync queuing)
- **Canvas-Confetti** (Gamified celebration animations upon achieving savings milestones)

### Backend Architecture
- **Node.js** (High-throughput runtime environment)
- **Express.js** (REST API framework with clean MVC folder separation)
- **JSON Web Tokens (JWT)** (Stateless, encrypted session authentication)
- **Bcrypt.js** (Salted password hashing with 10 rounds)
- **CORS & Custom Error Handling Middleware** (Secure cross-origin exchange and unified error responses)

### Database Layer
- **MongoDB** (NoSQL document database)
- **Mongoose ODM** (Strict schemas, pre-save encryption middleware, model associations, indexes)

---

## Key Features

### 1. Financial Health Score Engine (0–100)
A multi-factor mathematical scoring engine that analyzes:
- **Savings Rate** (25% weight): Compares disposable income against saved capital.
- **Expense-to-Income Ratio** (25% weight): Detects living beyond one's means.
- **Debt & EMI Burden** (20% weight): Ratios monthly loan repayments to incoming cash.
- **Budget Compliance** (15% weight): Adherence to category budget caps.
- **Safety Buffer & Investments** (15% weight): 3-to-6 month emergency fund coverage.

### 2. Rule-Based Smart Spending Insights
- **Category Outlay Concentration**: Alerts users when a single category exceeds 35% of total spend.
- **Weekend Splurge Detector**: Identifies weekend spending acceleration patterns.
- **Subscription Leakage Detector**: Scans for redundant streaming tiers or memberships costing over benchmark limits.
- **Emotional Spending Tracker**: Correlates spending volume with emotional moods (*Stressed*, *Impulsive*, *Happy*, *Necessary*).

### 3. Comprehensive Financial Management
- **Unified Transaction Ledger**: Search, multi-criteria filtering, sorting, pagination, and CSV data export.
- **Category Budget Guardrails**: Monthly limits with visual alerts at 50%, 80%, and 100% capacity plus AI auto-recommendations based on previous spending.
- **Gamified Savings Goals**: Target deadlines, visual progress bars, deposit funds modal, and completion milestone badges.
- **Debt Elimination & Loan Amortization**: Principal balance tracking, monthly EMIs, payment logging, and bonus payment payoff acceleration math.
- **Multi-Asset Portfolio**: Real-time profit/loss tracking, ROI % calculation, and asset allocation breakdown (Stocks, ETFs, Crypto, Gold, Real Estate).
- **Bills & Subscriptions**: Recurring billing cycle reminders, auto-rescheduling, and paid/unpaid toggling.
- **Fiscal Calendar View**: Monthly day-by-day cashflow matrix highlighting income days, bill due dates, and EMI deadlines.
- **Audit Reports & Exports**: Multi-period cashflow statements, budget variance analysis, printable PDF view, and CSV downloads.

### 4. Advanced & Intelligent Utilities
- **Voice-Based Expense Entry**: Uses the Web Speech API to parse natural language phrases (e.g. *"Spent 35 dollars on groceries with card"*).
- **Receipt OCR Smart Scanner**: Simulated OCR bill scanner with laser animation that auto-populates transaction forms.
- **Offline Expense Queue with Auto-Sync**: Allows offline logging in localStorage that automatically syncs to MongoDB upon network reconnection.
- **Multi-Currency Switcher**: Instant UI conversions across USD ($), EUR (€), GBP (£), INR (₹), JPY (¥), CAD (C$), and AUD (A$).
- **Dark Mode & Light Mode**: Smooth theme toggling persisted to localStorage.

### 5. Dedicated Administrative Portal
- System overview metrics (total users, transaction volume, active debts, total goals).
- Member management directory with search, role modification (User <-> Admin), and account suspension/reinstatement.
- Financial tips CMS (create, update, delete financial literacy articles).
- User feedback and issue ticket management with admin responses.
- Real-time audit security logs.

---

## Project Folder Structure

```
FinWise/
├── backend/
│   ├── .env                       # Environment secrets (Port, DB URI, JWT)
│   ├── .env.example               # Template environment configuration
│   ├── package.json               # Backend dependencies and scripts
│   ├── server.js                  # Main Express application entry point
│   └── src/
│       ├── config/
│       │   └── db.js              # MongoDB Mongoose connection
│       ├── models/
│       │   ├── User.js            # User profile, role, currency, gamification
│       │   ├── Transaction.js     # Income/expense, mood, payment method
│       │   ├── Budget.js          # Category budget limits and alerts
│       │   ├── Goal.js            # Savings targets, deadlines, badges
│       │   ├── Debt.js            # Loans, interest, EMI, payment history
│       │   ├── Investment.js      # Portfolio holdings, P&L, asset classes
│       │   ├── Bill.js            # Recurring bills and subscription leakage
│       │   ├── Notification.js    # User alerts and system messages
│       │   ├── FinancialTip.js    # Curated financial educational articles
│       │   ├── Feedback.js        # User support tickets and inquiries
│       │   └── AdminLog.js        # Audit trail for administrative actions
│       ├── middleware/
│       │   ├── authMiddleware.js  # JWT verification and user protection
│       │   ├── adminMiddleware.js # Role-based admin access control
│       │   └── errorHandler.js    # Centralized REST error formatting
│       ├── utils/
│       │   ├── healthScore.js     # Financial Health Score algorithm
│       │   └── insightsEngine.js  # Rule-based spending insights engine
│       ├── controllers/           # Business logic implementations
│       │   ├── authController.js
│       │   ├── userController.js
│       │   ├── transactionController.js
│       │   ├── budgetController.js
│       │   ├── goalController.js
│       │   ├── debtController.js
│       │   ├── investmentController.js
│       │   ├── billController.js
│       │   ├── reportController.js
│       │   ├── smartInsightsController.js
│       │   ├── adminController.js
│       │   └── feedbackController.js
│       ├── routes/                # Express API endpoints
│       └── seed/
│           └── seeder.js          # Database populator (75+ realistic entries)
│
├── frontend/
│   ├── index.html                 # Main HTML template with Google Fonts
│   ├── package.json               # Frontend dependencies (React, Recharts, Tailwind)
│   ├── vite.config.js             # Vite configuration
│   ├── tailwind.config.js         # Custom design tokens & dark mode class
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx               # React DOM root and context providers
│       ├── App.jsx                # Router, protected routes, layout wrappers
│       ├── index.css              # Custom styling, scrollbars, glassmorphism
│       ├── context/
│       │   ├── AuthContext.jsx    # Authentication state, login, logout, demo
│       │   ├── ThemeContext.jsx   # Dark / Light theme persistence
│       │   └── CurrencyContext.jsx# Multi-currency formatting ($ € £ ₹ ¥)
│       ├── services/
│       │   └── api.js             # Axios instance with interceptors & offline sync
│       ├── components/
│       │   ├── layout/            # Navbar, Sidebar, AdminSidebar, OfflineBanner
│       │   ├── common/            # Button, Card, StatCard, Badge, Modal, Input
│       │   └── smart/             # HealthScoreGauge, VoiceModal, OCRScanner
│       └── pages/                 # 21 comprehensive application pages
│           ├── LandingPage.jsx
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── ForgotPasswordPage.jsx
│           ├── DashboardPage.jsx
│           ├── TransactionsPage.jsx
│           ├── IncomePage.jsx
│           ├── ExpensesPage.jsx
│           ├── BudgetPage.jsx
│           ├── GoalsPage.jsx
│           ├── DebtsPage.jsx
│           ├── InvestmentsPage.jsx
│           ├── BillsPage.jsx
│           ├── ReportsPage.jsx
│           ├── CalendarPage.jsx
│           ├── SmartInsightsPage.jsx
│           ├── ProfilePage.jsx
│           ├── FeedbackPage.jsx
│           ├── admin/
│           │   ├── AdminDashboardPage.jsx
│           │   ├── AdminUsersPage.jsx
│           │   └── AdminTipsPage.jsx
│           └── NotFoundPage.jsx
│
└── README.md                      # Comprehensive academic documentation
```

---

## Installation & Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or newer (tested on v22.7.0)
- **npm**: v9.0.0 or newer
- **MongoDB**: Local daemon running on port `27017` or a remote MongoDB Atlas URI

### Step 1: Clone Repository
```bash
git clone https://github.com/<YOUR_USERNAME>/FinWise.git
cd FinWise
```

### Step 2: Configure & Seed Backend
```bash
cd backend
npm install

# (Optional) Verify environment variables in .env
# PORT=5000
# MONGODB_URI=mongodb://127.0.0.1:27017/finwise
# JWT_SECRET=your_jwt_secret_key_here

# Seed the database with 70+ realistic transactions, budgets, goals, and demo users
npm run seed

# Start backend server
node server.js
# Backend will start on http://localhost:5000
```

### Step 3: Setup & Launch Frontend
Open a second terminal window:
```bash
cd frontend
npm install

# Start Vite development server
npm run dev
# Frontend will be live on http://localhost:5173
```

---

## Sample Test Credentials

FinWise includes one-click demo login buttons directly on the `/login` page for fast evaluation, or you can sign in manually:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Demo User** | `user@finwise.com` | `User@123` | Full access to personal dashboard, transactions, budgets, goals, debts, investments, bills, calendar, and reports. Pre-loaded with 70+ multi-month records. |
| **Administrator** | `admin@finwise.com` | `Admin@123` | Full access to user dashboard + Admin Control Center (`/admin`), User Management directory, Tips CMS, and audit logs. |

---

## API Documentation Reference

All API routes are prefixed with `/api` and require a `Bearer <token>` header for protected endpoints.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — Authenticate and receive JWT.
- `GET /api/auth/me` — Retrieve current authenticated session profile.
- `POST /api/auth/forgotpassword` — Request password reset token.
- `PUT /api/auth/resetpassword/:token` — Reset password using token.

### User & Dashboard (`/api/users`)
- `GET /api/users/dashboard` — Aggregates all KPI metrics, cash flow charts, health score, and recent records.
- `PUT /api/users/profile` — Update name, currency, monthly income, bio, and notification settings.

### Transactions (`/api/transactions`)
- `GET /api/transactions` — Query transactions with search, category, type, date range, and pagination.
- `POST /api/transactions` — Record income or expense (supports mood context and payment method).
- `GET /api/transactions/:id` — Retrieve single transaction.
- `PUT /api/transactions/:id` — Update existing transaction.
- `DELETE /api/transactions/:id` — Delete transaction record.
- `GET /api/transactions/stats` — Breakdown stats by category, payment method, and mood.

### Budgets (`/api/budgets`)
- `GET /api/budgets` — List category budgets with actual spending vs limit and recommendations.
- `POST /api/budgets` — Establish new category budget with 50/80/100% threshold alert triggers.
- `PUT /api/budgets/:id` — Update budget limit.
- `DELETE /api/budgets/:id` — Delete budget limit.

### Savings Goals (`/api/goals`)
- `GET /api/goals` — List goals with target amounts, progress %, and recommended monthly contributions.
- `POST /api/goals` — Create savings goal.
- `POST /api/goals/:id/deposit` — Deposit funds into goal; automatically awards achievement badge on completion.
- `DELETE /api/goals/:id` — Remove savings goal.

### Debts & Loans (`/api/debts`)
- `GET /api/debts` — List loans, interest rates, EMIs, remaining balances, and payoff estimates.
- `POST /api/debts` — Record new debt liability.
- `POST /api/debts/:id/pay` — Log EMI/bonus payment.
- `DELETE /api/debts/:id` — Delete debt liability.

### Investments (`/api/investments`)
- `GET /api/investments` — List portfolio holdings with P&L, ROI%, and asset distribution.
- `POST /api/investments` — Add asset holding (stocks, ETFs, crypto, gold, real estate).
- `PUT /api/investments/:id` — Update holding market value or units.
- `DELETE /api/investments/:id` — Remove holding from portfolio.

### Bills & Subscriptions (`/api/bills`)
- `GET /api/bills` — List bills and subscriptions with leakage detector warnings.
- `POST /api/bills` — Schedule recurring bill or subscription.
- `PATCH /api/bills/:id/toggle-paid` — Mark paid/unpaid and advance recurring cycle.
- `DELETE /api/bills/:id` — Delete bill entry.

### Reports & Export (`/api/reports`)
- `GET /api/reports/analytics` — Multi-dimensional financial report across custom date ranges.
- `GET /api/reports/export-csv` — Generates and downloads standard CSV transaction ledger.

### Smart Insights (`/api/insights`)
- `GET /api/insights` — Returns health score breakdown, no-spend tracker matrix, mood analysis, and gamification challenges.

### Administration (`/api/admin`)
- `GET /api/admin/stats` — High-level platform statistics and audit trails.
- `GET /api/admin/users` — Directory of all platform members with search and pagination.
- `PATCH /api/admin/users/:id/ban` — Suspend or reinstate user access.
- `PATCH /api/admin/users/:id/role` — Modify user role (`user` / `admin`).
- `GET /api/admin/tips` — Retrieve all educational financial tips.
- `POST /api/admin/tips` — Publish new financial tip.
- `DELETE /api/admin/tips/:id` — Delete tip.

---

## Security Implementation

1. **Password Security**: Passwords are encrypted before persisting using `bcryptjs` with salt rounds = 10. Cleartext passwords are never stored or returned in JSON API responses (`select: false`).
2. **Stateless JWT Protection**: Sensitive routes are gated by `authMiddleware` verifying cryptographically signed JSON Web Tokens.
3. **Role-Based Access Control (RBAC)**: Administrative routes enforce `adminMiddleware` ensuring standard users cannot access member tables or system logs.
4. **Data Isolation**: All queries filter strictly by `user: req.user.id`, ensuring zero cross-tenant data leakage.
5. **Input Validation**: All incoming requests undergo Mongoose schema validation and type sanitation.
6. **Deletion Confirmations**: Crucial actions (deleting loans, budgets, transactions, or users) require explicit confirmation dialogs to prevent accidental data loss.

---

## Screenshots Placeholder Section

| Screen | Description |
| :--- | :--- |
| **Landing Page** | Modern fintech hero with interactive compounding savings calculator and value propositions. |
| **Financial Command Center** | Real-time KPI stat cards, circular Health Score meter, cashflow area trajectory, and category donut chart. |
| **No-Spend Streak Tracker** | Day-by-day monthly matrix tracking days without discretionary spending. |
| **Expense Mood Correlation** | Behavioral analytics tracking emotional spending patterns. |
| **Debt Payoff Simulator** | Amortization metrics and payoff acceleration recommendations. |
| **Admin Control Panel** | Audit logs, platform volume metrics, and member directory moderation. |

---

## Future Scope & Enhancements

1. **Direct Plaid / Open Banking Integration**: Direct automated syncing with real banking and credit card APIs.
2. **Production ML Model**: Replace rule-based heuristics with machine learning models for anomaly detection and predictive cash flow forecasting.
3. **Automated Tax Harvesting & Categorization**: Automated estimation of capital gains taxes for stocks and crypto investments.
4. **Shared Family / Household Budgets**: Multi-user shared vaults for couples and shared household expenses.
5. **Native Mobile App (React Native)**: Compile the React application into native iOS and Android packages.

---

## Deployment Instructions

### Production Frontend Build
```bash
cd frontend
npm run build
```
This generates the optimized, production-ready static bundle in `frontend/dist/`, which can be served using Nginx, Vercel, Netlify, or AWS S3 + CloudFront.

### Production Backend Deployment
1. Set `NODE_ENV=production` in `backend/.env`.
2. Configure a persistent MongoDB Atlas cluster URI.
3. Deploy the Express service to a platform like Render, Railway, AWS ECS, or DigitalOcean App Platform using:
```bash
cd backend
npm install --production
node server.js
```

---

## Author & Copyright

**FinWise** is designed and developed by **Vishal Prasad Gupta**.

© 2026 FinWise by Vishal Prasad Gupta. All rights reserved. Intelligent Personal Finance Management Web Application.

