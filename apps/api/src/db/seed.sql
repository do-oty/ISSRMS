-- Seed Script for Saint Joseph School of Mactan ISSRMS
USE sjsm_institutional_zone1;

INSERT INTO institutional_students (id_number, rfid_uid, first_name, last_name, grade_level, section, contact_number, parent_contact, enrollment_status)
VALUES 
('STU-2026-0891', '6A:9C:1D:3F', 'Kyle', 'Zenarosa', 'Grade 11', 'St. Benedict', '09171234567', '09181234567', 'Active'),
('STU-2026-0412', '1B:3D:5F:7A', 'Jose', 'Rizal', 'Grade 12', 'St. Francis', '09172345678', '09182345678', 'Active'),
('STU-2026-0922', '2C:4E:6A:8B', 'Samantha', 'Gomez', 'Grade 10', 'St. Scholastica', '09173456789', '09183456789', 'Active')
ON DUPLICATE KEY UPDATE enrollment_status=VALUES(enrollment_status);

INSERT INTO institutional_logging_records (id_number, log_type, location, timestamp)
VALUES 
('STU-2026-0891', 'Gate_Entry', 'Gate_1', '2026-10-10 07:15:22'),
('STU-2026-0891', 'Library_Entry', 'Library', '2026-10-10 09:42:10'),
('STU-2026-0891', 'Library_Exit', 'Library', '2026-10-10 10:35:48'),
('STU-2026-0412', 'Gate_Entry', 'Gate_2', '2026-10-10 07:22:15'),
('STU-2026-0922', 'Gate_Entry', 'Gate_1', '2026-10-10 07:28:44');


USE sjsm_issrms_zone2;

-- System Accounts (Passwords bcrypt hashed)
-- admin: admin123 ($2a$08$U.sX6qQnL2Uu2Eevr9gV..q1sF/rT9mIe3wWn3e9lE1tF7m0cI6yO)
INSERT INTO system_accounts (account_id, id_number, rfid_uid, password_hash, role, is_active, must_change_password)
VALUES 
(1, '22100277', NULL, '$2a$08$uT6rQnL2Uu2Eevr9gV..q1sF/rT9mIe3wWn3e9lE1tF7m0cI6yO', 'Administrator', TRUE, FALSE),
(2, 'EMP-2012-0051', NULL, '$2a$08$uT6rQnL2Uu2Eevr9gV..q1sF/rT9mIe3wWn3e9lE1tF7m0cI6yO', 'Registrar', TRUE, FALSE),
(3, 'EMP-2020-0042', NULL, '$2a$08$uT6rQnL2Uu2Eevr9gV..q1sF/rT9mIe3wWn3e9lE1tF7m0cI6yO', 'Canteen_Personnel', TRUE, FALSE),
(4, 'EMP-2018-0119', NULL, '$2a$08$uT6rQnL2Uu2Eevr9gV..q1sF/rT9mIe3wWn3e9lE1tF7m0cI6yO', 'Library_Personnel', TRUE, FALSE),
(5, 'STU-2026-0891', '6A:9C:1D:3F', '$2a$08$uT6rQnL2Uu2Eevr9gV..q1sF/rT9mIe3wWn3e9lE1tF7m0cI6yO', 'Student_Parent', TRUE, FALSE),
(6, 'STU-2026-0412', '1B:3D:5F:7A', '$2a$08$uT6rQnL2Uu2Eevr9gV..q1sF/rT9mIe3wWn3e9lE1tF7m0cI6yO', 'Student_Parent', TRUE, FALSE)
ON DUPLICATE KEY UPDATE is_active=VALUES(is_active);

-- Wallets
INSERT INTO e_wallets (wallet_id, account_id, wallet_type, credit_limit, credit_used)
VALUES 
(101, NULL, 'Cash_Collection', 0, 0),
(102, NULL, 'Canteen_Revenue', 0, 0),
(103, NULL, 'Credit_Receivable', 0, 0),
(104, NULL, 'Adjustment_Reserve', 0, 0),
(1, 5, 'Student', 300.00, 120.00),
(2, 6, 'Student', 200.00, 180.00)
ON DUPLICATE KEY UPDATE credit_limit=VALUES(credit_limit);

