// ── USERS ──────────────────────────────────────────
export const MOCK_USERS = [
  { id: 'EMP-1995-024', name: 'Sr. Mary Joseph, OSB',     rfid: '5F:8A:2C:9E', role: 'admin',              status: 'active' },
  { id: 'EMP-2012-0051', name: 'Dr. Maria Clara',           rfid: '7B:0D:2E:4A', role: 'registrar',          status: 'active' },
  { id: 'EMP-2018-0119', name: 'Bro. Antonio Reyes, OSB',   rfid: '8C:1E:3F:5B', role: 'library_personnel',  status: 'active' },
  { id: 'EMP-2020-0042', name: 'Ms. Elena Cruz',            rfid: '9D:2F:4A:6C', role: 'canteen_personnel',  status: 'active' },
  { id: 'STU-2026-0891', name: 'Kyle Zenarosa',             rfid: '6A:9C:1D:3F', role: 'student',            status: 'active' },
  { id: 'STU-2026-0412', name: 'Jose Rizal',                rfid: '1B:3D:5F:7A', role: 'student',            status: 'active' },
  { id: 'STU-2026-0922', name: 'Samantha Gomez',            rfid: '2C:4E:6A:8B', role: 'student',            status: 'active' },
  { id: 'EMP-2023-0078', name: 'Mr. Juan Dela Cruz',        rfid: '3D:5F:7B:9C', role: 'canteen_personnel',  status: 'inactive' },
]

// ── STUDENT WALLETS ───────────────────────────────
export const MOCK_WALLETS = {
  'STU-2026-0891': { balance: 450.00,  credit_limit: 300.00, credit_used: 120.00 },
  'STU-2026-0412': { balance: 280.00,  credit_limit: 200.00, credit_used: 180.00 },
  'STU-2026-0922': { balance: 1500.00, credit_limit: 500.00, credit_used: 0.00   },
}

// ── CANTEEN PRODUCTS ──────────────────────────────
export const CANTEEN_CATEGORIES = [
  { label: 'Meals',      key: 'Meals' },
  { label: 'Snacks',     key: 'Snacks' },
  { label: 'Drinks',     key: 'Drinks' },
  { label: 'Stationery', key: 'Stationery' },
]

export const CANTEEN_PRODUCTS = [
  { id: '1', name: 'Fried Chicken w/ Rice',          price: 65,  category: 'Meals',      stock: 45,  lowStock: 10, active: true },
  { id: '2', name: 'Pork Adobo Rice Bowl',            price: 75,  category: 'Meals',      stock: 38,  lowStock: 10, active: true },
  { id: '3', name: 'Baked Macaroni w/ Garlic Toast',  price: 65,  category: 'Snacks',     stock: 22,  lowStock: 8,  active: true },
  { id: '4', name: 'Fresh Buko Juice Cup',            price: 25,  category: 'Drinks',     stock: 60,  lowStock: 15, active: true },
  { id: '5', name: 'SJSM Premium Notebook',           price: 45,  category: 'Stationery', stock: 30,  lowStock: 5,  active: true },
  { id: '6', name: 'Premium Iced Coffee',             price: 50,  category: 'Drinks',     stock: 40,  lowStock: 10, active: true },
  { id: '7', name: 'Potato Chips Snack Pack',         price: 30,  category: 'Snacks',     stock: 55,  lowStock: 10, active: true },
  { id: '8', name: 'Official School Ballpen',         price: 15,  category: 'Stationery', stock: 80,  lowStock: 20, active: true },
  { id: '9', name: 'SJSM Uniform PE T-Shirt',         price: 280, category: 'Stationery', stock: 12,  lowStock: 5,  active: true },
  { id: '10', name: 'Cream-O Chocolate Sandwich',    price: 12,  category: 'Snacks',     stock: 0,   lowStock: 10, active: false },
]

