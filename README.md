# KHUSHI OPTICS - Production Full-Stack Application Architecture

A modern, production-ready Full-Stack Optical Shop Billing & Management System for **KHUSHI OPTICS**, Bavla, Gujarat.

---

## 🏗️ Architecture Overview

The repository is restructured into a clean, modular **Frontend** and **Backend** architecture:

```text
khushi-optics-app/
│
├── frontend/                     # Frontend Application (Vite / HTML / CSS / JS)
│   ├── public/                   # Static Public Assets
│   │   ├── favicon/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── src/
│   │   ├── assets/               # Source Assets (Images, Icons, Logo, Fonts)
│   │   ├── components/           # Reusable UI & Layout Components
│   │   │   ├── common/
│   │   │   ├── ui/
│   │   │   ├── forms/
│   │   │   ├── tables/
│   │   │   ├── modals/
│   │   │   ├── sidebar/
│   │   │   ├── navbar/
│   │   │   ├── dashboard/
│   │   │   └── billing/
│   │   ├── pages/                # Page Controllers & Views
│   │   │   ├── Dashboard/
│   │   │   ├── Customers/
│   │   │   ├── Billing/
│   │   │   ├── Products/
│   │   │   ├── Inventory/
│   │   │   ├── Suppliers/
│   │   │   ├── Reports/
│   │   │   ├── Settings/
│   │   │   └── Login/
│   │   ├── layouts/              # App Layout Wrappers
│   │   ├── routes/               # Navigation & Router
│   │   ├── hooks/                # Helper Hooks
│   │   ├── context/              # State Contexts
│   │   ├── services/             # Database & Persistence Services
│   │   ├── api/                  # REST API Client & Fetchers
│   │   ├── utils/                # Utility & Formatting Helpers
│   │   ├── constants/            # Application Constants
│   │   ├── styles/               # Design Tokens & Invoice Stylesheets
│   │   ├── data/                 # Sample Data Definitions
│   │   ├── config/               # Application Configs
│   │   ├── App.js                # Main Application Controller
│   │   └── main.js               # Frontend Main Entry Point
│   ├── .env                      # Environment Variables
│   ├── package.json              # Frontend Scripts & Dependencies
│   ├── vite.config.js            # Vite Server & Proxy Config
│   ├── vercel.json               # Vercel Deployment Rules
│   ├── netlify.toml              # Netlify Redirects & SPA Rules
│   ├── firebase.json             # Firebase Hosting Config
│   └── Dockerfile                # Nginx Production Container
│
├── backend/                      # Express REST API Server
│   ├── src/
│   │   ├── config/               # Environment & CORS Config
│   │   ├── database/             # Data Store & Initial Seed Data
│   │   ├── controllers/          # Request Controllers
│   │   ├── services/             # Business Logic Services
│   │   ├── models/               # Data Schemas & Validation Models
│   │   ├── routes/               # Express REST API Endpoints (/api/...)
│   │   ├── middleware/           # Helmet, CORS, Rate Limiting & Error Handler
│   │   ├── validators/           # Input Validation Rules
│   │   ├── helpers/              # Calculation & Invoice Helpers
│   │   ├── utils/                # Logger & Helper Utilities
│   │   ├── uploads/              # Local Storage for Uploaded Media/Bills
│   │   ├── logs/                 # Request & Error Logs
│   │   ├── app.js                # Express App Orchestrator
│   │   └── server.js             # Server Startup Script
│   ├── .env                      # Backend Environment Variables
│   ├── package.json              # Backend Dependencies & Scripts
│   ├── render.yaml               # Render Deployment Spec
│   ├── railway.json              # Railway Deployment Spec
│   ├── nginx.conf                # Nginx Reverse Proxy Config for VPS
│   ├── ecosystem.config.js       # PM2 Process Manager Config
│   ├── Dockerfile                # Node Alpine Container
│   └── README.md
│
├── .gitignore                    # Version Control Exclusions
├── docker-compose.yml            # Multi-Container Deployment Specification
├── package.json                  # Root Monorepo Orchestrator
└── README.md                     # Full Documentation & Setup Guide
```

---

## ⚡ Quick Start & Commands

### Prerequisites
- Node.js (version 18 or newer installed)

### 1. Install Dependencies for All Packages
```bash
npm run install:all
```

### 2. Start Local Development Environment (Runs Frontend + Backend Concurrently)
```bash
npm run dev
```
- **Frontend Dev Server**: [http://localhost:3000](http://localhost:3000)
- **Backend Express REST API**: [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check Route**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Build Production Bundle
```bash
npm run build
```

### 4. Run Production Server
```bash
npm start
```

---

## 🔒 Default Admin Credentials

- **Username**: `dhey`
- **Password**: `dheypatel0007`

---

## 🔌 REST API Endpoints Reference

All API routes are hosted under `/api`:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate Admin user |
| `POST` | `/api/auth/credentials` | Update Admin credentials |
| `GET` | `/api/customers` | Fetch all customers |
| `POST` | `/api/customers` | Register new customer & eye Rx |
| `GET` | `/api/products/frames` | Get frame stock inventory |
| `GET` | `/api/products/lenses` | Get lens catalog |
| `GET` | `/api/billing` | Fetch all generated invoices |
| `POST` | `/api/billing` | Generate & save new tax invoice |
| `POST` | `/api/billing/collect/:invNum` | Record partial or full due payment |
| `GET` | `/api/inventory/alerts` | Get low stock inventory alerts |
| `GET` | `/api/reports/summary` | Fetch sales & revenue analytics |
| `GET` | `/api/settings` | Get shop metadata & UPI details |
| `GET` | `/api/health` | Service health status check |

---

## 🚀 Deployment Instructions

### Frontend Deployment

#### Option A: Vercel
1. Install Vercel CLI or connect GitHub Repository to Vercel dashboard.
2. Select Root Directory: `./frontend`
3. Vercel automatically detects `vite` build configuration.
4. Set Environment Variable: `VITE_API_URL=https://your-backend-api-url.com/api`

#### Option B: Netlify
1. Connect GitHub Repository to Netlify.
2. Set Base Directory: `frontend`
3. Build Command: `npm run build`
4. Publish Directory: `frontend/dist`

#### Option C: Docker Container (Nginx)
```bash
cd frontend
docker build -t khushi-frontend .
docker run -p 80:80 khushi-frontend
```

---

### Backend Deployment

#### Option A: Render
1. Create a Web Service on [Render](https://render.com/).
2. Point repository root to `backend/`.
3. Render reads `render.yaml` automatically for zero-config deployment.

#### Option B: Railway
1. Create project on [Railway](https://railway.app/).
2. Select repository directory `backend/`.
3. Railway automatically detects `railway.json` and Nixpacks configuration.

#### Option C: Ubuntu VPS (Nginx + PM2)
1. Transfer `backend/` folder to server.
2. Install PM2: `npm install -g pm2`
3. Start process: `pm2 start ecosystem.config.js`
4. Copy `backend/nginx.conf` to `/etc/nginx/sites-available/` and reload Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

#### Option D: Docker Compose (Full Stack Single Command)
To launch both **Frontend** and **Backend** in isolated container environments:
```bash
docker-compose up -d --build
```
