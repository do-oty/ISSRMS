-- ============================================================================
-- ISSRMS ZONE 1 & ZONE 2 DATABASE SCHEMA
-- Based on Saint Joseph School of Mactan Capstone Specification (ISSRMSTOSUBMIT-1.pdf)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ZONE 1: INSTITUTIONAL SOURCES (READ-ONLY ADAPTER ACCESS)
-- Existing Legacy School Database. ISSRMS NEVER WRITES, MODIFIES, OR INJECTS HERE.
-- ----------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS sjsm_institutional_zone1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sjsm_institutional_zone1;

CREATE TABLE IF NOT EXISTS institutional_students (
    id_number VARCHAR(50) PRIMARY KEY,
    rfid_uid VARCHAR(64) UNIQUE NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(20) NOT NULL,
    section VARCHAR(50) NOT NULL,
    contact_number VARCHAR(20) NULL,
    parent_contact VARCHAR(20) NULL,
    enrollment_status ENUM('Active', 'Inactive', 'Graduated', 'Transferred') DEFAULT 'Active',
    photo_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS institutional_logging_records (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_number VARCHAR(50) NOT NULL,
    log_type ENUM('Gate_Entry', 'Gate_Exit', 'Library_Entry', 'Library_Exit') NOT NULL,
    location ENUM('Gate_1', 'Gate_2', 'Library') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_time (id_number, timestamp),
    INDEX idx_location_time (location, timestamp)
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
-- 2. ZONE 2: ISSRMS OPERATIONAL DATABASE
-- Dedicated MySQL Database for ISSRMS Applications (Web, Desktop, POS)
-- ----------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS sjsm_issrms_zone2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sjsm_issrms_zone2;

-- Table 1: System Accounts (Zone 2 Credentials & Roles)
-- REQ-5.3-1: Clear-text passwords never stored (bcrypt/Argon2 hashed)
-- REQ-5.3-2: Strict Role-Based Access Control
CREATE TABLE IF NOT EXISTS system_accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    id_number VARCHAR(50) NOT NULL UNIQUE,       -- Validated logically against Zone 1
    rfid_uid VARCHAR(64) UNIQUE NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Student_Parent', 'Registrar', 'Canteen_Personnel', 'Library_Personnel', 'Administrator') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    must_change_password BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_rfid (rfid_uid)
) ENGINE=InnoDB;

-- Table 2: E-Wallets (Accounts & System-Owned Wallets)
-- Manages credit ceilings and approved credit liabilities
CREATE TABLE IF NOT EXISTS e_wallets (
    wallet_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NULL,                         -- NULL for system-owned clearing wallets
    wallet_type ENUM('Student', 'Cash_Collection', 'Canteen_Revenue', 'Credit_Receivable', 'Adjustment_Reserve') NOT NULL,
    credit_limit DECIMAL(10,2) DEFAULT 0.00,
    credit_used DECIMAL(10,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallet_account FOREIGN KEY (account_id) REFERENCES system_accounts(account_id) ON DELETE RESTRICT,
    INDEX idx_wallet_type (wallet_type)
) ENGINE=InnoDB;

-- Table 3: Financial Transactions (Immutable Header)
CREATE TABLE IF NOT EXISTS financial_transactions (
    financial_transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_code VARCHAR(64) NOT NULL UNIQUE,
    transaction_type ENUM('Top_Up', 'Purchase', 'Credit_Settlement', 'Adjustment', 'Reversal') NOT NULL,
    transaction_status ENUM('Pending', 'Posted', 'Rolled_Back') DEFAULT 'Posted',
    initiated_by_account_id INT NOT NULL,
    supporting_reference VARCHAR(100) NULL,
    reversal_of_transaction_id INT NULL,
    reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ft_initiator FOREIGN KEY (initiated_by_account_id) REFERENCES system_accounts(account_id),
    CONSTRAINT fk_ft_reversal FOREIGN KEY (reversal_of_transaction_id) REFERENCES financial_transactions(financial_transaction_id),
    INDEX idx_ft_code (transaction_code),
    INDEX idx_ft_date (created_at)
) ENGINE=InnoDB;

-- Table 4: Financial Ledger Entries (Double-Entry Balanced Journal Lines)
-- Invariant: For every finalized transaction, SUM(Debits) == SUM(Credits)
CREATE TABLE IF NOT EXISTS financial_ledger_entries (
    ledger_entry_id INT AUTO_INCREMENT PRIMARY KEY,
    financial_transaction_id INT NOT NULL,
    wallet_id INT NOT NULL,
    entry_side ENUM('Debit', 'Credit') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    entry_sequence INT NOT NULL,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fle_tx FOREIGN KEY (financial_transaction_id) REFERENCES financial_transactions(financial_transaction_id) ON DELETE RESTRICT,
    CONSTRAINT fk_fle_wallet FOREIGN KEY (wallet_id) REFERENCES e_wallets(wallet_id) ON DELETE RESTRICT,
    INDEX idx_fle_wallet (wallet_id),
    INDEX idx_fle_posted (posted_at)
) ENGINE=InnoDB;

-- Table 5: Canteen Inventory
CREATE TABLE IF NOT EXISTS canteen_inventory (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 10,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- Table 6: Canteen Sales
CREATE TABLE IF NOT EXISTS canteen_sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    sale_code VARCHAR(64) NOT NULL UNIQUE,
    student_account_id INT NOT NULL,
    cashier_account_id INT NOT NULL,
    financial_transaction_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    cash_paid DECIMAL(10,2) NOT NULL,
    credit_paid DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cs_student FOREIGN KEY (student_account_id) REFERENCES system_accounts(account_id),
    CONSTRAINT fk_cs_cashier FOREIGN KEY (cashier_account_id) REFERENCES system_accounts(account_id),
    CONSTRAINT fk_cs_ft FOREIGN KEY (financial_transaction_id) REFERENCES financial_transactions(financial_transaction_id)
) ENGINE=InnoDB;

-- Table 7: Canteen Sale Items
CREATE TABLE IF NOT EXISTS canteen_sale_items (
    sale_item_id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_csi_sale FOREIGN KEY (sale_id) REFERENCES canteen_sales(sale_id) ON DELETE CASCADE,
    CONSTRAINT fk_csi_item FOREIGN KEY (item_id) REFERENCES canteen_inventory(item_id)
) ENGINE=InnoDB;

-- Table 8: Library Catalog
CREATE TABLE IF NOT EXISTS library_catalog (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    accession_no VARCHAR(50) NOT NULL UNIQUE,
    isbn VARCHAR(20) NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_catalog_title (title)
) ENGINE=InnoDB;

-- Table 9: Library Circulation & Separately Managed Fines
-- Explicit Capstone Invariant: Library fines are NEVER deducted from the Canteen E-Wallet.
CREATE TABLE IF NOT EXISTS library_circulation (
    circulation_id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    student_account_id INT NOT NULL,
    issued_by_account_id INT NOT NULL,
    borrow_date DATETIME NOT NULL,
    due_date DATETIME NOT NULL,
    return_date DATETIME NULL,
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    fine_status ENUM('None', 'Pending', 'Settled', 'Waived') DEFAULT 'None',
    status ENUM('Borrowed', 'Returned', 'Overdue', 'Lost') DEFAULT 'Borrowed',
    fine_reason TEXT NULL,
    settled_by_account_id INT NULL,
    CONSTRAINT fk_lc_book FOREIGN KEY (book_id) REFERENCES library_catalog(book_id),
    CONSTRAINT fk_lc_student FOREIGN KEY (student_account_id) REFERENCES system_accounts(account_id),
    CONSTRAINT fk_lc_staff FOREIGN KEY (issued_by_account_id) REFERENCES system_accounts(account_id),
    CONSTRAINT fk_lc_settler FOREIGN KEY (settled_by_account_id) REFERENCES system_accounts(account_id),
    INDEX idx_lc_student (student_account_id),
    INDEX idx_lc_status (status)
) ENGINE=InnoDB;

-- Table 10: System Announcements
CREATE TABLE IF NOT EXISTS system_announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    author_account_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('All', 'Academic', 'Event', 'Administrative') DEFAULT 'All',
    audience_scope ENUM('All', 'Students', 'Staff') DEFAULT 'All',
    status ENUM('Draft', 'Active', 'Inactive') DEFAULT 'Active',
    is_pinned BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sa_author FOREIGN KEY (author_account_id) REFERENCES system_accounts(account_id)
) ENGINE=InnoDB;

-- Table 11: Notification Logs
CREATE TABLE IF NOT EXISTS notification_logs (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    type ENUM('Low_Balance', 'Top_Up_Success', 'Overdue_Fine', 'Book_Due', 'System') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nl_account FOREIGN KEY (account_id) REFERENCES system_accounts(account_id),
    INDEX idx_nl_account_read (account_id, is_read)
) ENGINE=InnoDB;

-- Table 12: Audit Logs (Immutable, Read-Only Stream)
-- REQ-4.7-6 & BR-13: Restricted strictly to Administrator accounts
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    actor_account_id INT NULL,
    action_type VARCHAR(100) NOT NULL,
    module ENUM('Auth', 'Finance', 'Canteen', 'Library', 'Admin', 'Institutional_Logs') NOT NULL,
    target_reference VARCHAR(100) NULL,
    ip_address VARCHAR(45) NULL,
    result ENUM('Success', 'Rejected', 'Failed') NOT NULL,
    reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_al_module (module),
    INDEX idx_al_created (created_at)
) ENGINE=InnoDB;