// ── CANTEEN INVENTORY HISTORY ─────────────────────
export const MOCK_CANTEEN_INV_HISTORY = [
  { id: 'CIH-001', productId: '5', productName: 'SJSM Premium Notebook', type: 'stock_add',    qtyChange: +20, prevQty: 10, resultQty: 30, actor: 'EMP-2020-0042', timestamp: '2026-07-28T10:00:00', reason: 'Weekly delivery from supplier', ref: 'INV-20260728-001' },
  { id: 'CIH-002', productId: '9', productName: 'SJSM Uniform PE T-Shirt', type: 'stock_correct', qtyChange: -3, prevQty: 15, resultQty: 12, actor: 'EMP-2020-0042', timestamp: '2026-07-27T14:30:00', reason: 'Physical count correction — 3 missing from shelf', ref: 'INV-20260727-002' },
  { id: 'CIH-003', productId: '10', productName: 'Cream-O Chocolate Sandwich', type: 'deactivated', qtyChange: 0, prevQty: 0, resultQty: 0, actor: 'EMP-2020-0042', timestamp: '2026-07-25T09:00:00', reason: 'Discontinued item, stock depleted', ref: 'INV-20260725-003' },
]

// ── CANTEEN TRANSACTIONS ──────────────────────────
export const MOCK_CANTEEN_TRANSACTIONS = [
  { ref: 'CT-20260729-001', studentId: 'STU-2026-0891', type: 'topup',       amount: 200.00,  operator: 'EMP-2020-0042', date: '2026-07-29T08:24', notes: 'Cash over-the-counter' },
  { ref: 'CT-20260728-002', studentId: 'STU-2026-0891', type: 'purchase',    amount: 75.00,   operator: 'EMP-2020-0042', date: '2026-07-28T12:15', items: [{ id: '2', name: 'Pork Adobo Rice Bowl', qty: 1, price: 75 }], cashPortion: 75.00, creditPortion: 0 },
  { ref: 'CT-20260728-003', studentId: 'STU-2026-0891', type: 'purchase',    amount: 45.00,   operator: 'EMP-2020-0042', date: '2026-07-28T12:10', items: [{ id: '5', name: 'SJSM Premium Notebook', qty: 1, price: 45 }], cashPortion: 0, creditPortion: 45.00 },
  { ref: 'CT-20260727-004', studentId: 'STU-2026-0891', type: 'purchase',    amount: 50.00,   operator: 'EMP-2020-0042', date: '2026-07-27T10:45', items: [{ id: '6', name: 'Premium Iced Coffee', qty: 1, price: 50 }], cashPortion: 0, creditPortion: 50.00 },
  { ref: 'CT-20260726-005', studentId: 'STU-2026-0412', type: 'purchase',    amount: 65.00,   operator: 'EMP-2020-0042', date: '2026-07-26T11:30', items: [{ id: '1', name: 'Fried Chicken w/ Rice', qty: 1, price: 65 }], cashPortion: 65.00, creditPortion: 0 },
  { ref: 'CT-20260726-006', studentId: 'STU-2026-0412', type: 'purchase',    amount: 30.00,   operator: 'EMP-2020-0042', date: '2026-07-26T12:05', items: [{ id: '7', name: 'Potato Chips Snack Pack', qty: 1, price: 30 }], cashPortion: 0, creditPortion: 30.00 },
  { ref: 'CT-20260725-007', studentId: 'STU-2026-0412', type: 'topup',       amount: 500.00,  operator: 'EMP-2020-0042', date: '2026-07-25T09:15', notes: 'Cash over-the-counter' },
  { ref: 'CT-20260725-008', studentId: 'STU-2026-0922', type: 'topup',       amount: 1000.00, operator: 'EMP-2020-0042', date: '2026-07-25T14:00', notes: 'Cash over-the-counter' },
]

// ── FINANCIAL TRANSACTIONS (Registrar) ────────────
export const MOCK_FINANCIAL_TRANSACTIONS = [
  { ref: 'FIN-20260730-001', studentId: 'STU-2026-0891', type: 'topup',           amount: 200.00, operator: 'EMP-2012-0051', date: '2026-07-30T09:00', notes: 'Cash wallet top-up', result: 'Success', linkedRef: null },
  { ref: 'FIN-20260730-002', studentId: 'STU-2026-0891', type: 'credit_limit',    amount: 300.00, operator: 'EMP-2012-0051', date: '2026-07-30T09:15', notes: 'Set credit limit for SHS student', result: 'Success', linkedRef: null },
  { ref: 'FIN-20260730-003', studentId: 'STU-2026-0412', type: 'settlement',      amount: 180.00, operator: 'EMP-2012-0051', date: '2026-07-30T10:30', notes: 'Manual settlement per OR-8821', result: 'Success', linkedRef: null },
  { ref: 'FIN-20260729-004', studentId: 'STU-2026-0891', type: 'adjustment',      amount: -25.00, operator: 'EMP-2012-0051', date: '2026-07-29T14:00', notes: 'Certified adjustment — duplicate item charge', result: 'Success', linkedRef: 'CT-20260728-003' },
  { ref: 'FIN-20260728-005', studentId: 'STU-2026-0412', type: 'reversal',        amount: 30.00,  operator: 'EMP-2012-0051', date: '2026-07-28T16:00', notes: 'Reversal — incorrect credit charge', result: 'Success', linkedRef: 'CT-20260726-006' },
  { ref: 'FIN-20260728-006', studentId: 'STU-2026-0891', type: 'topup',           amount: 100.00, operator: 'EMP-2012-0051', date: '2026-07-28T11:00', notes: 'Cash wallet top-up', result: 'Success', linkedRef: null },
]

