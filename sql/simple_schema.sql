-- Simplified database schema
-- Database: simple_portal

DROP DATABASE IF EXISTS `simple_portal`;
CREATE DATABASE `simple_portal`;
USE `simple_portal`;

-- Simple submissions table
CREATE TABLE `submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `org_name` varchar(200) NOT NULL,
  `submission_title` varchar(200) NOT NULL,
  `applicant_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data
INSERT INTO `submissions` (`org_name`, `submission_title`, `applicant_name`) VALUES
('Student Council', 'Annual Event Proposal', 'John Doe'),
('Tech Club', 'Workshop Registration', 'Jane Smith'),
('Arts Society', 'Exhibition Request', 'Bob Johnson');
