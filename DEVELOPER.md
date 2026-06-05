# CollectAI — Developer Guide

AI-powered invoice collection platform. Generate smart payment reminders, track outstanding balances, and manage invoices from a single dashboard.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite 8, Tailwind v4       |
| Backend    | Node.js, Express v5 (ES Modules)    |
| Database   | MongoDB + Mongoose 9                |
| Auth       | JWT (7-day expiry) + bcrypt         |
| AI         | OpenAI GPT-4o-mini (reminders)      |
| Container  | Docker + nginx reverse proxy        |

---

## Project Structure

```
CollectAi/
├── client/                     # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Landing page (public)
│   │   │   ├── LoginPage.jsx       # Auth — login
│   │   │   ├── RegisterPage.jsx    # Auth — register
│   │   │   ├── DashboardPage.jsx   # Analytics dashboard
│   │   │   ├── InvoicesPage.jsx    # Invoice list with filters
│   │   │   ├── CreateInvoicePage.jsx
│   │   │   ├── InvoiceDetailPage.jsx # View/edit/delete + AI reminder
│   │   │   ├── PaymentsPage.jsx    # Payment tracking hub
│   │   │   └── NotFoundPage.jsx    # 404
│   │   ├── components/
│   │   │   ├── Layout.jsx          # Sidebar + main wrapper
│   │   │   ├── ProtectedRoute.jsx  # Auth guard
│   │   │   └── StatusBadge.jsx     # pending / paid / overdue badge
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # User state, login, logout, register
│   │   ├── services/
│   │   │   └── api.js              # Axios instance (baseURL + auth header)
│   │   └── App.jsx                 # Route definitions
│   ├── nginx.conf                  # nginx SPA config + API proxy
│   └── Dockerfile                  # Multi-stage: node build → nginx serve
│
├── server/                     # Express API
│   ├── config/
│   │   └── db.js               # mongoose.connect()
│   ├── controllers/
│   │   ├── auth.controller.js      # register, login, getCurrentUser
│   │   ├── invoice.controller.js   # CRUD + recipientOnPlatform enrichment
│   │   └── reminder.controller.js  # OpenAI reminder generation
│   ├── middleware/
│   │   └── auth.middleware.js      # JWT protect middleware
│   ├── models/
│   │   ├── user.model.js           # name, email (unique), password, timestamps
│   │   └── invoice.model.js        # clientName, clientEmail, amount, dueDate,
│   │                               #   status, description, paymentLink,
│   │                               #   remainderCount, user ref, timestamps
│   ├── routes/
│   │   ├── auth.routes.js          # /api/auth/*
│   │   ├── invoice.routes.js       # /api/invoices/*
│   │   └── reminder.routes.js      # /api/invoices/:id/remind
│   ├── utils/
│   │   └── generateToken.js        # jwt.sign(id, JWT_SECRET, 7d)
│   ├── app.js                      # Express app, CORS, routes
│   ├── server.js                   # Entry — dotenv, connectDB, listen
│   └── .env.example                # Environment variable template
│
├── docker-compose.yml          # mongo + server + client services
├── .gitignore
├── DEVELOPER.md                # This file
└── README.md
```

---

## API Reference

### Authentication — `/api/auth`

| Method | Path        | Auth | Body / Response |
|--------|-------------|------|-----------------|
| POST   | `/register` | No   | `{ name, email, password }` → `{ user, token }` |
| POST   | `/login`    | No   | `{ email, password }` → `{ user, token }` |
| GET    | `/me`       | Yes  | → `{ user }` |

### Invoices — `/api/invoices`

All routes require `Authorization: Bearer <token>`.

| Method | Path         | Body | Response |
|--------|--------------|------|----------|
| POST   | `/`          | `{ clientName, clientEmail, amount, dueDate, description?, paymentLink?, status? }` | `{ invoice }` |
| GET    | `/`          | —    | `{ invoices[] }` — sorted newest first, enriched with `recipientOnPlatform` |
| GET    | `/:id`       | —    | `{ invoice }` |
| PUT    | `/:id`       | Any invoice fields to update | `{ invoice }` |
| DELETE | `/:id`       | —    | `{ message: 'Invoice deleted' }` |
| POST   | `/:id/remind`| —    | `{ message: '<AI generated text>' }` — increments `remainderCount` |

---

## Data Models

