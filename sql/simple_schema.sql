-- Simplified database schema
-- Database: simple_portal

DROP DATABASE IF EXISTS `simple_portal`;
CREATE DATABASE `simple_portal`;
USE `simple_portal`;

-- Users table for authentication
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_type` varchar(20) NOT NULL COMMENT 'admin, osa, org',
  `name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample credentials (passwords are plain text for simplicity)
INSERT INTO `users` (`email`, `password`, `user_type`, `name`) VALUES
('admin@slu.edu.ph', 'admin123', 'admin', 'Admin User'),
('osa@slu.edu.ph', 'osa123', 'osa', 'OSA Staff'),
('icon@slu.edu.ph', 'icon123', 'org', 'Student Council');

-- Simple submissions table
CREATE TABLE `submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_title` varchar(255) NOT NULL,
  `org_name` varchar(200) NOT NULL,
  `org_acronym` varchar(50) NOT NULL,
  `org_email` varchar(100) NOT NULL,
  `social_media` text,
  `applicant_name` varchar(100) NOT NULL,
  `applicant_position` varchar(100) NOT NULL,
  `applicant_email` varchar(100) NOT NULL,
  `adviser_names` text NOT NULL,
  `adviser_emails` text NOT NULL,
  `organization_school` varchar(255) NOT NULL,
  `organization_type` varchar(50) NOT NULL,
  `events_json` text,
  `file_path` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data
INSERT INTO `submissions` (`submission_title`, `org_name`, `org_acronym`, `org_email`, `social_media`, 
    `applicant_name`, `applicant_position`, `applicant_email`, `adviser_names`, `adviser_emails`, 
    `organization_school`, `organization_type`, `events_json`) VALUES
('Annual Event Proposal', 'Student Council', 'SC', 'sc@slu.edu.ph', 'https://facebook.com/sc', 
    'John Doe', 'President', 'jdoe@slu.edu.ph', 'Prof. Smith', 'smith@slu.edu.ph', 
    'SAMCIS,University-Wide', 'co-curricular', '[]'),
('Workshop Registration', 'Tech Club', 'TC', 'tech@slu.edu.ph', 'https://facebook.com/techclub', 
    'Jane Smith', 'Vice President', 'jsmith@slu.edu.ph', 'Prof. Johnson', 'johnson@slu.edu.ph', 
    'SAMCIS', 'extra-curricular', '[]'),
('Exhibition Request', 'Arts Society', 'AS', 'arts@slu.edu.ph', '', 
    'Bob Johnson', 'Secretary', 'bjohnson@slu.edu.ph', 'Prof. Williams', 'williams@slu.edu.ph', 
    'STELA', 'extra-curricular', '[]');
