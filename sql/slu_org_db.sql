-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 01, 2025 at 09:20 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `slu_org_db`
--

CREATE DATABASE IF NOT EXISTS `slu_org_db`;
USE `slu_org_db`;

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
CREATE TABLE IF NOT EXISTS `admin` (
  `adminid` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('super_admin','osa_admin') NOT NULL DEFAULT 'osa_admin',
  `last_login` datetime DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`adminid`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`adminid`, `username`, `password`, `email`, `role`, `last_login`, `status`) VALUES
(1, 'admin', 'admin123', 'admin@slu.edu.ph', 'super_admin', '2025-11-01 17:19:15', 'active'),
(4, 'osa', 'osa123', 'osa@slu.edu.ph', 'osa_admin', NULL, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
CREATE TABLE IF NOT EXISTS `client` (
  `clientid` int NOT NULL AUTO_INCREMENT,
  `org_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `branch` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`clientid`),
  UNIQUE KEY `org_name` (`org_name`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`clientid`, `org_name`, `username`, `password`, `email`, `branch`, `status`, `last_login`) VALUES
(2, 'ICON', 'icon', 'icon123', 'icon@slu.edu.ph', NULL, 'active', '2025-11-01 17:18:26');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
CREATE TABLE IF NOT EXISTS `comments` (
  `commentid` int NOT NULL AUTO_INCREMENT,
  `formid` int NOT NULL,
  `clientid` int NOT NULL,
  `comment_text` text NOT NULL,
  `date_posted` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`commentid`),
  KEY `fk_comment_form` (`formid`),
  KEY `fk_comment_client` (`clientid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
CREATE TABLE IF NOT EXISTS `files` (
  `fileid` int NOT NULL AUTO_INCREMENT,
  `responseid` int NOT NULL,
  `clientid` int NOT NULL,
  `filename` varchar(255) NOT NULL,
  `filetype` enum('pdf','image','doc','other') NOT NULL,
  `filesize` int NOT NULL,
  `filepath` varchar(255) NOT NULL,
  `upload_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('uploaded','returned','approved') NOT NULL DEFAULT 'uploaded',
  PRIMARY KEY (`fileid`),
  KEY `fk_file_response` (`responseid`),
  KEY `fk_file_client` (`clientid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `file_history`
--

DROP TABLE IF EXISTS `file_history`;
CREATE TABLE IF NOT EXISTS `file_history` (
  `historyid` int NOT NULL AUTO_INCREMENT,
  `fileid` int NOT NULL,
  `adminid` int DEFAULT NULL,
  `date_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reason` text,
  `version` int NOT NULL DEFAULT '1',
  `status` enum('returned','approved') NOT NULL,
  PRIMARY KEY (`historyid`),
  KEY `fk_history_file` (`fileid`),
  KEY `fk_history_admin` (`adminid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forms`
--

DROP TABLE IF EXISTS `forms`;
CREATE TABLE IF NOT EXISTS `forms` (
  `formid` int NOT NULL AUTO_INCREMENT,
  `adminid` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text,
  `deadline` date NOT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `date_created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('active','archived','closed') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`formid`),
  KEY `fk_forms_admin` (`adminid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `form_responses`
--

DROP TABLE IF EXISTS `form_responses`;
CREATE TABLE IF NOT EXISTS `form_responses` (
  `responseid` int NOT NULL AUTO_INCREMENT,
  `formid` int NOT NULL,
  `clientid` int NOT NULL,
  `submission_title` varchar(255) NOT NULL,
  `submitted_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('submitted','pending','returned','approved') NOT NULL DEFAULT 'submitted',
  `feedback` text,
  `version` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`responseid`),
  KEY `fk_response_form` (`formid`),
  KEY `fk_response_client` (`clientid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_activity`
--

DROP TABLE IF EXISTS `login_activity`;
CREATE TABLE IF NOT EXISTS `login_activity` (
  `activityid` int NOT NULL AUTO_INCREMENT,
  `userid` int NOT NULL,
  `user_type` enum('admin','client') NOT NULL,
  `login_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `logout_time` datetime DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `auto_logout_flag` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`activityid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `newsboard`
--

DROP TABLE IF EXISTS `newsboard`;
CREATE TABLE IF NOT EXISTS `newsboard` (
  `newsid` int NOT NULL AUTO_INCREMENT,
  `adminid` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `content` text NOT NULL,
  `date_posted` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`newsid`),
  KEY `fk_news_admin` (`adminid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `notificationid` int NOT NULL AUTO_INCREMENT,
  `recipientid` int NOT NULL,
  `recipient_type` enum('admin','client') NOT NULL,
  `message` text NOT NULL,
  `date_sent` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`notificationid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organization_submissions`
--

DROP TABLE IF EXISTS `organization_submissions`;
CREATE TABLE IF NOT EXISTS `organization_submissions` (
  `submission_id` int NOT NULL AUTO_INCREMENT,
  `responseid` int NOT NULL,
  `clientid` int NOT NULL,
  `org_full_name` varchar(255) NOT NULL,
  `org_acronym` varchar(50) NOT NULL,
  `org_email` varchar(100) NOT NULL,
  `social_media_links` text,
  `applicant_name` varchar(150) NOT NULL,
  `applicant_position` varchar(100) NOT NULL,
  `applicant_email` varchar(100) NOT NULL,
  `adviser_names` text NOT NULL,
  `adviser_emails` text NOT NULL,
  `category` varchar(255) NOT NULL,
  `org_type` enum('co-curricular','extra-curricular','publication') NOT NULL,
  `cbl_status` enum('with-revisions','without-revisions') NOT NULL,
  `video_link` varchar(500) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`submission_id`),
  KEY `fk_submission_response` (`responseid`),
  KEY `fk_submission_client` (`clientid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `org_documents`
--

DROP TABLE IF EXISTS `org_documents`;
CREATE TABLE IF NOT EXISTS `org_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `clientid` int NOT NULL,
  `document_type` varchar(100) NOT NULL COMMENT 'e.g., Strategic Plans, Annual Report, Constitution & By-Laws, etc.',
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint NOT NULL COMMENT 'File size in bytes',
  `file_extension` varchar(10) NOT NULL,
  `uploaded_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` varchar(100) NOT NULL COMMENT 'Organization name',
  PRIMARY KEY (`id`),
  KEY `fk_doc_submission` (`submission_id`),
  KEY `fk_doc_client` (`clientid`),
  KEY `idx_document_type` (`document_type`),
  KEY `idx_uploaded_date` (`uploaded_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `org_form_submissions`
--

DROP TABLE IF EXISTS `org_form_submissions`;
CREATE TABLE IF NOT EXISTS `org_form_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clientid` int NOT NULL,
  `submission_title` varchar(255) NOT NULL,
  `org_full_name` varchar(255) NOT NULL,
  `org_acronym` varchar(50) NOT NULL,
  `org_email` varchar(100) NOT NULL,
  `social_media_links` text,
  `applicant_name` varchar(150) NOT NULL,
  `applicant_position` varchar(100) NOT NULL,
  `applicant_email` varchar(100) NOT NULL,
  `adviser_names` text NOT NULL,
  `adviser_emails` text NOT NULL,
  `category` varchar(255) NOT NULL,
  `org_type` varchar(50) NOT NULL,
  `cbl_status` varchar(50) NOT NULL,
  `video_link` varchar(500) NOT NULL,
  `status` enum('Pending','Approved','Returned') NOT NULL DEFAULT 'Pending',
  `submitted_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_org_submission_client` (`clientid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `submission_documents`
--

DROP TABLE IF EXISTS `submission_documents`;
CREATE TABLE IF NOT EXISTS `submission_documents` (
  `document_id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `document_type` enum('strategic_plans','annual_report','constitution_bylaws','list_of_officers','financial_statement','infographics','other') NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `filepath` varchar(500) NOT NULL,
  `filesize` bigint NOT NULL,
  `filetype` varchar(50) NOT NULL,
  `upload_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`document_id`),
  KEY `fk_document_submission` (`submission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `fk_comment_client` FOREIGN KEY (`clientid`) REFERENCES `client` (`clientid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_comment_form` FOREIGN KEY (`formid`) REFERENCES `forms` (`formid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `files`
--
ALTER TABLE `files`
  ADD CONSTRAINT `fk_file_client` FOREIGN KEY (`clientid`) REFERENCES `client` (`clientid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_file_response` FOREIGN KEY (`responseid`) REFERENCES `form_responses` (`responseid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `file_history`
--
ALTER TABLE `file_history`
  ADD CONSTRAINT `fk_history_admin` FOREIGN KEY (`adminid`) REFERENCES `admin` (`adminid`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_history_file` FOREIGN KEY (`fileid`) REFERENCES `files` (`fileid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `forms`
--
ALTER TABLE `forms`
  ADD CONSTRAINT `fk_forms_admin` FOREIGN KEY (`adminid`) REFERENCES `admin` (`adminid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `form_responses`
--
ALTER TABLE `form_responses`
  ADD CONSTRAINT `fk_response_client` FOREIGN KEY (`clientid`) REFERENCES `client` (`clientid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_response_form` FOREIGN KEY (`formid`) REFERENCES `forms` (`formid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `newsboard`
--
ALTER TABLE `newsboard`
  ADD CONSTRAINT `fk_news_admin` FOREIGN KEY (`adminid`) REFERENCES `admin` (`adminid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `organization_submissions`
--
ALTER TABLE `organization_submissions`
  ADD CONSTRAINT `fk_submission_client` FOREIGN KEY (`clientid`) REFERENCES `client` (`clientid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_submission_response` FOREIGN KEY (`responseid`) REFERENCES `form_responses` (`responseid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `org_documents`
--
ALTER TABLE `org_documents`
  ADD CONSTRAINT `fk_doc_client` FOREIGN KEY (`clientid`) REFERENCES `client` (`clientid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_doc_submission` FOREIGN KEY (`submission_id`) REFERENCES `org_form_submissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `org_form_submissions`
--
ALTER TABLE `org_form_submissions`
  ADD CONSTRAINT `fk_org_submission_client` FOREIGN KEY (`clientid`) REFERENCES `client` (`clientid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `submission_documents`
--
ALTER TABLE `submission_documents`
  ADD CONSTRAINT `fk_document_submission` FOREIGN KEY (`submission_id`) REFERENCES `organization_submissions` (`submission_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