### User
```js
{
  name:      String (required, trimmed),
  email:     String (required, unique, lowercase),
  password:  String (required, min 6 chars, bcrypt hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Invoice
```js
{
  user:           ObjectId → User (required),
  clientName:     String (required),
  clientEmail:    String (required, lowercase),
  amount:         Number (required, INR),
  dueDate:        Date (required),
  status:         'pending' | 'paid' | 'overdue'  (default: pending),
  description:    String (default: ''),
  paymentLink:    String (default: ''),
  remainderCount: Number (default: 0),
  createdAt:      Date,
  updatedAt:      Date
}
```

---

## Environment Variables

Copy `server/.env.example` to `server/.env` and fill in values.

```env
PORT=8080
MONGO_URI=mongodb://mongo:27017/collectai   # use mongodb+srv://... for Atlas
JWT_SECRET=<random 64-char hex string>
OPENAI_API_KEY=<your OpenAI key>            # needed for AI reminders
CLIENT_URL=http://localhost:81              # frontend origin for CORS
NODE_ENV=production
```

> **Never commit `.env` or `server/.env`** — they are gitignored.

---

## Running Locally

### With Docker (recommended)
```bash
# starts mongo + server + client
docker-compose up --build

# UI  → http://localhost:81
# API → http://localhost:8081/api
```

### Without Docker
```bash
# Terminal 1 — start MongoDB locally
mongod

# Terminal 2 — start server
cd server
cp .env.example .env   # fill in values
npm install
npm run dev            # listens on PORT (default 8080)

# Terminal 3 — start client
cd client
npm install
npm run dev            # Vite dev server → http://localhost:5173
```

---

## Authentication Flow

1. User registers/logs in → server returns JWT
2. Client stores token in `localStorage`
3. `api.js` adds `Authorization: Bearer <token>` to every request
4. `auth.middleware.js` verifies JWT on protected routes and attaches `req.user`
5. `AuthContext.jsx` on mount calls `GET /api/auth/me` to restore session

---

## Feature Status

### Phase 1 — Complete ✅
| Feature | Files |
|---------|-------|
| User registration & login | `auth.controller.js`, `LoginPage.jsx`, `RegisterPage.jsx` |
| JWT auth + protected routes | `auth.middleware.js`, `generateToken.js`, `ProtectedRoute.jsx` |
| Create / read / update / delete invoices | `invoice.controller.js`, `InvoicesPage.jsx`, `CreateInvoicePage.jsx`, `InvoiceDetailPage.jsx` |
| Invoice status management (pending / paid / overdue) | `StatusBadge.jsx`, `InvoiceDetailPage.jsx` |
| Payment link per invoice | `invoice.model.js`, `InvoiceDetailPage.jsx`, `PaymentsPage.jsx` |
| AI reminder generation (on-demand) | `reminder.controller.js`, `InvoiceDetailPage.jsx` |

### Phase 2 — Partial ⚠️
| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard analytics | ✅ Done | Monthly bar chart, status donut, top clients, month-over-month deltas |
| Payments hub | ✅ Done | `PaymentsPage.jsx` — tabbed table, mark paid, copy/open payment links |
| Email notifications | ❌ Not built | Reminders are generated but not sent. Needs Nodemailer + SMTP config |
| Reminder scheduling | ❌ Not built | No cron job. Needs `node-cron` or similar to auto-send on due dates |

### Phase 3 — Not started ❌
- Razorpay payment link generation
- WhatsApp reminders via Twilio

---

## Adding Email Notifications (next step)

1. Install: `npm install nodemailer` in `server/`
2. Add env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
3. Create `server/utils/sendEmail.js`:
   ```js
   import nodemailer from 'nodemailer';
   const transporter = nodemailer.createTransport({ host, port, auth: { user, pass } });
   export const sendEmail = (to, subject, html) => transporter.sendMail({ from, to, subject, html });
   ```
4. Call `sendEmail()` in `reminder.controller.js` after generating the AI message
5. Store sent status on the invoice (`emailSentAt` field)

## Adding Cron Scheduler (next step)

1. Install: `npm install node-cron` in `server/`
2. Create `server/jobs/reminderJob.js`:
   ```js
   import cron from 'node-cron';
   import Invoice from '../models/invoice.model.js';
   // runs every day at 9am
   cron.schedule('0 9 * * *', async () => {
     const overdue = await Invoice.find({ status: 'overdue' });
     for (const inv of overdue) { /* generate + send reminder */ }
   });
   ```
3. Import in `server.js` after `connectDB()`

---

## Key Design Decisions

- **ES Modules everywhere** — both server and client use `"type": "module"`. Use `import/export`, never `require()`.
- **Tailwind v4** — uses `@import "tailwindcss"` in CSS, no `postcss.config.js` needed (uses `@tailwindcss/vite` plugin).
- **User isolation** — every invoice query is scoped to `req.user._id`. Users can only see their own data.
- **`recipientOnPlatform`** — invoice list endpoint checks if `clientEmail` matches another registered user. This enables future in-platform payment flows.
- **Dark theme** — `bg-slate-950` base, `bg-slate-900` cards, `border-white/5` borders, indigo/violet accents.
