-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: sjsm_institutional_zone1
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
-- Current Database: `sjsm_institutional_zone1`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `sjsm_institutional_zone1` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `sjsm_institutional_zone1`;

--
-- Table structure for table `institutional_logging_records`
--

DROP TABLE IF EXISTS `institutional_logging_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `institutional_logging_records` (
  `log_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_number` varchar(50) NOT NULL,
  `log_type` enum('Gate_Entry','Gate_Exit','Library_Entry','Library_Exit') NOT NULL,
  `location` enum('Gate_1','Gate_2','Library') NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`log_id`),
  KEY `idx_student_time` (`id_number`,`timestamp`),
  KEY `idx_location_time` (`location`,`timestamp`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `institutional_logging_records`
--

LOCK TABLES `institutional_logging_records` WRITE;
/*!40000 ALTER TABLE `institutional_logging_records` DISABLE KEYS */;
INSERT INTO `institutional_logging_records` VALUES (1,'STU-2026-0891','Gate_Entry','Gate_1','2026-10-09 23:15:22'),(2,'STU-2026-0891','Library_Entry','Library','2026-10-10 01:42:10'),(3,'STU-2026-0891','Library_Exit','Library','2026-10-10 02:35:48'),(4,'STU-2026-0412','Gate_Entry','Gate_2','2026-10-09 23:22:15'),(5,'STU-2026-0922','Gate_Entry','Gate_1','2026-10-09 23:28:44'),(6,'STU-2026-0891','Gate_Entry','Gate_1','2026-10-09 23:12:30'),(7,'STU-2026-0891','Gate_Exit','Gate_1','2026-10-10 08:45:10'),(8,'STU-2026-0891','Gate_Entry','Gate_1','2026-10-10 23:05:14'),(9,'STU-2026-0891','Library_Entry','Library','2026-10-11 01:30:00'),(10,'STU-2026-0891','Library_Exit','Library','2026-10-11 03:15:20'),(11,'STU-2026-0412','Gate_Entry','Gate_2','2026-10-09 23:25:00'),(12,'STU-2026-0412','Gate_Exit','Gate_2','2026-10-10 09:00:00'),(13,'STU-2026-0412','Gate_Entry','Gate_2','2026-10-10 23:18:00'),(14,'STU-2026-0412','Library_Entry','Library','2026-10-11 05:10:00'),(15,'STU-2026-0412','Library_Exit','Library','2026-10-11 06:05:00'),(16,'STU-2026-0922','Gate_Entry','Gate_1','2026-10-09 23:35:10'),(17,'STU-2026-0922','Gate_Exit','Gate_1','2026-10-10 08:30:00'),(18,'STU-2026-0922','Gate_Entry','Gate_1','2026-10-10 23:10:55'),(19,'STU-2026-0922','Library_Entry','Library','2026-10-11 02:00:00'),(20,'STU-2026-0922','Library_Exit','Library','2026-10-11 03:45:00');
/*!40000 ALTER TABLE `institutional_logging_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `institutional_students`
--

DROP TABLE IF EXISTS `institutional_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `institutional_students` (
  `id_number` varchar(50) NOT NULL,
  `rfid_uid` varchar(64) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `grade_level` varchar(20) NOT NULL,
  `section` varchar(50) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `parent_contact` varchar(20) DEFAULT NULL,
  `enrollment_status` enum('Active','Inactive','Graduated','Transferred') DEFAULT 'Active',
  `photo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_number`),
  UNIQUE KEY `rfid_uid` (`rfid_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `institutional_students`
--

LOCK TABLES `institutional_students` WRITE;
/*!40000 ALTER TABLE `institutional_students` DISABLE KEYS */;
INSERT INTO `institutional_students` VALUES ('STU-2026-0412','1B:3D:5F:7A','Jose','Rizal','Grade 12','St. Francis','09172345678','09182345678','Active',NULL,'2026-10-10 17:23:44'),('STU-2026-0891','6A:9C:1D:3F','Kyle','Zenarosa','Grade 11','St. Benedict','09171234567','09181234567','Active',NULL,'2026-10-10 17:23:44'),('STU-2026-0922','2C:4E:6A:8B','Samantha','Gomez','Grade 10','St. Scholastica','09173456789','09183456789','Active',NULL,'2026-10-10 17:23:44');
/*!40000 ALTER TABLE `institutional_students` ENABLE KEYS */;
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
