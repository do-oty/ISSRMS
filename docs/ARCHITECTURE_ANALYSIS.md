# ISSRMS: Current vs. Future Implementation Architectural Analysis
**Saint Joseph School of Mactan — Integrated Student Services & Resource Management System**

This document details the exact engineering specification, data flow, component boundaries, and deployment roadmap for ISSRMS. It is structured so designers and groupmates can translate the architecture into UI flows, system diagrams, and presentation visualizers.

---

## 1. System Overview & The Split-Boundary Model

ISSRMS uses a **Split-Boundary Architectural Pattern** that separates public student-facing services from high-privilege employee school operations.

```mermaid
flowchart TB
    subgraph PUBLIC_INTERNET["🌐 Public Internet Zone (Untrusted)"]
        direction TB
        SP_WEB["Public Web App\n(React 19 + Vite + Tailwind)\nTarget: Students & Parents\nDevices: Smartphones, Home PCs"]
        CLOUD_DNS["Public Domain / CDN\n(e.g., portal.sjsm.edu.ph)"]
    end

    subgraph CAMPUS_LAN["🏫 School Campus Network / Intranet (Secured LAN)"]
        direction TB
        STAFF_DESK["Employee Desktop Client\n(Electron Desktop App)\nWorkstations: Admin, Registrar, Canteen POS, Library Desk"]
        API_SERVER["Central Backend API\n(Node.js + Express 5000)\nFirewall + Rate Limiter + JWT RBAC"]
        
        subgraph STORAGE["Database Tier"]
            ZONE1[("Zone 1: Institutional DB\n(sjsm_institutional_zone1)\nRead-Only Legacy Adapter")]
            ZONE2[("Zone 2: Operational DB\n(sjsm_issrms_zone2)\nDouble-Entry Ledger + CRUD")]
        end
    end

    SP_WEB -->|HTTPS / REST| CLOUD_DNS
    CLOUD_DNS -->|Reverse Proxy / Tunnel| API_SERVER
    STAFF_DESK -->|Internal LAN HTTP / TCP| API_SERVER
    API_SERVER -->|SELECT Only| ZONE1
    API_SERVER -->|Transactions / CRUD| ZONE2
```

---

## 2. Comparison Matrix: Current vs. Future Implementation

| Feature / Domain | Current Implementation (Completed) | Future Implementation (Target Production) |
| :--- | :--- | :--- |
| **Client Hosting** | Monolithic local dev client running on Vite (`:5173`) with mock role switcher. | **Split Clients:**<br>1. **Public Web**: Bundled for students, hosted on school domain (`portal.sjsm.edu.ph`).<br>2. **Desktop App**: Packaged via Electron for employee workstations. |
| **Role Access Boundary** | All 5 roles switchable via in-app UI switcher for local testing. | **Strict Boundary Enforcement:**<br>• Public Web restricts authentication strictly to `Student/Parent`.<br>• Employee roles accessible exclusively through the Electron desktop application. |
| **API Endpoint URLs** | Local dev proxy (`/api` -> `localhost:5000`). | Dynamic base URL (`import.meta.env.VITE_API_URL`):<br>• Relative `/api` behind reverse proxy on public domain.<br>• School server LAN IP in Electron desktop config. |
| **Canteen POS & RFID** | Simulated barcode/RFID tap, manual balance top-up, double-entry ledger calculation. | Hardware USB RFID reader & thermal receipt printer integration via Electron native Node serialport. |
| **Library Scanner** | Barcode input with book availability check, circulation ledger, Open Library API search fallback. | USB Barcode scanner plug-and-play input in Electron circulation desk window with automated overdue fine calculation. |
| **Campus Turnstile** | Direct database sync from Zone 1 turnstile logging records (`institutional_logging_records`). | Live WebSocket / MQTT broadcast from physical RFID turnstiles to real-time gate entry monitors. |
| **Financial Ledger** | Zone 2 double-entry accounting (`financial_transactions`) with debit/credit balance verification. | End-of-day automated reconciliation reports and exportable PDF audit ledgers for the accounting office. |
| **Audit Logs** | Live logging of authentication failures, event creations, and announcement publications into `audit_logs`. | Tamper-evident hash-chained logs with automated security alerts for repeated failed logins. |

---

## 3. Data Tier: Zone 1 vs. Zone 2 Invariant

A foundational requirement of the system is the complete separation between the school's legacy institutional records and the ISSRMS transactional ledger.

