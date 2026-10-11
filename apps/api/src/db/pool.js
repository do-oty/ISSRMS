/**
 * MySQL Database Pools - Hardened Configuration
 * Separate connection pools for Zone 1 (Read-Only) and Zone 2 (Operational CRUD)
 * Enforces multipleStatements: false to defeat stacked query injection
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Pool for Zone 1 (Institutional Legacy - Strictly Read-Only)
export const poolZone1 = mysql.createPool({
  host: process.env.ZONE1_DB_HOST || '127.0.0.1',
  port: Number(process.env.ZONE1_DB_PORT) || 3306,
  database: process.env.ZONE1_DB_NAME || 'sjsm_institutional_zone1',
  user: process.env.ZONE1_DB_USER || 'root',
  password: process.env.ZONE1_DB_PASS || '',
  waitForConnections: true,
  connectionLimit: Number(process.env.ZONE1_DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  multipleStatements: false, // Prevents stacked query injection attacks
  connectTimeout: 5000,
});

// Pool for Zone 2 (ISSRMS Operational - MySQL Read/Write)
export const poolZone2 = mysql.createPool({
  host: process.env.ZONE2_DB_HOST || '127.0.0.1',
  port: Number(process.env.ZONE2_DB_PORT) || 3306,
  database: process.env.ZONE2_DB_NAME || 'sjsm_issrms_zone2',
  user: process.env.ZONE2_DB_USER || 'root',
  password: process.env.ZONE2_DB_PASS || '',
  waitForConnections: true,
  connectionLimit: Number(process.env.ZONE2_DB_CONNECTION_LIMIT) || 20,
  queueLimit: 0,
  multipleStatements: false, // Prevents stacked query injection attacks
  connectTimeout: 5000,
});