// ── LIBRARY CATALOG ───────────────────────────────
export const MOCK_CATALOG = [
  { id: '1',  title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', category: 'Science & Physics', available: true,  isbn: '9780132350884', published: '2008', pages: 464, shelf: 'Shelf CS-01', totalCopies: 5, copiesAvailable: 4, active: true, condition: 'Good', synopsis: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Software expert Robert C. Martin presents a revolutionary paradigm to distill agile craftsmanship and professional engineering values.' },
  { id: '2',  title: 'The Pragmatic Programmer: From Journeyman to Master', author: 'Andrew Hunt, David Thomas', category: 'Science & Physics', available: false, isbn: '9780201616224', published: '1999', pages: 352, shelf: 'Shelf CS-02', totalCopies: 4, copiesAvailable: 0, active: true, condition: 'Good', synopsis: 'Straight from the programming trenches, The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern development to examine the core process of crafting flexible, maintainable software.' },
  { id: '3',  title: 'Design Patterns: Elements of Reusable Object-Oriented Software', author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', category: 'Science & Physics', available: false, isbn: '9780201633610', published: '1994', pages: 416, shelf: 'Shelf CS-03', totalCopies: 3, copiesAvailable: 0, active: true, condition: 'Damaged', synopsis: 'Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions to commonly occurring design problems.' },
  { id: '4',  title: 'Calculus: Early Transcendentals', author: 'James Stewart', category: 'Mathematics', available: true,  isbn: '9780538497909', published: '2011', pages: 1344, shelf: 'Shelf M-01', totalCopies: 6, copiesAvailable: 5, active: true, condition: 'Good', synopsis: 'Renowned for its mathematical precision and accuracy, clarity of exposition, and outstanding examples and problem sets. Millions of students worldwide have explored calculus through Stewart’s trademark style.' },
  { id: '5',  title: 'Campbell Biology', author: 'Jane B. Reece, Lisa A. Urry', category: 'Chemistry & Biology', available: true,  isbn: '9780321558237', published: '2010', pages: 1464, shelf: 'Shelf B-04', totalCopies: 5, copiesAvailable: 5, active: true, condition: 'Good', synopsis: 'The world’s most successful biology textbook for science majors. Celebrated for its clear narrative, superior pedagogy, and innovative integration of text and figures.' },
  { id: '6',  title: 'A Short History of Nearly Everything', author: 'Bill Bryson', category: 'World History', available: true,  isbn: '9780767908177', published: '2003', pages: 544, shelf: 'Shelf H-02', totalCopies: 4, copiesAvailable: 4, active: true, condition: 'Good', synopsis: 'From primordial nothingness to civilization, Bill Bryson explores the most intriguing questions about how we got from there being nothing at all to there being us.' },
  { id: '7',  title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Literature', available: true,  isbn: '9780061120084', published: '2006', pages: 336, shelf: 'Shelf L-01', totalCopies: 6, copiesAvailable: 6, active: true, condition: 'Good', synopsis: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, exploring compassion and racial injustice in the American South.' },
  { id: '8',  title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Literature', available: true,  isbn: '9780743273565', published: '2004', pages: 180, shelf: 'Shelf L-02', totalCopies: 4, copiesAvailable: 4, active: true, condition: 'Good', synopsis: 'Set in Jazz Age New York, the novel depicts narrator Nick Carraway’s interactions with mysterious millionaire Jay Gatsby and Gatsby’s obsession to reunite with his former lover, Daisy Buchanan.' },
  { id: '9',  title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'World History', available: true,  isbn: '9780062316097', published: '2015', pages: 464, shelf: 'Shelf H-05', totalCopies: 2, copiesAvailable: 0, active: false, condition: 'Lost', synopsis: 'One hundred thousand years ago, at least six different species of humans inhabited Earth. Yet today there is only one: Homo sapiens. What happened to the others, and what may happen to us?' },
]

// ── LIBRARY INVENTORY HISTORY ─────────────────────
export const MOCK_LIBRARY_INV_HISTORY = [
  { id: 'LIH-001', bookId: '4', title: 'Calculus: Early Transcendentals', type: 'copy_add', qtyChange: +3, prevQty: 3, resultQty: 6, actor: 'EMP-2018-0119', timestamp: '2026-07-15T11:00:00', reason: 'New edition copies received from publisher', ref: 'LIB-INV-20260715-001' },
  { id: 'LIH-002', bookId: '9', title: 'Sapiens: A Brief History of Humankind', type: 'marked_lost', qtyChange: -1, prevQty: 1, resultQty: 0, actor: 'EMP-2018-0119', timestamp: '2026-07-20T09:00:00', reason: 'Reported lost by borrower, not returned', ref: 'LIB-INV-20260720-002' },
  { id: 'LIH-003', bookId: '1', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', type: 'copy_correct', qtyChange: +1, prevQty: 4, resultQty: 5, actor: 'EMP-2018-0119', timestamp: '2026-07-22T14:00:00', reason: 'Physical stock count — found extra copy on shelf', ref: 'LIB-INV-20260722-003' },
]

// ── LIBRARY CIRCULATION ───────────────────────────
export const MOCK_CIRCULATION = [
  { id: 'CIR-001', bookId: '2', studentId: 'STU-2026-0891', title: 'The Pragmatic Programmer: From Journeyman to Master', status: 'Overdue', borrowDate: '2026-06-29', dueDate: '2026-07-13', returnDate: null, daysOverdue: 12, fineAssessed: 50.00, fineStatus: 'unpaid', fineReason: 'Overdue — not returned, fine per circulation policy' },
  { id: 'CIR-002', bookId: '3', studentId: 'STU-2026-0412', title: 'Design Patterns: Elements of Reusable Object-Oriented Software', status: 'Overdue', borrowDate: '2026-06-10', dueDate: '2026-06-24', returnDate: null, daysOverdue: 31, fineAssessed: 50.00, fineStatus: 'unpaid', fineReason: 'Overdue — not returned, fine per circulation policy' },
  { id: 'CIR-003', bookId: '1', studentId: 'STU-2026-0891', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', status: 'Returned', borrowDate: '2026-06-10', dueDate: '2026-06-25', returnDate: '2026-07-01', daysOverdue: 6, fineAssessed: 50.00, fineStatus: 'unpaid', fineReason: 'Returned 6 days past due date, fine assessed' },
  { id: 'CIR-004', bookId: '4', studentId: 'STU-2026-0922', title: 'Calculus: Early Transcendentals', status: 'Returned', borrowDate: '2026-06-01', dueDate: '2026-06-15', returnDate: '2026-06-14', daysOverdue: 0, fineAssessed: 0, fineStatus: 'none', fineReason: null },
  { id: 'CIR-005', bookId: '7', studentId: 'STU-2026-0922', title: 'To Kill a Mockingbird', status: 'Active', borrowDate: '2026-07-25', dueDate: '2026-08-08', returnDate: null, daysOverdue: 0, fineAssessed: 0, fineStatus: 'none', fineReason: null },
  { id: 'CIR-006', bookId: '6', studentId: 'STU-2026-0412', title: 'A Short History of Nearly Everything', status: 'Active', borrowDate: '2026-07-28', dueDate: '2026-08-11', returnDate: null, daysOverdue: 0, fineAssessed: 0, fineStatus: 'none', fineReason: null },
]

// ── LOGGING RECORDS ───────────────────────────────
export const MOCK_LOGGING_RECORDS = [
  { id: 'LOG-001', studentId: 'STU-2026-0891', name: 'Kyle Zenarosa',     type: 'Gate Entry',    location: 'Gate 1',   date: '2026-07-29', timestamp: '07:18 AM' },
  { id: 'LOG-002', studentId: 'STU-2026-0891', name: 'Kyle Zenarosa',     type: 'Gate Exit',     location: 'Gate 2',   date: '2026-07-29', timestamp: '04:36 PM' },
  { id: 'LOG-003', studentId: 'STU-2026-0412', name: 'Jose Rizal',        type: 'Gate Entry',    location: 'Gate 1',   date: '2026-07-29', timestamp: '08:10 AM' },
  { id: 'LOG-004', studentId: 'STU-2026-0412', name: 'Jose Rizal',        type: 'Library Entry', location: 'Library',  date: '2026-07-29', timestamp: '10:12 AM' },
  { id: 'LOG-005', studentId: 'STU-2026-0412', name: 'Jose Rizal',        type: 'Library Exit',  location: 'Library',  date: '2026-07-29', timestamp: '11:03 AM' },
  { id: 'LOG-006', studentId: 'STU-2026-0922', name: 'Samantha Gomez',    type: 'Gate Entry',    location: 'Gate 2',   date: '2026-07-29', timestamp: '07:45 AM' },
  { id: 'LOG-007', studentId: 'STU-2026-0891', name: 'Kyle Zenarosa',     type: 'Library Entry', location: 'Library',  date: '2026-07-28', timestamp: '01:15 PM' },
  { id: 'LOG-008', studentId: 'STU-2026-0891', name: 'Kyle Zenarosa',     type: 'Library Exit',  location: 'Library',  date: '2026-07-28', timestamp: '03:30 PM' },
  { id: 'LOG-009', studentId: 'STU-2026-0412', name: 'Jose Rizal',        type: 'Gate Exit',     location: 'Gate 1',   date: '2026-07-29', timestamp: '05:00 PM' },
  { id: 'LOG-010', studentId: 'STU-2026-0922', name: 'Samantha Gomez',    type: 'Gate Exit',     location: 'Gate 2',   date: '2026-07-29', timestamp: '04:50 PM' },
]

// ── AUDIT LOGS ────────────────────────────────────
export const MOCK_AUDIT_LOGS = [
  // Auth
  { id: 'AUD-001', timestamp: '2026-07-30T08:00:00', actor: 'Sr. Mary Joseph, OSB', actorId: 'EMP-1995-024', role: 'Administrator', module: 'Authentication', action: 'Login', target: null, amount: null, result: 'Success', reason: null, before: null, after: null },
  { id: 'AUD-002', timestamp: '2026-07-30T07:55:00', actor: 'Kyle Zenarosa', actorId: 'STU-2026-0891', role: 'Student/Parent', module: 'Authentication', action: 'Failed Login', target: null, amount: null, result: 'Failed', reason: 'Incorrect password', before: null, after: null },
  { id: 'AUD-003', timestamp: '2026-07-30T07:50:00', actor: 'Sr. Mary Joseph, OSB', actorId: 'EMP-1995-024', role: 'Administrator', module: 'Authentication', action: 'Password Change', target: 'EMP-1995-024', amount: null, result: 'Success', reason: 'Scheduled rotation', before: null, after: null },
  { id: 'AUD-030', timestamp: '2026-07-30T14:30:00', actor: 'Kyle Zenarosa', actorId: 'STU-2026-0891', role: 'Student/Parent', module: 'Authentication', action: 'Password Reset', target: 'STU-2026-0891', amount: null, result: 'Success', reason: 'Password changed successfully', before: null, after: null },
  { id: 'AUD-031', timestamp: '2026-07-29T11:15:00', actor: 'Dr. Maria Clara', actorId: 'EMP-2012-0051', role: 'Registrar', module: 'Authentication', action: 'Password Reset', target: 'EMP-2012-0051', amount: null, result: 'Success', reason: 'Password changed successfully', before: null, after: null },
  { id: 'AUD-004', timestamp: '2026-07-29T16:00:00', actor: 'Samantha Gomez', actorId: 'STU-2026-0922', role: 'Student/Parent', module: 'Authentication', action: 'Denied Access', target: '/settings', amount: null, result: 'Denied', reason: 'Insufficient role', before: null, after: null },
  // Accounts
  { id: 'AUD-005', timestamp: '2026-07-30T09:00:00', actor: 'Sr. Mary Joseph, OSB', actorId: 'EMP-1995-024', role: 'Administrator', module: 'Accounts & RBAC', action: 'Account Created', target: 'STU-2026-0922', amount: null, result: 'Success', reason: 'New student registration', before: null, after: JSON.stringify({ id: 'STU-2026-0922', name: 'Samantha Gomez', role: 'student' }) },
  { id: 'AUD-006', timestamp: '2026-07-29T14:00:00', actor: 'Sr. Mary Joseph, OSB', actorId: 'EMP-1995-024', role: 'Administrator', module: 'Accounts & RBAC', action: 'Role Changed', target: 'EMP-2020-0042', amount: null, result: 'Success', reason: 'Reassignment from assistant to personnel', before: 'canteen_op', after: 'canteen_personnel' },
  { id: 'AUD-007', timestamp: '2026-07-28T10:00:00', actor: 'Sr. Mary Joseph, OSB', actorId: 'EMP-1995-024', role: 'Administrator', module: 'Accounts & RBAC', action: 'Account Deactivated', target: 'EMP-2023-0078', amount: null, result: 'Success', reason: 'Employment ended', before: null, after: null },
  // Financial
  { id: 'AUD-008', timestamp: '2026-07-30T09:00:00', actor: 'Dr. Maria Clara', actorId: 'EMP-2012-0051', role: 'Registrar', module: 'Financial Services', action: 'Wallet Top-Up', target: 'STU-2026-0891', amount: 200.00, result: 'Success', reason: 'Cash over-the-counter', before: '450.00', after: '650.00' },
  { id: 'AUD-009', timestamp: '2026-07-30T09:15:00', actor: 'Dr. Maria Clara', actorId: 'EMP-2012-0051', role: 'Registrar', module: 'Financial Services', action: 'Credit Limit Change', target: 'STU-2026-0891', amount: 300.00, result: 'Success', reason: 'Set credit limit for SHS student', before: '0.00', after: '300.00' },
  { id: 'AUD-010', timestamp: '2026-07-30T10:30:00', actor: 'Dr. Maria Clara', actorId: 'EMP-2012-0051', role: 'Registrar', module: 'Financial Services', action: 'Settlement', target: 'STU-2026-0412', amount: 180.00, result: 'Success', reason: 'Manual settlement per OR-8821', before: 'credit_used: 180.00', after: 'credit_used: 0.00' },
  { id: 'AUD-011', timestamp: '2026-07-29T14:00:00', actor: 'Dr. Maria Clara', actorId: 'EMP-2012-0051', role: 'Registrar', module: 'Financial Services', action: 'Adjustment', target: 'STU-2026-0891', amount: -25.00, result: 'Success', reason: 'Certified adjustment — duplicate item charge', before: 'credit_used: 120.00', after: 'credit_used: 95.00' },
  { id: 'AUD-012', timestamp: '2026-07-28T16:00:00', actor: 'Dr. Maria Clara', actorId: 'EMP-2012-0051', role: 'Registrar', module: 'Financial Services', action: 'Reversal', target: 'STU-2026-0412', amount: 30.00, result: 'Success', reason: 'Reversal — incorrect credit charge', before: 'credit_used: 210.00', after: 'credit_used: 180.00' },
  // Canteen
  { id: 'AUD-013', timestamp: '2026-07-29T08:24:00', actor: 'Ms. Elena Cruz', actorId: 'EMP-2020-0042', role: 'Canteen Personnel', module: 'Canteen', action: 'Cash Top-Up', target: 'STU-2026-0891', amount: 200.00, result: 'Success', reason: 'Over-the-counter cash top-up', before: '250.00', after: '450.00' },
  { id: 'AUD-014', timestamp: '2026-07-28T12:15:00', actor: 'Ms. Elena Cruz', actorId: 'EMP-2020-0042', role: 'Canteen Personnel', module: 'Canteen', action: 'POS Sale', target: 'STU-2026-0891', amount: 75.00, result: 'Success', reason: 'Pork Adobo Rice Bowl x1', before: null, after: 'ref: CT-20260728-002' },
  { id: 'AUD-015', timestamp: '2026-07-28T12:10:00', actor: 'Ms. Elena Cruz', actorId: 'EMP-2020-0042', role: 'Canteen Personnel', module: 'Canteen', action: 'POS Sale (Credit)', target: 'STU-2026-0891', amount: 45.00, result: 'Success', reason: 'SJSM Premium Notebook x1 (credit-funded)', before: 'credit_used: 75.00', after: 'credit_used: 120.00' },
  { id: 'AUD-016', timestamp: '2026-07-27T10:45:00', actor: 'Ms. Elena Cruz', actorId: 'EMP-2020-0042', role: 'Canteen Personnel', module: 'Canteen', action: 'Inventory Adjustment', target: 'Cream-O Choco', amount: null, result: 'Success', reason: 'Stock correction after physical count', before: 'stock: 15', after: 'stock: 12' },
  { id: 'AUD-017', timestamp: '2026-07-30T11:00:00', actor: 'Ms. Elena Cruz', actorId: 'EMP-2020-0042', role: 'Canteen Personnel', module: 'Canteen', action: 'Failed Purchase', target: 'STU-2026-0891', amount: 400.00, result: 'Failed', reason: 'Insufficient available cash + credit', before: 'balance: 450, credit_used: 120, limit: 300', after: null },
  // Library
  { id: 'AUD-018', timestamp: '2026-06-29T09:00:00', actor: 'Bro. Antonio Reyes, OSB', actorId: 'EMP-2018-0119', role: 'Library Personnel', module: 'Library', action: 'Borrow', target: 'CIR-001', amount: null, result: 'Success', reason: 'Principles of Organic Chemistry to STU-2026-0891', before: null, after: 'due: 2026-07-13' },
  { id: 'AUD-019', timestamp: '2026-07-01T14:00:00', actor: 'Bro. Antonio Reyes, OSB', actorId: 'EMP-2018-0119', role: 'Library Personnel', module: 'Library', action: 'Return', target: 'CIR-003', amount: null, result: 'Success', reason: 'Introduction to Advanced Physics returned', before: 'due: 2026-06-25', after: 'returned: 2026-07-01' },
  { id: 'AUD-020', timestamp: '2026-07-01T14:05:00', actor: 'Bro. Antonio Reyes, OSB', actorId: 'EMP-2018-0119', role: 'Library Personnel', module: 'Library', action: 'Fine Assessed', target: 'STU-2026-0891', amount: 50.00, result: 'Success', reason: 'Returned 6 days late per circulation policy', before: null, after: 'fine: 50.00' },
  { id: 'AUD-021', timestamp: '2026-07-24T11:00:00', actor: 'Bro. Antonio Reyes, OSB', actorId: 'EMP-2018-0119', role: 'Library Personnel', module: 'Library', action: 'Fine Adjusted', target: 'STU-2026-0412', amount: 50.00, result: 'Success', reason: 'Overdue penalty applied per 31 days overdue', before: 'fine: 0.00', after: 'fine: 50.00' },
  { id: 'AUD-022', timestamp: '2026-07-25T10:00:00', actor: 'Bro. Antonio Reyes, OSB', actorId: 'EMP-2018-0119', role: 'Library Personnel', module: 'Library', action: 'Fine Waived', target: 'STU-2019-0301', amount: 25.00, result: 'Success', reason: 'Waived for late return due to medical emergency', before: 'fine: 25.00', after: 'fine: 0.00' },
  // Announcements
  { id: 'AUD-023', timestamp: '2026-07-30T08:30:00', actor: 'Sr. Mary Joseph, OSB', actorId: 'EMP-1995-024', role: 'Administrator', module: 'Announcements', action: 'Created', target: 'ANN-20260730-001', amount: null, result: 'Success', reason: 'Start-of-year general assembly notice', before: null, after: null },
  { id: 'AUD-024', timestamp: '2026-07-29T16:00:00', actor: 'Sr. Mary Joseph, OSB', actorId: 'EMP-1995-024', role: 'Administrator', module: 'Announcements', action: 'Deactivated', target: 'ANN-20260715-002', amount: null, result: 'Success', reason: 'Event concluded', before: null, after: null },
  // Logging Records
  { id: 'AUD-025', timestamp: '2026-07-29T15:30:00', actor: 'Sr. Mary Joseph, OSB', actorId: 'EMP-1995-024', role: 'Administrator', module: 'Logging Records', action: 'Authorized Lookup', target: 'STU-2026-0891', amount: null, result: 'Success', reason: 'Routine attendance review', before: null, after: null },
  { id: 'AUD-026', timestamp: '2026-07-29T14:50:00', actor: 'Kyle Zenarosa', actorId: 'STU-2026-0891', role: 'Student/Parent', module: 'Logging Records', action: 'Denied Lookup', target: 'STU-2026-0412', amount: null, result: 'Denied', reason: 'Attempted cross-student record access', before: null, after: null },
  // System
  { id: 'AUD-027', timestamp: '2026-07-30T01:00:00', actor: 'System', actorId: 'SYSTEM', role: 'System', module: 'System', action: 'Backup Completed', target: null, amount: null, result: 'Success', reason: 'Scheduled nightly backup', before: null, after: null },
  { id: 'AUD-028', timestamp: '2026-07-29T11:00:00', actor: 'System', actorId: 'SYSTEM', role: 'System', module: 'System', action: 'Session Revoked', target: 'EMP-2023-0078', amount: null, result: 'Success', reason: 'Account deactivated — active sessions terminated', before: null, after: null },
  { id: 'AUD-029', timestamp: '2026-07-28T02:00:00', actor: 'System', actorId: 'SYSTEM', role: 'System', module: 'System', action: 'Restore Test', target: null, amount: null, result: 'Success', reason: 'Quarterly disaster recovery drill', before: null, after: null },
]

// ── ANNOUNCEMENTS ─────────────────────────────────
export const MOCK_ANNOUNCEMENTS = [
  { id: 'ANN-001', category: 'Academic',   title: 'First Quarter Examination Schedule Released', body: 'The first quarter examination schedule for AY 2026–2027 has been posted. Please check your section portal for the detailed timetable.',        date: '2026-07-29', pinned: true,  active: true,  author: 'EMP-1995-024' },
  { id: 'ANN-002', category: 'Event',      title: 'Buwan ng Wika Culminating Activity',           body: 'All students are invited to the Buwan ng Wika culminating activity on August 30, 2026 at the SJSM Gymnasium. Filipino attire is encouraged.',              date: '2026-07-28', pinned: false, active: true,  author: 'EMP-1995-024' },
  { id: 'ANN-004', category: 'Administrative',title: 'Library Clearance for Graduating Students', body: 'Graduating students are reminded to settle all library obligations and obtain clearance by August 15, 2026. Visit the Library Personnel for assistance.', date: '2026-07-26', pinned: true,  active: true,  author: 'EMP-1995-024' },
]

// ── NOTIFICATIONS ─────────────────────────────────
export const MOCK_NOTIFICATIONS = [
  { id: 'NOTIF-001', type: 'library',      title: 'Library Book Due Soon',         message: 'Introduction to Advanced Physics is due on July 13, 2026.',            date: '2026-07-11' },
  { id: 'NOTIF-002', type: 'library_fine',  title: 'Library Fine Reminder',         message: 'Outstanding fine of ₱50.00 for late return of Introduction to Advanced Physics.', date: '2026-07-01' },
  { id: 'NOTIF-003', type: 'wallet',        title: 'Low Wallet Balance',             message: 'Your e-wallet balance is below ₱100.00. Visit the Canteen Cash Top-Up Terminal.', date: '2026-07-28' },
  { id: 'NOTIF-004', type: 'canteen',       title: 'Canteen Top-Up Confirmed',       message: '₱200.00 has been added to your e-wallet via cash top-up.',            date: '2026-07-29' },
  { id: 'NOTIF-005', type: 'system',        title: 'System Maintenance Reminder',    message: 'ISSRMS will undergo scheduled maintenance on Sunday, August 2.',      date: '2026-07-30' },
  { id: 'NOTIF-006', type: 'announcement',  title: 'New School Announcement',        message: 'First Quarter Examination Schedule Released — check your portal.',    date: '2026-07-29' },
]

// ── HELPERS ───────────────────────────────────────
export function getStudentWallet(studentId) {
  return MOCK_WALLETS[studentId] || null
}

export function getStudentTransactions(studentId) {
  return MOCK_CANTEEN_TRANSACTIONS.filter(t => t.studentId === studentId)
}

export function getStudentCirculation(studentId) {
  return MOCK_CIRCULATION.filter(c => c.studentId === studentId)
}

export function getStudentLoggingRecords(studentId) {
  return MOCK_LOGGING_RECORDS.filter(l => l.studentId === studentId)
}

export function getAllLoggingRecords() {
  return MOCK_LOGGING_RECORDS
}

export function getStudentFinancialTransactions(studentId) {
  return MOCK_FINANCIAL_TRANSACTIONS.filter(t => t.studentId === studentId)
}

export function getUserById(id) {
  return MOCK_USERS.find(u => u.id === id) || null
}

export function getActiveStudents() {
  return MOCK_USERS.filter(u => u.role === 'student' && u.status === 'active')
}

export function generateRef(prefix) {
  const n = Math.floor(100000 + Math.random() * 900000)
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  return `${prefix}-${date}-${String(n).slice(0, 3)}`
}