-- Financial Transactions Header
INSERT INTO financial_transactions (financial_transaction_id, transaction_code, transaction_type, transaction_status, initiated_by_account_id, supporting_reference)
VALUES 
(1, 'TXN-INIT-001', 'Top_Up', 'Posted', 3, 'OR-INIT-001'),
(2, 'TXN-INIT-002', 'Purchase', 'Posted', 3, 'POS-INIT-002')
ON DUPLICATE KEY UPDATE transaction_status=VALUES(transaction_status);

-- Balanced Ledger Entries: SUM(Debits) == SUM(Credits)
INSERT INTO financial_ledger_entries (ledger_entry_id, financial_transaction_id, wallet_id, entry_side, amount, entry_sequence)
VALUES 
(1, 1, 101, 'Debit', 500.00, 1),
(2, 1, 1, 'Credit', 500.00, 2),
(3, 2, 1, 'Debit', 50.00, 1),
(4, 2, 102, 'Credit', 50.00, 2)
ON DUPLICATE KEY UPDATE amount=VALUES(amount);

-- Canteen Products
INSERT INTO canteen_inventory (item_id, item_name, category, unit_price, stock_quantity, reorder_level, is_available)
VALUES 
(1, 'Fried Chicken w/ Rice', 'Meals', 65.00, 45, 10, TRUE),
(2, 'Pork Adobo Rice Bowl', 'Meals', 75.00, 38, 10, TRUE),
(3, 'Baked Macaroni w/ Toast', 'Snacks', 65.00, 22, 8, TRUE),
(4, 'Fresh Buko Juice Cup', 'Drinks', 25.00, 60, 15, TRUE),
(5, 'SJSM Premium Notebook', 'Stationery', 45.00, 30, 5, TRUE),
(6, 'Potato Chips Snack Pack', 'Snacks', 30.00, 55, 10, TRUE)
ON DUPLICATE KEY UPDATE stock_quantity=VALUES(stock_quantity);

-- Library Catalog
INSERT INTO library_catalog (book_id, accession_no, isbn, title, author, category, total_copies, available_copies)
VALUES 
(1, 'ACC-00129', '978-0134685991', 'Effective Java (3rd Edition)', 'Joshua Bloch', 'Computer Science', 5, 4),
(2, 'ACC-00142', '978-0132350884', 'Clean Code: A Handbook of Agile Software', 'Robert C. Martin', 'Computer Science', 4, 3),
(3, 'ACC-00210', '978-0262033848', 'Introduction to Algorithms (CLRS)', 'Cormen et al.', 'Mathematics', 3, 3)
ON DUPLICATE KEY UPDATE available_copies=VALUES(available_copies);

-- Library Circulation
INSERT INTO library_circulation (circulation_id, book_id, student_account_id, issued_by_account_id, borrow_date, due_date, fine_amount, fine_status, status)
VALUES 
(1, 1, 5, 4, '2026-10-01 09:00:00', '2026-10-15 17:00:00', 0.00, 'None', 'Borrowed'),
(2, 2, 6, 4, '2026-09-15 09:00:00', '2026-09-29 17:00:00', 45.00, 'Pending', 'Overdue')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Announcements
INSERT INTO system_announcements (announcement_id, author_account_id, title, content, category, audience_scope, is_pinned)
VALUES 
(1, 1, 'Official Deployment of the ISSRMS Portal', 'Welcome to the Integrated Student Services and Resource Management System (ISSRMS). This platform is now live for tracking canteen transactions, library logs, and RFID attendance.', 'Administrative', 'All', TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Immutable Audit Log
INSERT INTO audit_logs (log_id, actor_account_id, action_type, module, target_reference, ip_address, result, reason)
VALUES 
(1, 1, 'MYSQL_ZONE_BOOT', 'Admin', 'DB-XAMPP-3306', '127.0.0.1', 'Success', 'Successfully initialized MySQL Zone 1 & Zone 2 databases on port 3306.')
ON DUPLICATE KEY UPDATE result=VALUES(result);
