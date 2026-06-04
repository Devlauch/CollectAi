# CollectAI

## AI-Powered Invoice Collection Platform for MSMEs and Freelancers

CollectAI is a SaaS platform designed to help small businesses, agencies, and freelancers manage invoices and recover payments efficiently. The platform automates invoice tracking, payment reminders, and collection workflows, reducing the time spent chasing unpaid invoices.

---

## Problem Statement

Many MSMEs struggle with delayed payments and unpaid invoices. Business owners often spend significant time manually following up with clients through emails and messages, leading to cash flow issues and operational challenges.

CollectAI aims to solve this problem by providing a centralized platform for invoice management and automated payment collection workflows.

---

## Features

### Completed Features

* User Authentication (JWT)
* Secure Password Hashing (bcrypt)
* Protected Routes
* Create Invoice
* View All Invoices
* View Single Invoice
* Update Invoice
* Delete Invoice
* User-Specific Invoice Management
* MongoDB Database Integration

### Planned Features

* Dashboard Analytics
* Email Reminder Automation
* WhatsApp Reminder Automation
* AI-Generated Follow-Up Messages
* Razorpay Payment Integration
* Cash Flow Tracking
* Reminder Scheduling with Cron Jobs
* Payment Recovery Analytics

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js
* JWT Authentication
* bcryptjs

### Database

* MongoDB
* Mongoose

### Integrations (Planned)

* OpenAI
* Razorpay
* Twilio WhatsApp API
* Nodemailer

---

## Project Structure

```text
server/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── app.js
└── server.js

client/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── services/
│   └── App.jsx
```

---

## API Endpoints

### Authentication

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| POST   | /api/auth/register | Register a new user |
| POST   | /api/auth/login    | Login user          |
| GET    | /api/auth/me       | Get current user    |

### Invoices

| Method | Endpoint          | Description       |
| ------ | ----------------- | ----------------- |
| POST   | /api/invoices     | Create invoice    |
| GET    | /api/invoices     | Get all invoices  |
| GET    | /api/invoices/:id | Get invoice by ID |
| PUT    | /api/invoices/:id | Update invoice    |
| DELETE | /api/invoices/:id | Delete invoice    |

---

## Installation

### Clone Repository

```bash
git clone https://github.com/CodeManBist/CollectAi.git
```

### Backend Setup

```bash
cd server

npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd client

npm install

npm run dev
```

---

## Development Roadmap

### Phase 1

* Authentication System
* Invoice Management

### Phase 2

* Dashboard Analytics
* Email Notifications
* Reminder Scheduling

### Phase 3

* OpenAI Integration
* WhatsApp Automation
* Razorpay Payments

### Phase 4

* Deployment
* Performance Optimization
* Production Readiness

---

## Author

Sagar Bist

Full Stack Developer passionate about building scalable SaaS products and solving real-world business problems.

---

## License

This project is licensed under the MIT License.
