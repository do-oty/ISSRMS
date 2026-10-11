import { poolZone1, poolZone2 } from './src/db/pool.js';

async function seedData() {
  console.log('Seeding comprehensive data into Zone 1 & Zone 2 MySQL...');

  // 1. Zone 1 Turnstile Logging Records (Rich logging history)
  const additionalLogs = [
    ['STU-2026-0891', 'Gate_Entry', 'Gate_1', '2026-10-10 07:12:30'],
    ['STU-2026-0891', 'Gate_Exit', 'Gate_1', '2026-10-10 16:45:10'],
    ['STU-2026-0891', 'Gate_Entry', 'Gate_1', '2026-10-11 07:05:14'],
    ['STU-2026-0891', 'Library_Entry', 'Library', '2026-10-11 09:30:00'],
    ['STU-2026-0891', 'Library_Exit', 'Library', '2026-10-11 11:15:20'],
    ['STU-2026-0412', 'Gate_Entry', 'Gate_2', '2026-10-10 07:25:00'],
    ['STU-2026-0412', 'Gate_Exit', 'Gate_2', '2026-10-10 17:00:00'],
    ['STU-2026-0412', 'Gate_Entry', 'Gate_2', '2026-10-11 07:18:00'],
    ['STU-2026-0412', 'Library_Entry', 'Library', '2026-10-11 13:10:00'],
    ['STU-2026-0412', 'Library_Exit', 'Library', '2026-10-11 14:05:00'],
    ['STU-2026-0922', 'Gate_Entry', 'Gate_1', '2026-10-10 07:35:10'],
    ['STU-2026-0922', 'Gate_Exit', 'Gate_1', '2026-10-10 16:30:00'],
    ['STU-2026-0922', 'Gate_Entry', 'Gate_1', '2026-10-11 07:10:55'],
    ['STU-2026-0922', 'Library_Entry', 'Library', '2026-10-11 10:00:00'],
    ['STU-2026-0922', 'Library_Exit', 'Library', '2026-10-11 11:45:00'],
  ];

  for (const log of additionalLogs) {
    const [ex] = await poolZone1.query('SELECT log_id FROM institutional_logging_records WHERE id_number = ? AND timestamp = ?', [log[0], log[3]]);
    if (ex.length === 0) {
      await poolZone1.query('INSERT INTO institutional_logging_records (id_number, log_type, location, timestamp) VALUES (?, ?, ?, ?)', log);
    }
  }

  // 2. Zone 2 Announcements
  const announcements = [
    [1, 'Official Deployment of the ISSRMS Portal', 'Welcome to the Integrated Student Services and Resource Management System (ISSRMS). This platform is now live for tracking canteen transactions, library loans, and RFID gate turnstile logs. Please report any anomalies directly to the IT Department.', 'Administrative', 'All', 'Active', 1, '2026-10-10 08:00:00'],
    [1, 'Midterm Examination Schedule & Library Hours', 'The High School Library will extend study hours until 6:00 PM during the Midterm Examination week (October 15-20, 2026). Please ensure all overdue book fines are settled at the circulation counter before exams.', 'Academic', 'All', 'Active', 0, '2026-10-11 02:00:00'],
    [1, 'Annual Intramurals 2026 Opening Ceremony', 'Join us on Friday at the Saint Joseph Quadrangle for the opening ceremony of Intramurals 2026. PE uniforms are required. Canteen counter kiosks will operate special lunch combos.', 'Event', 'All', 'Active', 0, '2026-10-11 03:00:00'],
    [1, 'Canteen E-Wallet Credit Settlement Reminder', 'Parents and students are reminded to settle outstanding canteen emergency credit with the Cashier / Registrar by the 15th of the month. Settle-to-Zero is available during office hours.', 'Administrative', 'All', 'Active', 0, '2026-10-09 10:00:00']
  ];

  for (const a of announcements) {
    const [ex] = await poolZone2.query('SELECT announcement_id FROM system_announcements WHERE title = ?', [a[1]]);
    if (ex.length === 0) {
      await poolZone2.query('INSERT INTO system_announcements (author_account_id, title, content, category, audience_scope, status, is_pinned, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', a);
    }
  }

  // 3. Zone 2 Notification Logs
  const notifications = [
    [5, 'Top_Up_Success', 'Your canteen e-wallet has been credited with ₱200.00 via Cash Deposit (Ref: TXN-TOPUP-001). Available balance: ₱450.00.'],
    [5, 'Book_Due', 'Reminder: "Clean Code: A Handbook of Agile Software" is due in 3 days. Please return or renew at the Library counter.'],
    [5, 'System', 'Welcome to ISSRMS! Your student RFID account is active.'],
    [6, 'Overdue_Fine', 'Your loan of "Design Patterns" is 3 days overdue. Fine assessed: ₱15.00.'],
    [1, 'System', 'Audit log rotation check completed. Database running normally.']
  ];

  for (const n of notifications) {
    const [ex] = await poolZone2.query('SELECT notification_id FROM notification_logs WHERE account_id = ? AND message = ?', [n[0], n[2]]);
    if (ex.length === 0) {
      await poolZone2.query('INSERT INTO notification_logs (account_id, type, message, is_read) VALUES (?, ?, ?, 0)', n);
    }
  }

  // 4. Zone 2 Audit Logs (Fill real database records)
  const auditEntries = [
    [1, 'LOGIN_SUCCESS', 'Auth', '22100277', '127.0.0.1', 'Success', 'Administrator logged into the portal'],
    [2, 'CREDIT_LIMIT_UPDATE', 'Finance', 'STU-2026-0891', '127.0.0.1', 'Success', 'Updated credit ceiling to ₱300.00 for Kyle Zenarosa'],
    [3, 'WALLET_TOPUP', 'Finance', 'OR-TOPUP-889', '127.0.0.1', 'Success', 'Processed cash deposit of ₱200.00 for student STU-2026-0891'],
    [3, 'CANTEEN_PURCHASE', 'Canteen', 'SALE-1011-01', '127.0.0.1', 'Success', 'POS checkout: ₱75.00 (Cash: ₱75.00, Credit: ₱0.00) for STU-2026-0891'],
    [4, 'LIBRARY_LOAN_ISSUED', 'Library', 'CIRC-1', '127.0.0.1', 'Success', 'Issued "Effective Java" to STU-2026-0891'],
    [2, 'CREDIT_SETTLED_TO_ZERO', 'Finance', 'OR-SETTLE-001', '127.0.0.1', 'Success', 'Settle-to-Zero executed for STU-2026-0412 under receipt OR-9901'],
    [1, 'ACCOUNT_PROVISIONED', 'Admin', 'STU-2026-0922', '127.0.0.1', 'Success', 'Provisioned Zone 2 account for Samantha Gomez']
  ];

  for (const ae of auditEntries) {
    const [ex] = await poolZone2.query('SELECT log_id FROM audit_logs WHERE target_reference = ? AND action_type = ?', [ae[3], ae[1]]);
    if (ex.length === 0) {
      await poolZone2.query('INSERT INTO audit_logs (actor_account_id, action_type, module, target_reference, ip_address, result, reason) VALUES (?, ?, ?, ?, ?, ?, ?)', ae);
    }
  }

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seedData().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
