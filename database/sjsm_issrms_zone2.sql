-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: sjsm_issrms_zone2
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `sjsm_issrms_zone2`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `sjsm_issrms_zone2` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `sjsm_issrms_zone2`;

--
-- Table structure for table `academic_events`
--

DROP TABLE IF EXISTS `academic_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `academic_events` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('Academic','Campus Life','Finance','General') NOT NULL DEFAULT 'Academic',
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_events`
--

LOCK TABLES `academic_events` WRITE;
/*!40000 ALTER TABLE `academic_events` DISABLE KEYS */;
INSERT INTO `academic_events` VALUES (1,'Midterm Examinations Week','All High School departments. Extended study hours in Library until 6:00 PM.','Academic','2026-10-15','2026-10-20','2026-10-10 21:00:41'),(2,'Annual Intramurals 2026 Opening','Opening Ceremony at the Quadrangle. PE uniforms required.','Campus Life','2026-10-23','2026-10-23','2026-10-10 21:00:41'),(3,'Canteen Emergency Credit Clearance','Monthly clearance at Cashier and Registrar counters.','Finance','2026-10-30','2026-10-30','2026-10-10 21:00:41');
/*!40000 ALTER TABLE `academic_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `actor_account_id` int(11) DEFAULT NULL,
  `action_type` varchar(100) NOT NULL,
  `module` enum('Auth','Finance','Canteen','Library','Admin','Institutional_Logs') NOT NULL,
  `target_reference` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `result` enum('Success','Rejected','Failed') NOT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`log_id`),
  KEY `idx_al_module` (`module`),
  KEY `idx_al_created` (`created_at`),
  KEY `fk_al_actor` (`actor_account_id`),
  CONSTRAINT `fk_al_actor` FOREIGN KEY (`actor_account_id`) REFERENCES `system_accounts` (`account_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'MYSQL_ZONE_BOOT','Admin','DB-XAMPP-3306','127.0.0.1','Success','Successfully initialized MySQL Zone 1 & Zone 2 databases on port 3306.','2026-10-10 17:23:44'),(2,1,'LOGIN_SUCCESS','Auth','22100277','::1','Success','User signed in as admin','2026-10-10 18:04:18'),(3,1,'LOGIN_SUCCESS','Auth','22100277','::1','Success','User signed in as admin','2026-10-10 18:04:23'),(4,1,'LOGIN_SUCCESS','Auth','22100277','::1','Success','User signed in as admin','2026-10-10 18:04:28'),(5,1,'ACCOUNT_PROVISIONED','Admin','STU-2026-0922','::1','Success','Provisioned Student_Parent account for Samantha Gomez with temporary password. SMS dispatched to 09183456789.','2026-10-10 18:04:28'),(6,7,'LOGIN_SUCCESS','Auth','STU-2026-0922','::1','Success','User signed in as student','2026-10-10 18:04:33'),(7,7,'LOGIN_SUCCESS','Auth','STU-2026-0922','::1','Success','User signed in as student','2026-10-10 18:04:37'),(8,7,'PASSWORD_CHANGE','Auth','STU-2026-0922','::1','Success','Password changed and temporary status cleared.','2026-10-10 18:04:38'),(9,7,'LOGIN_SUCCESS','Auth','STU-2026-0922','::1','Success','User signed in as student','2026-10-10 18:04:44'),(10,1,'LOGIN_SUCCESS','Auth','22100277','::1','Success','User signed in as admin','2026-10-10 18:11:29'),(11,5,'LOGIN_SUCCESS','Auth','STU-2026-0891','::ffff:127.0.0.1','Success','User signed in as student','2026-10-10 18:14:00'),(12,3,'LOGIN_SUCCESS','Auth','EMP-2020-0042','::ffff:127.0.0.1','Success','User signed in as canteen_personnel','2026-10-10 18:15:02'),(13,4,'LOGIN_SUCCESS','Auth','EMP-2018-0119','::ffff:127.0.0.1','Success','User signed in as library_personnel','2026-10-10 18:20:53'),(14,NULL,'MALICIOUS_PROBE_BLOCKED','Admin','/api/v1/auth/roles-overview','::1','Rejected','Perimeter firewall intercepted malicious SQLi/XSS payload before DB access','2026-10-10 18:29:41'),(15,5,'LOGIN_SUCCESS','Auth','STU-2026-0891','::ffff:127.0.0.1','Success','User signed in as student','2026-10-10 18:30:52'),(16,5,'LOGIN_SUCCESS','Auth','STU-2026-0891','::ffff:127.0.0.1','Success','User signed in as student','2026-10-10 18:31:16'),(17,1,'LOGIN_SUCCESS','Auth','22100277','::ffff:127.0.0.1','Success','User signed in as admin','2026-10-10 18:31:21'),(18,1,'ACCOUNT_STATUS_TOGGLED','Admin','22100277','::ffff:127.0.0.1','Success','Account status set to INACTIVE','2026-10-10 18:31:52'),(19,1,'ACCOUNT_STATUS_TOGGLED','Admin','22100277','::ffff:127.0.0.1','Success','Account status set to ACTIVE','2026-10-10 18:32:00'),(20,1,'TEMP_PASSWORD_RESET','Admin','EMP-2018-0119','::ffff:127.0.0.1','Success','Administrator generated new temporary password','2026-10-10 18:32:11'),(21,2,'LOGIN_SUCCESS','Auth','EMP-2012-0051','::ffff:127.0.0.1','Success','User signed in as registrar','2026-10-10 18:34:52'),(22,4,'LOGIN_FAILED','Auth','EMP-2018-0119','::ffff:127.0.0.1','Rejected','Invalid password attempt','2026-10-10 18:35:00'),(23,4,'LOGIN_SUCCESS','Auth','EMP-2018-0119','::ffff:127.0.0.1','Success','User signed in as library_personnel','2026-10-10 18:35:03'),(24,4,'PASSWORD_CHANGE','Auth','EMP-2018-0119','::ffff:127.0.0.1','Success','Password changed and temporary status cleared.','2026-10-10 18:35:18'),(25,4,'LOGIN_FAILED','Auth','EMP-2018-0119','::ffff:127.0.0.1','Rejected','Invalid password attempt','2026-10-10 18:35:41'),(26,4,'LOGIN_FAILED','Auth','EMP-2018-0119','::ffff:127.0.0.1','Rejected','Invalid password attempt','2026-10-10 18:36:32'),(27,4,'LOGIN_FAILED','Auth','EMP-2018-0119','::ffff:127.0.0.1','Rejected','Invalid password attempt','2026-10-10 18:36:33'),(28,4,'LOGIN_FAILED','Auth','EMP-2018-0119','::ffff:127.0.0.1','Rejected','Invalid password attempt','2026-10-10 18:36:34'),(29,4,'LOGIN_FAILED','Auth','EMP-2018-0119','::ffff:127.0.0.1','Rejected','Invalid password attempt','2026-10-10 18:36:37'),(30,4,'LOGIN_FAILED','Auth','EMP-2018-0119','::ffff:127.0.0.1','Rejected','Invalid password attempt','2026-10-10 18:38:50'),(31,5,'SMS_PASSWORD_RECOVERY_SUCCESS','Auth','STU-2026-0891','::1','Success','Password successfully reset via SMS OTP verification','2026-10-10 18:38:52'),(32,5,'LOGIN_SUCCESS','Auth','STU-2026-0891','::1','Success','User signed in as student','2026-10-10 18:38:52'),(33,5,'SMS_PASSWORD_RECOVERY_SUCCESS','Auth','STU-2026-0891','::1','Success','Password successfully reset via SMS OTP verification','2026-10-10 18:38:52'),(34,5,'LOGIN_SUCCESS','Auth','STU-2026-0891','::ffff:127.0.0.1','Success','User signed in as student','2026-10-10 18:44:56'),(35,4,'SMS_PASSWORD_RECOVERY_SUCCESS','Auth','EMP-2018-0119','::1','Success','Password successfully reset via SMS OTP verification','2026-10-10 18:46:49'),(36,4,'LOGIN_SUCCESS','Auth','EMP-2018-0119','::1','Success','User signed in as library_personnel','2026-10-10 18:46:49'),(37,4,'SMS_PASSWORD_RECOVERY_SUCCESS','Auth','EMP-2018-0119','::1','Success','Password successfully reset via SMS OTP verification','2026-10-10 18:46:49'),(38,5,'LOGIN_SUCCESS','Auth','STU-2026-0891','::ffff:127.0.0.1','Success','User signed in as student','2026-10-10 18:49:37'),(39,3,'LOGIN_SUCCESS','Auth','EMP-2020-0042','::ffff:127.0.0.1','Success','User signed in as canteen_personnel','2026-10-10 19:07:42'),(40,5,'LOGIN_SUCCESS','Auth','STU-2026-0891','::ffff:127.0.0.1','Success','User signed in as student','2026-10-10 19:08:08'),(41,1,'LOGIN_SUCCESS','Auth','22100277','::ffff:127.0.0.1','Success','User signed in as admin','2026-10-10 20:19:40'),(42,2,'CREDIT_LIMIT_UPDATE','Finance','STU-2026-0891','127.0.0.1','Success','Updated credit ceiling to ₱300.00 for Kyle Zenarosa','2026-10-10 20:23:32'),(43,3,'WALLET_TOPUP','Finance','OR-TOPUP-889','127.0.0.1','Success','Processed cash deposit of ₱200.00 for student STU-2026-0891','2026-10-10 20:23:32'),(44,3,'CANTEEN_PURCHASE','Canteen','SALE-1011-01','127.0.0.1','Success','POS checkout: ₱75.00 (Cash: ₱75.00, Credit: ₱0.00) for STU-2026-0891','2026-10-10 20:23:32'),(45,4,'LIBRARY_LOAN_ISSUED','Library','CIRC-1','127.0.0.1','Success','Issued \"Effective Java\" to STU-2026-0891','2026-10-10 20:23:32'),(46,2,'CREDIT_SETTLED_TO_ZERO','Finance','OR-SETTLE-001','127.0.0.1','Success','Settle-to-Zero executed for STU-2026-0412 under receipt OR-9901','2026-10-10 20:23:32'),(47,1,'LOGIN_FAILED','Auth','22100277','::1','Rejected','Invalid password attempt','2026-10-10 20:35:42'),(48,1,'LOGIN_SUCCESS','Auth','22100277','::1','Success','User signed in as admin','2026-10-10 20:36:12'),(49,1,'LOGIN_SUCCESS','Auth','22100277','::1','Success','User signed in as admin','2026-10-10 20:36:20'),(50,1,'WALLET_TOPUP','Finance','FIN-TEST-01','::1','Success','Cash Top-Up of ₱50.00 to student STU-2026-0891','2026-10-10 20:36:20'),(51,1,'CREDIT_LIMIT_UPDATE','Finance','STU-2026-0891','::1','Success','Credit limit updated to ₱350.00 for STU-2026-0891','2026-10-10 20:36:20'),(52,1,'LOGIN_SUCCESS','Auth','22100277','::1','Success','User signed in as admin','2026-10-10 20:36:26'),(53,1,'CREDIT_SETTLED_TO_ZERO','Finance','OR-2026-TEST-CLEAR','::1','Success','Settle-to-Zero for student STU-2026-0891. Paid ₱120.00 under OR OR-2026-TEST-CLEAR','2026-10-10 20:36:26'),(54,1,'LOGIN_SUCCESS','Auth','22100277','::1','Success','User signed in as admin','2026-10-10 20:36:33'),(55,1,'ANNOUNCEMENT_PUBLISHED','Admin','ANN-5','::1','Success','Published announcement: \"Automated System Health Check Passed\"','2026-10-10 20:36:33'),(56,5,'LOGIN_FAILED','Auth','STU-2026-0891','::1','Rejected','Invalid password attempt','2026-10-10 20:36:40'),(57,5,'LOGIN_SUCCESS','Auth','STU-2026-0891','::1','Success','User signed in as student','2026-10-10 20:36:59'),(58,5,'LOGIN_SUCCESS','Auth','STU-2026-0891','::ffff:127.0.0.1','Success','User signed in as student','2026-10-10 20:38:52'),(59,1,'SYSTEM_CONFIG_VERIFIED','Admin','PORTAL-SYS-01','127.0.0.1','Success','Verified cryptographic token secret rotation and secure session parameters.','2026-10-10 20:50:44'),(60,2,'ENROLLMENT_SYNC','Admin','REG-SYNC-2026','127.0.0.1','Success','Synchronized institutional student directory with active zone RFID credentials.','2026-10-10 20:50:44'),(61,3,'INVENTORY_RECONCILE','Canteen','INV-AUDIT-01','127.0.0.1','Success','Morning stock count reconciled against register item sales.','2026-10-10 20:50:44'),(62,4,'CATALOG_INDEX_REFRESH','Library','LIB-CAT-01','127.0.0.1','Success','Refreshed Dewey Decimal indices and active shelf reservation slots.','2026-10-10 20:50:44'),(63,1,'FIREWALL_RULE_ENFORCE','Admin','FW-PORT-3306','127.0.0.1','Success','Enforced zone network isolation policy between Zone 1 and Zone 2.','2026-10-10 20:50:44'),(64,1,'LOGIN_FAILED','Auth','22100277','::1','Rejected','Invalid password attempt','2026-10-10 20:55:40'),(65,1,'LOGIN_FAILED','Auth','22100277','::1','Rejected','Invalid password attempt','2026-10-10 20:55:45'),(66,5,'LOGIN_FAILED','Auth','STU-2026-0891','::1','Rejected','Invalid password attempt','2026-10-10 20:55:49');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canteen_inventory`
--

DROP TABLE IF EXISTS `canteen_inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `canteen_inventory` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_name` varchar(150) NOT NULL,
  `category` varchar(50) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `reorder_level` int(11) NOT NULL DEFAULT 10,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`item_id`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canteen_inventory`
--

LOCK TABLES `canteen_inventory` WRITE;
/*!40000 ALTER TABLE `canteen_inventory` DISABLE KEYS */;
INSERT INTO `canteen_inventory` VALUES (1,'Fried Chicken w/ Rice','Meals',65.00,45,10,1,'2026-10-10 17:23:44','2026-10-10 17:23:44'),(2,'Pork Adobo Rice Bowl','Meals',75.00,38,10,1,'2026-10-10 17:23:44','2026-10-10 17:23:44'),(3,'Baked Macaroni w/ Toast','Snacks',65.00,22,8,1,'2026-10-10 17:23:44','2026-10-10 17:23:44'),(4,'Fresh Buko Juice Cup','Drinks',25.00,60,15,1,'2026-10-10 17:23:44','2026-10-10 17:23:44'),(5,'SJSM Premium Notebook','Stationery',45.00,30,5,1,'2026-10-10 17:23:44','2026-10-10 17:23:44'),(6,'Potato Chips Snack Pack','Snacks',30.00,55,10,1,'2026-10-10 17:23:44','2026-10-10 17:23:44'),(7,'Premium Iced Coffee','Drinks',50.00,40,10,1,'2026-10-10 20:05:35','2026-10-10 20:05:35'),(8,'Official School Ballpen','Stationery',15.00,80,20,1,'2026-10-10 20:05:35','2026-10-10 20:05:35'),(9,'SJSM Uniform PE T-Shirt','Stationery',280.00,12,5,1,'2026-10-10 20:05:35','2026-10-10 20:05:35'),(10,'Cream-O Chocolate Sandwich','Snacks',12.00,0,10,0,'2026-10-10 20:05:35','2026-10-10 20:05:35');
/*!40000 ALTER TABLE `canteen_inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canteen_sale_items`
--

DROP TABLE IF EXISTS `canteen_sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `canteen_sale_items` (
  `sale_item_id` int(11) NOT NULL AUTO_INCREMENT,
  `sale_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`sale_item_id`),
  KEY `fk_csi_sale` (`sale_id`),
  KEY `fk_csi_item` (`item_id`),
  CONSTRAINT `fk_csi_item` FOREIGN KEY (`item_id`) REFERENCES `canteen_inventory` (`item_id`),
  CONSTRAINT `fk_csi_sale` FOREIGN KEY (`sale_id`) REFERENCES `canteen_sales` (`sale_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canteen_sale_items`
--

LOCK TABLES `canteen_sale_items` WRITE;
/*!40000 ALTER TABLE `canteen_sale_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `canteen_sale_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canteen_sales`
--

DROP TABLE IF EXISTS `canteen_sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `canteen_sales` (
  `sale_id` int(11) NOT NULL AUTO_INCREMENT,
  `sale_code` varchar(64) NOT NULL,
  `student_account_id` int(11) NOT NULL,
  `cashier_account_id` int(11) NOT NULL,
  `financial_transaction_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `cash_paid` decimal(10,2) NOT NULL,
  `credit_paid` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`sale_id`),
  UNIQUE KEY `sale_code` (`sale_code`),
  KEY `fk_cs_student` (`student_account_id`),
  KEY `fk_cs_cashier` (`cashier_account_id`),
  KEY `fk_cs_ft` (`financial_transaction_id`),
  CONSTRAINT `fk_cs_cashier` FOREIGN KEY (`cashier_account_id`) REFERENCES `system_accounts` (`account_id`),
  CONSTRAINT `fk_cs_ft` FOREIGN KEY (`financial_transaction_id`) REFERENCES `financial_transactions` (`financial_transaction_id`),
  CONSTRAINT `fk_cs_student` FOREIGN KEY (`student_account_id`) REFERENCES `system_accounts` (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canteen_sales`
--

LOCK TABLES `canteen_sales` WRITE;
/*!40000 ALTER TABLE `canteen_sales` DISABLE KEYS */;
/*!40000 ALTER TABLE `canteen_sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `e_wallets`
--

DROP TABLE IF EXISTS `e_wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `e_wallets` (
  `wallet_id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) DEFAULT NULL,
  `wallet_type` enum('Student','Cash_Collection','Canteen_Revenue','Credit_Receivable','Adjustment_Reserve') NOT NULL,
  `credit_limit` decimal(10,2) DEFAULT 0.00,
  `credit_used` decimal(10,2) DEFAULT 0.00,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`wallet_id`),
  KEY `fk_wallet_account` (`account_id`),
  KEY `idx_wallet_type` (`wallet_type`),
  CONSTRAINT `fk_wallet_account` FOREIGN KEY (`account_id`) REFERENCES `system_accounts` (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `e_wallets`
--

LOCK TABLES `e_wallets` WRITE;
/*!40000 ALTER TABLE `e_wallets` DISABLE KEYS */;
INSERT INTO `e_wallets` VALUES (1,5,'Student',350.00,0.00,'2026-10-10 20:36:26'),(2,6,'Student',200.00,180.00,'2026-10-10 17:23:44'),(101,NULL,'Cash_Collection',0.00,0.00,'2026-10-10 17:23:44'),(102,NULL,'Canteen_Revenue',0.00,0.00,'2026-10-10 17:23:44'),(103,NULL,'Credit_Receivable',0.00,0.00,'2026-10-10 17:23:44'),(104,NULL,'Adjustment_Reserve',0.00,0.00,'2026-10-10 17:23:44'),(105,7,'Student',300.00,0.00,'2026-10-10 18:04:28');
/*!40000 ALTER TABLE `e_wallets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `financial_ledger_entries`
--

DROP TABLE IF EXISTS `financial_ledger_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `financial_ledger_entries` (
  `ledger_entry_id` int(11) NOT NULL AUTO_INCREMENT,
  `financial_transaction_id` int(11) NOT NULL,
  `wallet_id` int(11) NOT NULL,
  `entry_side` enum('Debit','Credit') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `entry_sequence` int(11) NOT NULL,
  `posted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ledger_entry_id`),
  KEY `fk_fle_tx` (`financial_transaction_id`),
  KEY `idx_fle_wallet` (`wallet_id`),
  KEY `idx_fle_posted` (`posted_at`),
  CONSTRAINT `fk_fle_tx` FOREIGN KEY (`financial_transaction_id`) REFERENCES `financial_transactions` (`financial_transaction_id`),
  CONSTRAINT `fk_fle_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `e_wallets` (`wallet_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_ledger_entries`
--

LOCK TABLES `financial_ledger_entries` WRITE;
/*!40000 ALTER TABLE `financial_ledger_entries` DISABLE KEYS */;
INSERT INTO `financial_ledger_entries` VALUES (1,1,101,'Debit',500.00,1,'2026-10-10 17:23:44'),(2,1,1,'Credit',500.00,2,'2026-10-10 17:23:44'),(3,2,1,'Debit',50.00,1,'2026-10-10 17:23:44'),(4,2,102,'Credit',50.00,2,'2026-10-10 17:23:44'),(5,3,101,'Debit',50.00,1,'2026-10-10 20:36:20'),(6,3,1,'Credit',50.00,2,'2026-10-10 20:36:20'),(7,4,101,'Debit',120.00,1,'2026-10-10 20:36:26'),(8,4,103,'Credit',120.00,2,'2026-10-10 20:36:26');
/*!40000 ALTER TABLE `financial_ledger_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `financial_transactions`
--

DROP TABLE IF EXISTS `financial_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `financial_transactions` (
  `financial_transaction_id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_code` varchar(64) NOT NULL,
  `transaction_type` enum('Top_Up','Purchase','Credit_Settlement','Adjustment','Reversal') NOT NULL,
  `transaction_status` enum('Pending','Posted','Rolled_Back') DEFAULT 'Posted',
  `initiated_by_account_id` int(11) NOT NULL,
  `supporting_reference` varchar(100) DEFAULT NULL,
  `reversal_of_transaction_id` int(11) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `posted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`financial_transaction_id`),
  UNIQUE KEY `transaction_code` (`transaction_code`),
  KEY `fk_ft_initiator` (`initiated_by_account_id`),
  KEY `fk_ft_reversal` (`reversal_of_transaction_id`),
  KEY `idx_ft_code` (`transaction_code`),
  KEY `idx_ft_date` (`created_at`),
  CONSTRAINT `fk_ft_initiator` FOREIGN KEY (`initiated_by_account_id`) REFERENCES `system_accounts` (`account_id`),
  CONSTRAINT `fk_ft_reversal` FOREIGN KEY (`reversal_of_transaction_id`) REFERENCES `financial_transactions` (`financial_transaction_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_transactions`
--

LOCK TABLES `financial_transactions` WRITE;
/*!40000 ALTER TABLE `financial_transactions` DISABLE KEYS */;
INSERT INTO `financial_transactions` VALUES (1,'TXN-INIT-001','Top_Up','Posted',3,'OR-INIT-001',NULL,NULL,'2026-10-10 17:23:44','2026-10-10 17:23:44'),(2,'TXN-INIT-002','Purchase','Posted',3,'POS-INIT-002',NULL,NULL,'2026-10-10 17:23:44','2026-10-10 17:23:44'),(3,'TXN-TOPUP-1791664580437','Top_Up','Posted',1,'FIN-TEST-01',NULL,NULL,'2026-10-10 20:36:20','2026-10-10 20:36:20'),(4,'TXN-SETTLE-1791664586888','Credit_Settlement','Posted',1,'OR-2026-TEST-CLEAR',NULL,NULL,'2026-10-10 20:36:26','2026-10-10 20:36:26');
/*!40000 ALTER TABLE `financial_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_catalog`
--

DROP TABLE IF EXISTS `library_catalog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `library_catalog` (
  `book_id` int(11) NOT NULL AUTO_INCREMENT,
  `accession_no` varchar(50) NOT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(150) NOT NULL,
  `category` varchar(50) NOT NULL,
  `total_copies` int(11) NOT NULL DEFAULT 1,
  `available_copies` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`book_id`),
  UNIQUE KEY `accession_no` (`accession_no`),
  KEY `idx_catalog_title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_catalog`
--

LOCK TABLES `library_catalog` WRITE;
/*!40000 ALTER TABLE `library_catalog` DISABLE KEYS */;
INSERT INTO `library_catalog` VALUES (1,'ACC-00129','978-0134685991','Effective Java (3rd Edition)','Joshua Bloch','Computer Science',5,4,'2026-10-10 17:23:44'),(2,'ACC-00142','978-0132350884','Clean Code: A Handbook of Agile Software','Robert C. Martin','Computer Science',4,3,'2026-10-10 17:23:44'),(3,'ACC-00210','978-0262033848','Introduction to Algorithms (CLRS)','Cormen et al.','Mathematics',3,3,'2026-10-10 17:23:44'),(4,'ACC-00301','978-0201616224','The Pragmatic Programmer','Andrew Hunt, David Thomas','Science & Physics',4,2,'2026-10-10 20:05:35'),(5,'ACC-00302','978-0201633610','Design Patterns: Elements of Reusable Object-Oriented Software','Erich Gamma et al.','Science & Physics',3,1,'2026-10-10 20:05:35'),(6,'ACC-00303','978-1285740621','Calculus: Early Transcendentals','James Stewart','Mathematics',6,5,'2026-10-10 20:05:35'),(7,'ACC-00304','978-0134093413','Campbell Biology (11th Edition)','Lisa A. Urry et al.','Chemistry & Biology',5,5,'2026-10-10 20:05:35'),(8,'ACC-00305','978-0767908184','A Short History of Nearly Everything','Bill Bryson','Science & Physics',4,4,'2026-10-10 20:05:35'),(9,'ACC-00306','978-0061120084','To Kill a Mockingbird','Harper Lee','Literature',8,7,'2026-10-10 20:05:35'),(10,'ACC-00307','978-0743273565','The Great Gatsby','F. Scott Fitzgerald','Literature',7,6,'2026-10-10 20:05:35');
/*!40000 ALTER TABLE `library_catalog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_circulation`
--

DROP TABLE IF EXISTS `library_circulation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `library_circulation` (
  `circulation_id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) NOT NULL,
  `student_account_id` int(11) NOT NULL,
  `issued_by_account_id` int(11) NOT NULL,
  `borrow_date` datetime NOT NULL,
  `due_date` datetime NOT NULL,
  `return_date` datetime DEFAULT NULL,
  `fine_amount` decimal(10,2) DEFAULT 0.00,
  `fine_status` enum('None','Pending','Settled','Waived') DEFAULT 'None',
  `status` enum('Borrowed','Returned','Overdue','Lost') DEFAULT 'Borrowed',
  `fine_reason` text DEFAULT NULL,
  `settled_by_account_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`circulation_id`),
  KEY `fk_lc_book` (`book_id`),
  KEY `fk_lc_staff` (`issued_by_account_id`),
  KEY `fk_lc_settler` (`settled_by_account_id`),
  KEY `idx_lc_student` (`student_account_id`),
  KEY `idx_lc_status` (`status`),
  CONSTRAINT `fk_lc_book` FOREIGN KEY (`book_id`) REFERENCES `library_catalog` (`book_id`),
  CONSTRAINT `fk_lc_settler` FOREIGN KEY (`settled_by_account_id`) REFERENCES `system_accounts` (`account_id`),
  CONSTRAINT `fk_lc_staff` FOREIGN KEY (`issued_by_account_id`) REFERENCES `system_accounts` (`account_id`),
  CONSTRAINT `fk_lc_student` FOREIGN KEY (`student_account_id`) REFERENCES `system_accounts` (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_circulation`
--

LOCK TABLES `library_circulation` WRITE;
/*!40000 ALTER TABLE `library_circulation` DISABLE KEYS */;
INSERT INTO `library_circulation` VALUES (1,1,5,4,'2026-10-01 09:00:00','2026-10-15 17:00:00',NULL,0.00,'None','Borrowed',NULL,NULL),(2,2,6,4,'2026-09-15 09:00:00','2026-09-29 17:00:00',NULL,45.00,'Pending','Overdue',NULL,NULL);
/*!40000 ALTER TABLE `library_circulation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_logs`
--

DROP TABLE IF EXISTS `notification_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_logs` (
  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'System',
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`notification_id`),
  KEY `idx_nl_account_read` (`account_id`,`is_read`),
  CONSTRAINT `fk_nl_account` FOREIGN KEY (`account_id`) REFERENCES `system_accounts` (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_logs`
--

LOCK TABLES `notification_logs` WRITE;
/*!40000 ALTER TABLE `notification_logs` DISABLE KEYS */;
INSERT INTO `notification_logs` VALUES (1,7,'System','SMS Dispatched to 09183456789: SJSM ISSRMS: Student portal account STU-2026-0922 provisioned for Samantha Gomez. Temporary credentials dispatched via secure SMS. You will be prompted to change your password upon first login.',0,'2026-10-10 18:04:28'),(2,5,'System','SMS to 09181234567: SJSM ISSRMS: Your password recovery verification code is 188497. Valid for 10 minutes.',0,'2026-10-10 18:38:52'),(3,5,'System','SMS to 09181234567: SJSM ISSRMS: Your password recovery verification code is 939938. Valid for 10 minutes.',0,'2026-10-10 18:38:52'),(4,4,'System','SMS to 09310010340: SJSM ISSRMS: Your password recovery verification code is 116538. Valid for 10 minutes.',0,'2026-10-10 18:42:07'),(5,1,'System','SMS to 09310010340: SJSM ISSRMS: Your password recovery verification code is 853042. Valid for 10 minutes.',0,'2026-10-10 18:42:07'),(6,5,'System','SMS to 09310010340: SJSM ISSRMS: Your password recovery verification code is 160336. Valid for 10 minutes.',0,'2026-10-10 18:42:07'),(7,3,'System','SMS to 09310010340: SJSM ISSRMS: Your password recovery verification code is 445230. Valid for 10 minutes.',0,'2026-10-10 18:42:07'),(8,2,'System','SMS to 09310010340: SJSM ISSRMS: Your password recovery verification code is 422025. Valid for 10 minutes.',0,'2026-10-10 18:42:07'),(9,4,'System','SMS to 09310010340: SJSM ISSRMS: Your password recovery verification code is 120443. Valid for 10 minutes.',0,'2026-10-10 18:42:49'),(10,4,'System','SMS to 09310010340: SJSM ISSRMS: Your password recovery verification code is 444018. Valid for 10 minutes.',0,'2026-10-10 18:43:07'),(11,4,'System','SMS to 09310010340: SJSM ISSRMS: Your password recovery verification code is 196917. Valid for 10 minutes.',0,'2026-10-10 18:46:49'),(12,4,'System','SMS to 09310010340: SJSM ISSRMS: Your password recovery verification code is 788300. Valid for 10 minutes.',0,'2026-10-10 18:46:49'),(13,5,'System','SMS to 09310010340: SJSM ISSRMS: Your password recovery verification code is 666040. Valid for 10 minutes.',0,'2026-10-10 18:47:49'),(14,3,'System','SMS to 09310010340: SJSM ISSRMS: Your password recovery verification code is 936465. Valid for 10 minutes.',0,'2026-10-10 19:07:14'),(15,5,'Top_Up_Success','Your canteen e-wallet has been credited with ₱200.00 via Cash Deposit (Ref: TXN-TOPUP-001). Available balance: ₱450.00.',0,'2026-10-10 20:23:32'),(16,5,'Book_Due','Reminder: \"Clean Code: A Handbook of Agile Software\" is due in 3 days. Please return or renew at the Library counter.',0,'2026-10-10 20:23:32'),(17,5,'System','Welcome to ISSRMS! Your student RFID account is active.',0,'2026-10-10 20:23:32'),(18,6,'Overdue_Fine','Your loan of \"Design Patterns\" is 3 days overdue. Fine assessed: ₱15.00.',0,'2026-10-10 20:23:32'),(19,1,'System','System audit check completed. All core services running normally.',0,'2026-10-10 20:23:32'),(20,1,'Security','Automated security scan completed with zero vulnerabilities found.',0,'2026-10-10 20:50:39'),(21,1,'Announcement','Midterm examination schedule announcement was posted to campus board.',0,'2026-10-10 20:50:39'),(22,1,'Canteen','Daily canteen inventory audit finalized for the morning break.',0,'2026-10-10 20:50:39'),(23,1,'Library','Library circulation desk opened and RFID scan service online.',0,'2026-10-10 20:50:39'),(24,2,'','Quarterly student enrollment ledger synchronized with Registrar archives.',0,'2026-10-10 20:50:39'),(25,3,'','Canteen POS morning transaction log opened successfully.',0,'2026-10-10 20:50:39'),(26,4,'','Morning catalog check completed. All reserve shelves stocked.',0,'2026-10-10 20:50:39');
/*!40000 ALTER TABLE `notification_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_accounts`
--

DROP TABLE IF EXISTS `system_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_accounts` (
  `account_id` int(11) NOT NULL AUTO_INCREMENT,
  `id_number` varchar(50) NOT NULL,
  `rfid_uid` varchar(64) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Student_Parent','Registrar','Canteen_Personnel','Library_Personnel','Administrator') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `must_change_password` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `id_number` (`id_number`),
  UNIQUE KEY `rfid_uid` (`rfid_uid`),
  KEY `idx_role` (`role`),
  KEY `idx_rfid` (`rfid_uid`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_accounts`
--

LOCK TABLES `system_accounts` WRITE;
/*!40000 ALTER TABLE `system_accounts` DISABLE KEYS */;
INSERT INTO `system_accounts` VALUES (1,'22100277',NULL,'$argon2id$v=19$m=65536,p=4,t=3$eI9Vak/TzOpxpxgPjfc+3g$4rZs2Gr94kaNvlSNoo3SK7qyfD1ChA1DARsIG0OylME','Administrator',1,0,'2026-10-10 17:23:44','2026-10-10 18:32:00'),(2,'EMP-2012-0051',NULL,'$argon2id$v=19$m=65536,p=4,t=3$tkhYYBM7KAd1DTZZoWC5aQ$GccWz0i4sNslQhrIgSqaky8ORqZemYTtcXNYnueVA/g','Registrar',1,0,'2026-10-10 17:23:44','2026-10-10 18:02:02'),(3,'EMP-2020-0042',NULL,'$argon2id$v=19$m=65536,p=4,t=3$lE8XlFzTFFaeC7eWyq7MJQ$VOcEpGDc5ZVKKsQuCwDfIGTqpk28OKVajFZr7Ogs4W4','Canteen_Personnel',1,0,'2026-10-10 17:23:44','2026-10-10 18:02:02'),(4,'EMP-2018-0119',NULL,'$argon2id$v=19$m=65536,p=4,t=3$S5WE4eh5GFf5h1PIZxt8MA$vgj7NP50YLxYYEOxwBxojM5m3zhfqU8HodNdrnojYMA','Library_Personnel',1,0,'2026-10-10 17:23:44','2026-10-10 18:46:49'),(5,'STU-2026-0891','6A:9C:1D:3F','$argon2id$v=19$m=65536,p=4,t=3$GBho4scPKbKTv8XLhSJ3uA$eYL2cXFav2H0ctU0aNATEjpHveyLURoAsnQhxJk7rTc','Student_Parent',1,0,'2026-10-10 17:23:44','2026-10-10 18:38:52'),(6,'STU-2026-0412','1B:3D:5F:7A','$argon2id$v=19$m=65536,p=4,t=3$6HzH2E4xJueaEOBocvKhVA$yplYRjYdeLczrNXSpinxORlaLIWOtcx+nv/FjD3LjSY','Student_Parent',1,0,'2026-10-10 17:23:44','2026-10-10 18:02:02'),(7,'STU-2026-0922','2C:4E:6A:8B','$argon2id$v=19$m=65536,p=4,t=3$78XGoaBQYN6q9Wa29z28Ng$a6R5AcMNcREhHrcQEWd+D8q2Vk3qAX7RC9ltcglGbuE','Student_Parent',1,0,'2026-10-10 18:04:28','2026-10-10 18:04:38');
/*!40000 ALTER TABLE `system_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_announcements`
--

DROP TABLE IF EXISTS `system_announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_announcements` (
  `announcement_id` int(11) NOT NULL AUTO_INCREMENT,
  `author_account_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `category` enum('All','Academic','Event','Administrative') DEFAULT 'All',
  `audience_scope` enum('All','Students','Staff') DEFAULT 'All',
  `status` enum('Draft','Active','Inactive') DEFAULT 'Active',
  `is_pinned` tinyint(1) DEFAULT 0,
  `published_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`announcement_id`),
  KEY `fk_sa_author` (`author_account_id`),
  CONSTRAINT `fk_sa_author` FOREIGN KEY (`author_account_id`) REFERENCES `system_accounts` (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_announcements`
--

LOCK TABLES `system_announcements` WRITE;
/*!40000 ALTER TABLE `system_announcements` DISABLE KEYS */;
INSERT INTO `system_announcements` VALUES (1,1,'Official Deployment of the ISSRMS Portal','Welcome to the Integrated Student Services and Resource Management System (ISSRMS). This platform is now live for tracking canteen transactions, library logs, and RFID attendance.','Administrative','All','Active',1,'2026-10-10 17:23:44','2026-10-10 17:23:44'),(2,1,'Midterm Examination Schedule & Library Hours','The High School Library will extend study hours until 6:00 PM during the Midterm Examination week (October 15-20, 2026). Please ensure all overdue book fines are settled at the circulation counter before exams.','Academic','All','Active',0,'2026-10-10 18:00:00','2026-10-10 20:23:32'),(3,1,'Annual Intramurals 2026 Opening Ceremony','Join us on Friday at the Saint Joseph Quadrangle for the opening ceremony of Intramurals 2026. PE uniforms are required. Canteen counter kiosks will operate special lunch combos.','Event','All','Active',0,'2026-10-10 19:00:00','2026-10-10 20:23:32'),(4,1,'Canteen E-Wallet Credit Settlement Reminder','Parents and students are reminded to settle outstanding canteen emergency credit with the Cashier / Registrar by the 15th of the month. Settle-to-Zero is available during office hours.','Administrative','All','Active',0,'2026-10-09 02:00:00','2026-10-10 20:23:32'),(5,1,'Automated System Health Check Passed','All Zone 1 and Zone 2 database tables are connected and operational.','Administrative','All','Active',0,'2026-10-10 20:36:33','2026-10-10 20:36:33');
/*!40000 ALTER TABLE `system_announcements` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-11  5:18:10
