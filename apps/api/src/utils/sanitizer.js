/**
 * Input Sanitization & Parameterization Helpers
 * Enforces REQ-5.3-3: "Input values shall be validated and parameterized before database use."
 */

import validator from 'validator';

export class InputSanitizer {
  /**
   * Cleans text fields: strips HTML/script tags, trims whitespace
   */
  static sanitizeString(input, maxLength = 255) {
    if (typeof input !== 'string') return '';
    // Strip HTML tags and normalize
    const stripped = validator.stripLow(validator.escape(input.trim()));
    return stripped.slice(0, maxLength);
  }

  /**
   * Validates and normalizes ID Numbers (e.g. STU-2026-0891, EMP-2012-0051, 22100277)
   */
  static sanitizeIdNumber(id) {
    if (!id || typeof id !== 'string') return null;
    const clean = id.trim().toUpperCase();
    // Allow letters, numbers, and hyphens only
    if (/^[A-Z0-9\-]{4,30}$/.test(clean)) {
      return clean;
    }
    return null;
  }

  /**
   * Validates and normalizes RFID UID (e.g., 6A:9C:1D:3F, E200-0019)
   */
  static sanitizeRfidUid(uid) {
    if (!uid || typeof uid !== 'string') return null;
    const clean = uid.trim().toUpperCase();
    if (/^[A-Z0-9:\-]{4,64}$/.test(clean)) {
      return clean;
    }
    return null;
  }

  /**
   * Validates positive monetary amount (2 decimal places)
   */
  static sanitizeAmount(amount) {
    const num = Number(amount);
    if (isNaN(num) || num <= 0 || !isFinite(num)) {
      return null;
    }
    // Round to 2 decimal places to prevent floating point exploit
    return Math.round(num * 100) / 100;
  }

  /**
   * Validates positive integer (quantities, item IDs)
   */
  static sanitizeInteger(val) {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      return null;
    }
    return num;
  }
}
