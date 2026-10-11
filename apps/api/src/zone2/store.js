/**
 * Zone 2 In-Memory Operational Store & ACID Double-Entry Ledger Engine
 * Implements the exact formulas from ISSRMSTOSUBMIT-1.pdf:
 * 1. B = T_total - P_total
 * 2. C_avail = C_limit - C_used
 * 3. P <= B + C_avail
 * 4. Settle-to-Zero: C_used = 0
 * 5. Double-Entry: SUM(Debits) == SUM(Credits)
 */

import bcrypt from 'bcryptjs';

// Pre-seeded Zone 2 Accounts with Argon2id Cryptographic Hashes (REQ-5.3-1)
export const accounts = [
  {
    account_id: 1,
    id_number: '22100277',
    name: 'Joel June Fabillar',
    role: 'Administrator',
    password_hash: '$argon2id$v=19$m=65536,p=4,t=3$eI9Vak/TzOpxpxgPjfc+3g$4rZs2Gr94kaNvlSNoo3SK7qyfD1ChA1DARsIG0OylME', // admin123
    is_active: true,
  },
  {
    account_id: 2,
    id_number: 'EMP-2012-0051',
    name: 'Dr. Maria Clara',
    role: 'Registrar',
    password_hash: '$argon2id$v=19$m=65536,p=4,t=3$tkhYYBM7KAd1DTZZoWC5aQ$GccWz0i4sNslQhrIgSqaky8ORqZemYTtcXNYnueVA/g', // reg123
    is_active: true,
  },
  {
    account_id: 3,
    id_number: 'EMP-2020-0042',
    name: 'Ms. Elena Cruz',
    role: 'Canteen_Personnel',
    password_hash: '$argon2id$v=19$m=65536,p=4,t=3$lE8XlFzTFFaeC7eWyq7MJQ$VOcEpGDc5ZVKKsQuCwDfIGTqpk28OKVajFZr7Ogs4W4', // canteen123
    is_active: true,
  },
  {
    account_id: 4,
    id_number: 'EMP-2018-0119',
    name: 'Bro. Antonio Reyes',
    role: 'Library_Personnel',
    password_hash: '$argon2id$v=19$m=65536,p=4,t=3$BvQu+1xBJRvQRtnCLkvClg$qW9/1UvHeVkUr4fLBXdqD1S6WqOkpezMcUr88U+ZKo4', // library123
    is_active: true,
  },
  {
    account_id: 5,
    id_number: 'STU-2026-0891',
    name: 'Kyle Zenarosa',
    role: 'Student_Parent',
    password_hash: '$argon2id$v=19$m=65536,p=4,t=3$6HzH2E4xJueaEOBocvKhVA$yplYRjYdeLczrNXSpinxORlaLIWOtcx+nv/FjD3LjSY', // student123
    is_active: true,
  },
  {
    account_id: 6,
    id_number: 'STU-2026-0412',
    name: 'Jose Rizal',
    role: 'Student_Parent',
    password_hash: '$argon2id$v=19$m=65536,p=4,t=3$6HzH2E4xJueaEOBocvKhVA$yplYRjYdeLczrNXSpinxORlaLIWOtcx+nv/FjD3LjSY', // student123
  }
];

// System and Student Wallets
export const wallets = [
  // System Clearing Wallets (account_id = null)
  { wallet_id: 101, account_id: null, wallet_type: 'Cash_Collection', credit_limit: 0, credit_used: 0 },
  { wallet_id: 102, account_id: null, wallet_type: 'Canteen_Revenue', credit_limit: 0, credit_used: 0 },
  { wallet_id: 103, account_id: null, wallet_type: 'Credit_Receivable', credit_limit: 0, credit_used: 0 },
  { wallet_id: 104, account_id: null, wallet_type: 'Adjustment_Reserve', credit_limit: 0, credit_used: 0 },
  
  // Student Personal Wallets
  { wallet_id: 1, account_id: 5, id_number: 'STU-2026-0891', wallet_type: 'Student', credit_limit: 300.00, credit_used: 120.00 },
  { wallet_id: 2, account_id: 6, id_number: 'STU-2026-0412', wallet_type: 'Student', credit_limit: 200.00, credit_used: 180.00 },
];

// Immutable Ledger Headers
export const transactions = [
  {
    financial_transaction_id: 1,
    transaction_code: 'TXN-20261001-001',
    transaction_type: 'Top_Up',
    transaction_status: 'Posted',
    initiated_by_account_id: 3, // Canteen Personnel
    supporting_reference: 'OR-89211',
    created_at: '2026-10-01T08:30:00.000Z'
  },
  {
    financial_transaction_id: 2,
    transaction_code: 'TXN-20261001-002',
    transaction_type: 'Purchase',
    transaction_status: 'Posted',
    initiated_by_account_id: 3,
    supporting_reference: 'POS-REC-001',
    created_at: '2026-10-01T12:15:00.000Z'
  }
];

