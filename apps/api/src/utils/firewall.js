/**
 * ISSRMS Application Security Firewall & Perimeter Hardening
 * Intercepts malicious payloads before they ever reach the database layer.
 */

import { poolZone2 } from '../db/pool.js';

// Threat signatures for SQLi, XSS, and Path Traversal
const SUSPICIOUS_PATTERNS = [
  /(\b(UNION(\s+ALL)?|SELECT\s+.*\s+FROM|INSERT\s+INTO|DELETE\s+FROM|DROP\s+(TABLE|DATABASE)|ALTER\s+TABLE|INFORMATION_SCHEMA)\b)/i,
  /('|\b)(OR|AND)\s+('?\d+'?\s*=\s*'?\d+'?|true\s*=\s*true)/i,
  /(--|\/\*|\*\/|@@version|benchmark\s*\(|sleep\s*\()/i,
  /(\.\.\/|\.\.\\)/, // Directory Traversal
  /<script[\s>]/i,   // XSS injection
  /javascript:\s*/i
];

function inspectPayload(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') {
    return SUSPICIOUS_PATTERNS.some(regex => regex.test(value));
  }
  if (typeof value === 'object') {
    return Object.values(value).some(v => inspectPayload(v));
  }
  return false;
}

export function perimeterFirewall(req, res, next) {
  // 1. Inspect URL parameters, query strings, and body
  const isSuspicious = 
    inspectPayload(req.query) || 
    inspectPayload(req.params) || 
    inspectPayload(req.body);

  if (isSuspicious) {
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    console.warn(`[FIREWALL BLOCKED] Malicious probe intercepted from ${clientIp} on ${req.method} ${req.path}`);

    // Asynchronously log security event to audit_logs without blocking response
    poolZone2.query(
      `INSERT INTO audit_logs (actor_account_id, action_type, module, target_reference, ip_address, result, reason)
       VALUES (NULL, 'MALICIOUS_PROBE_BLOCKED', 'Admin', ?, ?, 'Rejected', ?)`,
      [req.path, clientIp, 'Perimeter firewall intercepted malicious SQLi/XSS payload before DB access']
    ).catch(() => {});

    return res.status(403).json({
      error: 'SECURITY VIOLATION: Request blocked by perimeter firewall.'
    });
  }

  next();
}
