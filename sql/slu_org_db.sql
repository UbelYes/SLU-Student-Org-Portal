-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 03, 2025 at 12:00 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14
--
-- Database: `slu_org_db` - Redesigned Schema
-- Removed unused tables and added event details functionality
--

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

DROP DATABASE IF EXISTS `slu_org_db`;
CREATE DATABASE `slu_org_db`;
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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`adminid`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`adminid`, `username`, `password`, `email`, `role`, `last_login`, `status`, `created_at`) VALUES
(1, 'admin', 'admin123', 'admin@slu.edu.ph', 'super_admin', '2025-11-03 12:00:00', 'active', '2025-11-03 12:00:00'),
(2, 'osa', 'osa123', 'osa@slu.edu.ph', 'osa_admin', NULL, 'active', '2025-11-03 12:00:00');

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
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`clientid`),
  UNIQUE KEY `org_name` (`org_name`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`clientid`, `org_name`, `username`, `password`, `email`, `status`, `last_login`, `created_at`) VALUES
(1, 'ICON', 'icon', 'icon123', 'icon@slu.edu.ph', 'active', '2025-11-03 12:00:00', '2025-11-03 12:00:00');

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
  `duration` int DEFAULT NULL COMMENT 'Duration in minutes',
  `auto_logout_flag` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`activityid`),
  KEY `idx_userid` (`userid`),
  KEY `idx_user_type` (`user_type`),
  KEY `idx_login_time` (`login_time`)
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
  `category` varchar(255) NOT NULL COMMENT 'Comma-separated categories: SAMCIS, SEA, SOM, SONAHBS, SOL, STELA, University-Wide',
  `org_type` enum('co-curricular','extra-curricular','publication') NOT NULL,
  `cbl_status` enum('with-revisions','without-revisions') NOT NULL,
  `video_link` varchar(500) NOT NULL,
  `status` enum('Pending','Approved','Returned') NOT NULL DEFAULT 'Pending',
  `submitted_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_org_submission_client` (`clientid`),
  KEY `idx_status` (`status`),
  KEY `idx_submitted_date` (`submitted_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `org_events`
--

DROP TABLE IF EXISTS `org_events`;
CREATE TABLE IF NOT EXISTS `org_events` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `event_date` date NOT NULL,
  `event_venue` varchar(255) NOT NULL,
  `event_description` text NOT NULL,
  `expected_participants` int NOT NULL,
  `budget_estimate` decimal(10,2) DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`event_id`),
  KEY `fk_event_submission` (`submission_id`),
  KEY `idx_event_date` (`event_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `org_form_submissions`
--
ALTER TABLE `org_form_submissions`
  ADD CONSTRAINT `fk_org_submission_client` FOREIGN KEY (`clientid`) REFERENCES `client` (`clientid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `org_events`
--
ALTER TABLE `org_events`
  ADD CONSTRAINT `fk_event_submission` FOREIGN KEY (`submission_id`) REFERENCES `org_form_submissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
