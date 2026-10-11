-- ============================================================================
-- ISSRMS DATABASE ENGINE-LEVEL SECURITY & PERIMETER HARDENING
-- Restricts MySQL user privileges so bad actors can never manipulate databases
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ZONE 1 INSTITUTIONAL USER (STRICTLY READ-ONLY)
-- Even with compromised server credentials, this user cannot INSERT/UPDATE/DELETE/DROP
-- ----------------------------------------------------------------------------
CREATE USER IF NOT EXISTS 'issrms_zone1_reader'@'localhost' IDENTIFIED BY 'Zone1ReadSecret2026!';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'issrms_zone1_reader'@'localhost';

-- Physical MySQL grant: SELECT ONLY
GRANT SELECT ON sjsm_institutional_zone1.* TO 'issrms_zone1_reader'@'localhost';

-- ----------------------------------------------------------------------------
-- 2. ZONE 2 OPERATIONAL APP USER (LEAST PRIVILEGE)
-- Can read and write ISSRMS data, but CANNOT DROP tables or access Zone 1
-- ----------------------------------------------------------------------------
CREATE USER IF NOT EXISTS 'issrms_zone2_app'@'localhost' IDENTIFIED BY 'Zone2AppSecret2026!';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'issrms_zone2_app'@'localhost';

-- Physical MySQL grant: Operational CRUD only (No DROP, No ALTER, No GRANT)
GRANT SELECT, INSERT, UPDATE ON sjsm_issrms_zone2.* TO 'issrms_zone2_app'@'localhost';

-- ----------------------------------------------------------------------------
-- 3. REVOKE DANGEROUS SYSTEM-LEVEL ADMINISTRATIVE PRIVILEGES
-- Disables dangerous remote file writes, process inspection, and server shutdown
-- ----------------------------------------------------------------------------
REVOKE FILE, PROCESS, SUPER, SHUTDOWN ON *.* FROM 'issrms_zone1_reader'@'localhost';
REVOKE FILE, PROCESS, SUPER, SHUTDOWN ON *.* FROM 'issrms_zone2_app'@'localhost';

FLUSH PRIVILEGES;

-- ----------------------------------------------------------------------------
-- 4. MYSQL SERVER DAEMON CONFIGURATION NOTE (my.ini)
-- To completely block remote internet access to port 3306, ensure in my.ini:
-- [mysqld]
-- bind-address = 127.0.0.1
-- skip-networking = 0
-- ============================================================================