```mermaid
flowchart LR
    subgraph ZONE1_BOX["Zone 1: sjsm_institutional_zone1 (Strict Read-Only)"]
        direction TB
        Z1_STUDENTS["institutional_students\n(Master Student Directory,\nGrade Level, Section)"]
        Z1_LOGS["institutional_logging_records\n(Gate & Turnstile Timestamps,\nEntry/Exit Tracking)"]
    end

    subgraph ZONE2_BOX["Zone 2: sjsm_issrms_zone2 (Operational & CRUD)"]
        direction TB
        Z2_ACCOUNTS["system_accounts\n(Argon2id Hashes, RBAC Roles)"]
        Z2_WALLETS["e_wallets\n(Balances, Daily Spending Limits)"]
        Z2_LEDGER["financial_transactions\n(Immutable Double-Entry Ledger)"]
        Z2_CANTEEN["canteen_products & orders\n(Menu, Stock, Sales)"]
        Z2_LIBRARY["library_catalog & circulation\n(Books, Loans, Fines)"]
        Z2_ANNOUNCE["system_announcements\n(Pinned & Category Bulletins)"]
        Z2_EVENTS["academic_events\n(School Calendar & Deadlines)"]
        Z2_AUDIT["audit_logs\n(Immutable System Audit Trail)"]
    end

    API["ISSRMS API Engine"] -->|Read-Only Queries| ZONE1_BOX
    API -->|Read & Write / Transactions| ZONE2_BOX
```

### Invariant Rules
1. **Zero-Mutation on Zone 1:** The ISSRMS application never writes, alters, or drops any table in `sjsm_institutional_zone1`.
2. **Account Provisioning Bridge:** When a student is enrolled in Zone 1, Zone 2 generates their authenticated portal account, assigns their default Argon2id password, and creates their linked e-wallet account with a starting balance.
3. **Double-Entry Financial Guarantee:** No wallet balance can update without an accompanying record in `financial_transactions`.

---

## 4. Role-Based Feature Matrix

Use this breakdown to illustrate what each user type can view and execute:

```mermaid
flowchart TD
    USER["User Authentication"] --> DECISION{"Role Identified"}

    DECISION -->|Student / Parent| PORTAL["Public Student Portal (Web)\n• Academic Calendar & Deadlines\n• Official Bulletins & Circulars\n• E-Wallet Balance & Purchases\n• Library Book Catalog Search\n• Campus Gate Entry Logs"]
    
    DECISION -->|Employee / Staff| ELECTRON["Employee Desktop App (Electron LAN)\n• Admin: Full System Provisioning & Audit Trail\n• Registrar: Ledger Top-ups & Account Management\n• Canteen: Cashier POS & Stock Control\n• Library: Physical Circulation & Borrow/Return Desk"]
```

### Detailed Permissions Table

| Feature / Screen | Student / Parent (Public Web) | Canteen Staff (Electron) | Library Staff (Electron) | Registrar (Electron) | Administrator (Electron) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Home & Bulletins** | View | View | View | View | View & Publish |
| **Academic Calendar** | View | View | View | View | Add & Delete Events |
| **Canteen Menu & Orders** | View Menu & Purchases | Full POS Terminal | ❌ | ❌ | View Logs |
| **E-Wallet Cash Top-Up** | View Balance Only | Counter Top-Up | ❌ | Ledger Management | Full Ledger Audit |
| **Library Catalog Search** | Search & Availability | ❌ | Search & Management | ❌ | View |
| **Book Circulation (Borrow/Return)** | View Own Loans | ❌ | Check-in / Check-out | ❌ | View |
| **Gate / Turnstile Records** | View Own Logs | ❌ | ❌ | ❌ | View All Gate Logs |
| **User Provisioning & Reset** | ❌ | ❌ | ❌ | Student Sync | Full Admin Accounts |
| **Audit Logs** | ❌ | ❌ | ❌ | ❌ | Full Access |

---

## 5. Visualizer Guide for Groupmates

For groupmates designing mockups, system architecture slides, or interactive Figma prototypes, organize the visualizer into **three core presentation panels**:

### Panel 1: The Public Student Mobile/Web Experience
* **Device Frame:** Smartphone or Modern Browser Window.
* **Header:** School Crest, Welcome greeting with student name, notification bell.
* **Main Feed:** Pinned official announcement card + filterable circulars with colored badges.
* **Side Cards:**
  * **Interactive Calendar:** Highlights current date (Oct 11) and upcoming academic milestones.
  * **Digital Pass / Wallet Widget:** Display of current balance, daily allowance limit, and recent transactions.
  * **Turnstile Card:** Real-time log of the student's latest gate entry/exit times.

### Panel 2: The Employee Electron Desktop Stations
* **Device Frame:** Desktop Application Frame (Electron window headers).
* **Workstation Views:**
  1. **Canteen POS Terminal:** Grid of food items with category pills, quick-add keypad, cart summary, and RFID student scanner prompt.
  2. **Library Circulation Desk:** Barcode scanner input, active borrowing ledger with due dates, and circulation return status badges.
  3. **Financial Ledger View:** Double-entry journal showing debit/credit records, student account search, and receipt print dialog.
  4. **Admin Security Center:** Real-time tamper-evident audit logs table with role indicators, event scheduler modal, and account provisioning toggle.

### Panel 3: The Data & Security Pipeline
* **Visual Components:**
  * Client layer (Public Web vs. Electron Local).
  * API Firewall layer (Input Sanitization, Rate Limiter, Argon2id Verification).
  * Database separation (Zone 1 Legacy Read-Only vs. Zone 2 Operational Read/Write).
  * Flow lines displaying cryptographic token validation (JWT 8-hour expiry).
