-- Simplified database schema
-- Database: simple_portal

DROP DATABASE IF EXISTS `simple_portal`;
CREATE DATABASE `simple_portal`;
USE `simple_portal`;

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
