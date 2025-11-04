-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 04, 2025 at 12:00 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14
--
-- Database: `slu_org_db` - Redesigned Schema
-- Includes: Event details, feedback system, and file upload functionality
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
  `status` enum('Pending','Approved','Returned') NOT NULL DEFAULT 'Pending',
  `feedback` text DEFAULT NULL,
  `attachment_path` varchar(500) DEFAULT NULL,
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
-- Dumping sample data for table `org_form_submissions`
--

INSERT INTO `org_form_submissions` (`id`, `clientid`, `submission_title`, `org_full_name`, `org_acronym`, `org_email`, `social_media_links`, `applicant_name`, `applicant_position`, `applicant_email`, `adviser_names`, `adviser_emails`, `category`, `org_type`, `cbl_status`, `status`, `feedback`, `submitted_date`, `updated_date`) VALUES
(1, 1, 'End-Term Requirements AY 2024-2025', 'Integrated Computer Organization Network', 'ICON', 'icon@slu.edu.ph', 'https://facebook.com/SLU.ICON, https://instagram.com/slu.icon', 'Juan Dela Cruz', 'President', 'jdelacruz@slu.edu.ph', 'Prof. Maria Santos', 'msantos@slu.edu.ph', 'SAMCIS', 'co-curricular', 'without-revisions', 'Approved', 'All requirements are complete and well-documented. Great work on the event planning!', '2024-10-15 14:30:00', '2024-10-16 09:15:00'),
(2, 1, 'Mid-Year Report 2025', 'Integrated Computer Organization Network', 'ICON', 'icon@slu.edu.ph', 'https://facebook.com/SLU.ICON', 'Maria Clara Santos', 'Vice President', 'mcsantos@slu.edu.ph', 'Prof. Maria Santos', 'msantos@slu.edu.ph', 'SAMCIS', 'co-curricular', 'with-revisions', 'Returned', 'Please revise the budget estimates for Event 2 and provide more details on the expected outcomes. Resubmit within 5 working days.', '2024-10-25 10:20:00', '2024-10-26 11:30:00'),
(3, 1, 'First Semester Compliance 2024-2025', 'Integrated Computer Organization Network', 'ICON', 'icon@slu.edu.ph', 'https://facebook.com/SLU.ICON, https://twitter.com/slu_icon', 'Pedro Reyes', 'Secretary', 'preyes@slu.edu.ph', 'Prof. Maria Santos', 'msantos@slu.edu.ph', 'SAMCIS', 'co-curricular', 'without-revisions', 'Pending', NULL, '2024-11-01 16:45:00', '2024-11-01 16:45:00');

--
-- Dumping sample data for table `org_events`
--

INSERT INTO `org_events` (`event_id`, `submission_id`, `event_name`, `event_date`, `event_venue`, `event_description`, `expected_participants`, `budget_estimate`, `created_at`) VALUES
(1, 1, 'General Assembly 2024', '2024-11-15', 'Main Auditorium', 'Annual general assembly for all ICON members to discuss organizational goals and elect new officers.', 150, 5000.00, '2024-10-15 14:30:00'),
(2, 1, 'Tech Workshop Series', '2024-11-20', 'Computer Laboratory 3', 'Three-day workshop series covering web development, mobile app development, and cloud computing fundamentals.', 80, 12000.00, '2024-10-15 14:30:00'),
(3, 1, 'Community Outreach Program', '2024-12-05', 'Barangay San Vicente Hall', 'Basic computer literacy training for senior citizens and out-of-school youth in partnership with local barangay.', 50, 8000.00, '2024-10-15 14:30:00'),
(4, 2, 'Hackathon 2025', '2025-01-20', 'Innovation Hub', '24-hour hackathon event focusing on solving real-world problems using technology. Open to all SAMCIS students.', 100, 25000.00, '2024-10-25 10:20:00'),
(5, 2, 'Industry Talk: Career Paths in IT', '2025-02-10', 'Online via Zoom', 'Panel discussion with IT industry professionals sharing insights on various career opportunities in technology.', 200, 3000.00, '2024-10-25 10:20:00'),
(6, 3, 'ICON Week 2024', '2024-11-25', 'SAMCIS Building', 'Week-long celebration featuring coding competitions, gaming tournaments, and tech exhibits.', 300, 35000.00, '2024-11-01 16:45:00'),
(7, 3, 'Alumni Homecoming', '2024-12-15', 'SLU Main Campus', 'Reunion event for ICON alumni featuring networking sessions and organizational updates.', 120, 15000.00, '2024-11-01 16:45:00');

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
