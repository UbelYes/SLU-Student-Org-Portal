-- Create org_form_submissions table for storing organization form submissions
-- This table is used by the OSA staff to view and manage student organization submissions

USE `slu_org_db`;

-- Drop table if exists (be careful in production!)
DROP TABLE IF EXISTS `org_form_submissions`;

-- Create the table
CREATE TABLE `org_form_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clientid` int NOT NULL,
  
  -- Submission Information
  `submission_title` varchar(255) NOT NULL,
  
  -- Organization Information
  `org_full_name` varchar(255) NOT NULL,
  `org_acronym` varchar(50) NOT NULL,
  `org_email` varchar(100) NOT NULL,
  `social_media_links` text,
  
  -- Applicant Information
  `applicant_name` varchar(150) NOT NULL,
  `applicant_position` varchar(100) NOT NULL,
  `applicant_email` varchar(100) NOT NULL,
  
  -- Adviser Information
  `adviser_names` text NOT NULL,
  `adviser_emails` text NOT NULL,
  
  -- Category (stored as comma-separated values: SAMCIS, SAMCS, etc.)
  `category` varchar(255) NOT NULL,
  
  -- Type of Organization
  `org_type` varchar(50) NOT NULL,
  
  -- CBL Status
  `cbl_status` varchar(50) NOT NULL,
  
  -- Video Link
  `video_link` varchar(500) NOT NULL,
  
  -- Status
  `status` enum('Pending','Approved','Returned') NOT NULL DEFAULT 'Pending',
  
  -- Metadata
  `submitted_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `fk_org_submission_client` (`clientid`),
  CONSTRAINT `fk_org_submission_client` FOREIGN KEY (`clientid`) REFERENCES `client` (`clientid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add some sample data for testing (optional)
-- Uncomment the following lines if you want to add test data:
/*
INSERT INTO `org_form_submissions` (
  `clientid`, `submission_title`, `org_full_name`, `org_acronym`, `org_email`, 
  `social_media_links`, `applicant_name`, `applicant_position`, `applicant_email`,
  `adviser_names`, `adviser_emails`, `category`, `org_type`, `cbl_status`, `video_link`, `status`
) VALUES
(1, 'End Term Requirement 2024-2025', 'Student Alliance for Music and Creative Industry Studies', 'SAMCIS', 'samcis@slu.edu.ph',
 'https://facebook.com/samcis, https://instagram.com/samcis', 'Juan Dela Cruz', 'President', 'jdelacruz@slu.edu.ph',
 'Prof. Maria Santos', 'msantos@slu.edu.ph', 'SAMCIS', 'Co-Curricular', 'Without Revisions', 
 'https://youtube.com/watch?v=example', 'Pending'),
(2, 'Mid Term Requirement 2024-2025', 'Institute for Computing and Communications', 'ICON', 'icon@slu.edu.ph',
 'https://facebook.com/icon', 'Jane Smith', 'Vice President', 'jsmith@slu.edu.ph',
 'Prof. John Doe', 'jdoe@slu.edu.ph', 'SAMCIS', 'Extra-Curricular', 'With Revisions', 
 'https://youtube.com/watch?v=example2', 'Approved');
*/
