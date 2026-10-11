/**
 * Zone 1 Institutional Read-Only Adapter
 * Enforces the strict capstone architectural rule:
 * REQ-5.3-5: Read-only access only. No INSERT, UPDATE, DELETE operations permitted against Zone 1.
 * Connects directly and exclusively to MySQL sjsm_institutional_zone1 (zero mock fallbacks).
 */

import { poolZone1 } from '../db/pool.js';

class Zone1ReadOnlyAdapter {
  /**
   * Safe lookup by Student ID Number directly from MySQL sjsm_institutional_zone1
   */
  async findStudentById(idNumber) {
    if (!idNumber) return null;
    const cleanId = String(idNumber).trim().toUpperCase();

    const [rows] = await poolZone1.query(
      'SELECT id_number, rfid_uid, first_name, last_name, grade_level, section, contact_number, parent_contact, enrollment_status, photo_url FROM institutional_students WHERE UPPER(id_number) = ?',
      [cleanId]
    );

    return rows && rows.length > 0 ? { ...rows[0] } : null;
  }

  /**
   * Safe lookup by RFID UID directly from MySQL sjsm_institutional_zone1
   */
  async findStudentByRfid(rfidUid) {
    if (!rfidUid) return null;
    const cleanUid = String(rfidUid).trim().toUpperCase();

    const [rows] = await poolZone1.query(
      'SELECT id_number, rfid_uid, first_name, last_name, grade_level, section, contact_number, parent_contact, enrollment_status, photo_url FROM institutional_students WHERE UPPER(rfid_uid) = ?',
      [cleanUid]
    );

    return rows && rows.length > 0 ? { ...rows[0] } : null;
  }

  /**
   * Fetch all institutional students from MySQL Zone 1 (for Account Provisioning)
   */
  async getAllStudents() {
    const [rows] = await poolZone1.query(
      'SELECT id_number, rfid_uid, first_name, last_name, grade_level, section, contact_number, parent_contact, enrollment_status FROM institutional_students ORDER BY last_name, first_name'
    );
    return rows || [];
  }

  /**
   * Get Institutional Turnstile & Gate Logs directly from MySQL sjsm_institutional_zone1
   */
  async getStudentLogs(idNumber) {
    if (!idNumber) return [];
    const cleanId = String(idNumber).trim().toUpperCase();

    const [rows] = await poolZone1.query(
      'SELECT log_id, id_number, log_type, location, timestamp FROM institutional_logging_records WHERE UPPER(id_number) = ? ORDER BY timestamp DESC',
      [cleanId]
    );

    return rows || [];
  }

  /**
   * Get all Institutional Logs (for Administrator and Registrar read-only monitoring)
   */
  async getAllLogs(filter = {}) {
    let query = 'SELECT log_id, id_number, log_type, location, timestamp FROM institutional_logging_records WHERE 1=1';
    const params = [];
    if (filter.location) {
      query += ' AND location = ?';
      params.push(filter.location);
    }
    if (filter.log_type) {
      query += ' AND log_type = ?';
      params.push(filter.log_type);
    }
    query += ' ORDER BY timestamp DESC LIMIT 200';

    const [rows] = await poolZone1.query(query, params);
    return rows || [];
  }

  /**
   * Strict Security Enforcer: Reject any write operation attempted on Zone 1
   */
  throwWriteViolation(operation) {
    throw new Error(`SECURITY VIOLATION [REQ-5.3-5]: Mutating operation '${operation}' is strictly prohibited on Zone 1.`);
  }

  async insertStudent() { this.throwWriteViolation('INSERT'); }
  async updateStudent() { this.throwWriteViolation('UPDATE'); }
  async deleteStudent() { this.throwWriteViolation('DELETE'); }
  async insertLog() { this.throwWriteViolation('INSERT'); }
}

export const zone1 = new Zone1ReadOnlyAdapter();
