# ISSRMS - Integrated Student Services & Resource Management System
**Saint Joseph School of Mactan**

An enterprise-grade school management platform integrating student authentication, e-wallet double-entry ledger services, cashless canteen POS, automated library circulation, academic calendar scheduling, institutional logging records, and tamper-evident audit logging.

---

## 🏛️ System Architecture

ISSRMS features a strict dual-zone architectural pattern:
- **Zone 1 (`sjsm_institutional_zone1`)**: The school's existing read-only institutional legacy database (student master records, enrollment directory, turnstile/gate entry logs).
- **Zone 2 (`sjsm_issrms_zone2`)**: The ISSRMS operational read/write database powering system accounts (Argon2id hashing), e-wallets, transactions ledger, canteen POS, library circulation, official announcements, academic events, notifications, and immutable audit logs.

```
                      ┌──────────────────────────────────────────┐
                      │          ISSRMS Web Client               │
                      │          (React 19 + Vite + Tailwind)    │
                      └────────────────────┬─────────────────────┘
                                           │ HTTP / REST (JWT)
                                           ▼
                      ┌──────────────────────────────────────────┐
                      │          ISSRMS Backend API              │
                      │          (Node.js + Express)             │
                      └─────────────┬────────────────────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            │ (Read-Only Adapter)                           │ (Read/Write CRUD)
            ▼                                               ▼
┌───────────────────────────────┐           ┌───────────────────────────────┐
│ Zone 1: Institutional Records │           │ Zone 2: ISSRMS Operations     │
│ (`sjsm_institutional_zone1`)  │           │ (`sjsm_issrms_zone2`)         │
└───────────────────────────────┘           └───────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MySQL / MariaDB** (via XAMPP or standalone server on port 3306)
- **Git**

---

### 2. Database Setup

Ensure MySQL is running, then import both SQL files located in the `database/` folder:

```bash
# Using MySQL Command Line (from repository root):
mysql -u root -p < database/sjsm_institutional_zone1.sql
mysql -u root -p < database/sjsm_issrms_zone2.sql
```
*(If your local MySQL root user has no password, omit `-p`)*

Alternatively, import both `.sql` files using phpMyAdmin (`http://localhost/phpmyadmin`).

---

### 3. Backend Setup

```bash
cd apps/api

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start the API server (runs on port 5000)
npm start
```

---

### 4. Frontend Setup

```bash
cd apps/web

# Install dependencies
npm install

# Start Vite development server (runs on port 5173)
npm run dev
```

Open your browser at: `http://localhost:5173`

---

## 👥 System Accounts Directory

| Role | ID Number | Name |
| :--- | :--- | :--- |
| **Administrator** | `22100277` | Joel June Fabillar |
| **Registrar** | `EMP-2012-0051` | Dr. Maria Clara |
| **Canteen Personnel** | `EMP-2020-0042` | Ms. Elena Cruz |
| **Library Personnel** | `EMP-2018-0119` | Bro. Antonio Reyes |
| **Student / Parent** | `STU-2026-0891` | Kyle Zenarosa |

> [!NOTE]
> Passwords and credentials are managed privately by institutional administrators and are never published in public repositories. For authorized local testing, contact the development lead or authenticate using role switcher in development mode.

---

## 📁 Repository Structure

```
ISSRMS/
├── apps/
│   ├── api/                 # Express REST API, Argon2id auth, database pools
│   │   ├── src/
│   │   │   ├── adapters/    # Zone 1 Read-Only Institutional Adapter
│   │   │   ├── db/          # Connection pools & initial schemas
│   │   │   └── server.js    # Central server with all service endpoints
│   │   └── package.json
│   └── web/                 # React frontend (Vite, Tailwind CSS, Lucide icons)
│       ├── src/
│       │   ├── components/  # AppShell, Navigation, Skeletons, Modals
│       │   ├── context/     # AppContext (Role management, auth token)
│       │   └── pages/       # Home, Canteen, Library, Financial, Audit, etc.
│       └── package.json
├── database/                # Full MySQL schema & seed SQL dumps
│   ├── sjsm_institutional_zone1.sql
│   ├── sjsm_issrms_zone2.sql
│   └── README.md
├── packages/
│   └── shared/              # Shared schemas and utilities
├── .gitignore               # Monorepo git ignore rules
└── README.md
```

---

## 🛡️ Security Features
- **Argon2id Cryptographic Hashing**: Industry-standard password hashing with bcrypt fallback.
- **Role-Based Access Control (RBAC)**: Strict role gates on sensitive administrator and financial endpoints.
- **Double-Entry Financial Ledger**: Immutable transaction logging with balance integrity verification.
- **Tamper-Evident Audit Logging**: Comprehensive audit trail for system events, logins, and status mutations.
