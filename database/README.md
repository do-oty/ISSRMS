# Database Setup & Seed Instructions

This directory contains the complete MySQL schemas and seed datasets for the Saint Joseph School of Mactan Integrated Student Services & Resource Management System (ISSRMS).

---

## Files Included

1. **`sjsm_institutional_zone1.sql`**
   - Represents the school's read-only institutional records.
   - Contains: Enrolled students directory, grade levels, sections, institutional turnstile/gate entry logs.

2. **`sjsm_issrms_zone2.sql`**
   - Represents the ISSRMS operational double-entry ledger & services database.
   - Contains:
     - User accounts (`system_accounts`) with Argon2id cryptographic password hashes
     - Roles & permissions (Administrator, Registrar, Canteen Personnel, Library Personnel, Student/Parent)
     - E-wallets (`e_wallets`) and daily spending limits
     - Double-entry ledger transactions (`financial_transactions`)
     - Canteen menu items & POS inventory (`canteen_products`, `canteen_orders`)
     - Library books catalog & circulation records (`library_catalog`, `library_circulation`)
     - Official announcements (`system_announcements`)
     - Academic calendar events (`academic_events`)
     - Tamper-evident audit logs (`audit_logs`)
     - User notifications (`notification_logs`)

---

## Fast Import via MySQL CLI / XAMPP

Open Command Prompt or Terminal and run:

```bash
# Import Zone 1 Institutional Records
mysql -u root -p < sjsm_institutional_zone1.sql

# Import Zone 2 Operational Ledger & Services
mysql -u root -p < sjsm_issrms_zone2.sql
```
*(If your MySQL root user has no password, you can omit `-p`)*

---

## Fast Import via phpMyAdmin

1. Open phpMyAdmin (`http://localhost/phpmyadmin`).
2. Click the **Import** tab.
3. Choose `sjsm_institutional_zone1.sql` and click **Import**.
4. Repeat for `sjsm_issrms_zone2.sql`.
Both databases and all required tables, constraints, and data will be created automatically.