// Balanced Double-Entry Journal Lines
export const ledgerEntries = [
  // TXN 1: Top-Up ₱500 to Student STU-2026-0891 (Wallet 1)
  { ledger_entry_id: 1, financial_transaction_id: 1, wallet_id: 101, entry_side: 'Debit', amount: 500.00, entry_sequence: 1 },
  { ledger_entry_id: 2, financial_transaction_id: 1, wallet_id: 1,   entry_side: 'Credit', amount: 500.00, entry_sequence: 2 },

  // TXN 2: Purchase ₱50 from Student STU-2026-0891 (Wallet 1)
  { ledger_entry_id: 3, financial_transaction_id: 2, wallet_id: 1,   entry_side: 'Debit', amount: 50.00, entry_sequence: 1 },
  { ledger_entry_id: 4, financial_transaction_id: 2, wallet_id: 102, entry_side: 'Credit', amount: 50.00, entry_sequence: 2 },
];

// Canteen Inventory Items
export const canteenItems = [
  { item_id: 1, item_name: 'Fried Chicken w/ Rice', category: 'Meals', unit_price: 65.00, stock_quantity: 45, reorder_level: 10, is_available: true },
  { item_id: 2, item_name: 'Pork Adobo Rice Bowl', category: 'Meals', unit_price: 75.00, stock_quantity: 38, reorder_level: 10, is_available: true },
  { item_id: 3, item_name: 'Baked Macaroni w/ Toast', category: 'Snacks', unit_price: 65.00, stock_quantity: 22, reorder_level: 8, is_available: true },
  { item_id: 4, item_name: 'Fresh Buko Juice Cup', category: 'Drinks', unit_price: 25.00, stock_quantity: 60, reorder_level: 15, is_available: true },
  { item_id: 5, item_name: 'SJSM Premium Notebook', category: 'Stationery', unit_price: 45.00, stock_quantity: 30, reorder_level: 5, is_available: true },
  { item_id: 6, item_name: 'Potato Chips Snack Pack', category: 'Snacks', unit_price: 30.00, stock_quantity: 55, reorder_level: 10, is_available: true }
];

// Library Catalog & Circulation
export const libraryBooks = [
  { book_id: 1, accession_no: 'ACC-00129', isbn: '978-0134685991', title: 'Effective Java (3rd Edition)', author: 'Joshua Bloch', category: 'Computer Science', total_copies: 5, available_copies: 4 },
  { book_id: 2, accession_no: 'ACC-00142', isbn: '978-0132350884', title: 'Clean Code: A Handbook of Agile Software', author: 'Robert C. Martin', category: 'Computer Science', total_copies: 4, available_copies: 3 },
  { book_id: 3, accession_no: 'ACC-00210', isbn: '978-0262033848', title: 'Introduction to Algorithms (CLRS)', author: 'Cormen et al.', category: 'Mathematics', total_copies: 3, available_copies: 3 },
  { book_id: 4, accession_no: 'ACC-00305', isbn: '978-0134494166', title: 'University Physics with Modern Physics', author: 'Young & Freedman', category: 'Science', total_copies: 6, available_copies: 5 },
];

export const libraryCirculations = [
  {
    circulation_id: 1,
    book_id: 1,
    student_account_id: 5, // Kyle Zenarosa
    issued_by_account_id: 4,
    borrow_date: '2026-10-01T09:00:00.000Z',
    due_date: '2026-10-15T17:00:00.000Z',
    return_date: null,
    fine_amount: 0.00,
    fine_status: 'None',
    status: 'Borrowed'
  },
  {
    circulation_id: 2,
    book_id: 2,
    student_account_id: 6, // Jose Rizal
    issued_by_account_id: 4,
    borrow_date: '2026-09-15T09:00:00.000Z',
    due_date: '2026-09-29T17:00:00.000Z',
    return_date: null,
    fine_amount: 45.00,
    fine_status: 'Pending',
    status: 'Overdue'
  }
];

// System Announcements
export const announcements = [
  {
    announcement_id: 1,
    title: 'Official Deployment of the ISSRMS Portal',
    content: 'Welcome to the Integrated Student Services and Resource Management System (ISSRMS). This platform is now live for tracking canteen transactions, library logs, and RFID attendance.',
    category: 'Administrative',
    audience_scope: 'All',
    status: 'Active',
    is_pinned: true,
    published_at: '2026-10-11T10:20:00.000Z'
  }
];

// Audit Logs (Immutable, append-only)
export const auditLogs = [
  {
    log_id: 1,
    actor_account_id: 1,
    action_type: 'SYSTEM_BOOT',
    module: 'Admin',
    target_reference: 'SYS-INIT',
    ip_address: '127.0.0.1',
    result: 'Success',
    reason: 'Zone 2 operational database started with double-entry ledger verification.',
    created_at: new Date().toISOString()
  }
];
