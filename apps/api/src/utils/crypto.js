/**
 * ISSRMS Enterprise Cryptographic Security Engine
 * Implements salted hashing, hardware token protection, and encryption-at-rest.
 * 
 * 1. Password Security: Argon2id (Winner of Password Hashing Competition, OWASP recommended).
 *    - Automatically generates a cryptographically secure 16-byte random salt for EVERY password.
 * 2. Hardware Badge Protection: Salted HMAC-SHA256 for RFID UIDs.
 *    - Prevents card cloning if the database is dumped; raw RFID card serial numbers are never exposed.
 * 3. Sensitive Data Protection: AES-256-GCM authenticated encryption for student PII.
 * 4. Audit & Ledger Integrity: HMAC-SHA256 cryptographic signatures.
 */

import crypto from 'crypto';
import argon2 from 'argon2';

// Server-side pepper secrets (Loaded from environment in production)
const RFID_PEPPER = process.env.RFID_SALT_PEPPER || 'sjsm-rfid-hardware-pepper-key-2026-secure-salt';
const ENCRYPTION_KEY = Buffer.from(
  (process.env.APP_ENCRYPTION_KEY || 'sjsm-issrms-super-secret-key-2026-32b').padEnd(32, '0').slice(0, 32),
  'utf8'
);
const AUDIT_PEPPER = process.env.AUDIT_PEPPER || 'sjsm-audit-tamper-evident-chain-key-2026';

export const CryptographicEngine = {
  /**
   * 1. ARGON2ID PASSWORD HASHING (With Cryptographically Random Salt)
   * Argon2id automatically generates a random 128-bit salt per invocation.
   */
  async hashPassword(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a valid string.');
    }
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB RAM
      timeCost: 3,       // 3 iterations
      parallelism: 4,    // 4 threads
    });
  },

  async verifyPassword(hash, password) {
    if (!hash || !password) return false;
    try {
      if (hash.startsWith('$argon2')) {
        return await argon2.verify(hash, password);
      }
      return false;
    } catch (_) {
      return false;
    }
  },

  /**
   * 2. SALTED RFID HARDWARE BADGE HASHING (HMAC-SHA256)
   * Normalized UID + Server Pepper prevents database dump badge cloning.
   */
  hashRfidUid(rawRfidUid) {
    if (!rawRfidUid) return null;
    const normalized = String(rawRfidUid).trim().toUpperCase().replace(/[^A-F0-9]/g, '');
    return crypto
      .createHmac('sha256', RFID_PEPPER)
      .update(normalized)
      .digest('hex');
  },

  /**
   * Verify an RFID hardware scan against a stored salted hash in constant time
   */
  verifyRfidUid(scannedUid, storedHash) {
    if (!scannedUid || !storedHash) return false;
    const computedHash = this.hashRfidUid(scannedUid);
    const computedBuf = Buffer.from(computedHash, 'utf8');
    const storedBuf = Buffer.from(storedHash, 'utf8');
    if (computedBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(computedBuf, storedBuf);
  },

  /**
   * 3. AES-256-GCM AUTHENTICATED FIELD ENCRYPTION (For PII like Parent Contacts)
   * Encrypts sensitive personal data at rest. Format: iv:authTag:ciphertext
   */
  encryptSensitiveField(plaintext) {
    if (!plaintext) return null;
    const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(String(plaintext), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  },

  decryptSensitiveField(encryptedPayload) {
    if (!encryptedPayload || typeof encryptedPayload !== 'string') return encryptedPayload;
    if (!encryptedPayload.includes(':')) return encryptedPayload; // Plaintext fallback
    try {
      const [ivHex, authTagHex, cipherHex] = encryptedPayload.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (_) {
      return encryptedPayload; // Fallback if not encrypted in GCM format
    }
  },

  /**
   * 4. TAMPER-EVIDENT INTEGRITY SIGNATURE (For Financial & Audit Records)
   */
  generateTamperSignature(dataObject) {
    const serialized = JSON.stringify(dataObject, Object.keys(dataObject).sort());
    return crypto
      .createHmac('sha256', AUDIT_PEPPER)
      .update(serialized)
      .digest('hex');
  }
};
