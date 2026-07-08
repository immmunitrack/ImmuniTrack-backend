CREATE DATABASE IF NOT EXISTS immunitrack_immunisation;
USE immunitrack_immunisation;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS child_immunisations;
DROP TABLE IF EXISTS children;
DROP TABLE IF EXISTS immunisation_schedule;
DROP TABLE IF EXISTS health_facilities;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'health_worker', 'caregiver') NOT NULL DEFAULT 'caregiver',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  preferred_reminder_method ENUM('in_app', 'sms', 'whatsapp') NOT NULL DEFAULT 'in_app',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE health_facilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  district VARCHAR(100) NOT NULL,
  subcounty VARCHAR(120),
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE immunisation_schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vaccine_name VARCHAR(180) NOT NULL,
  description TEXT,
  recommended_age_label VARCHAR(80) NOT NULL,
  due_offset_days INT NOT NULL,
  dose_number INT NOT NULL DEFAULT 1,
  is_required TINYINT(1) NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE children (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caregiver_id INT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('Female', 'Male', 'Other') NOT NULL,
  birth_place VARCHAR(180),
  district VARCHAR(100) NOT NULL,
  subcounty VARCHAR(120),
  health_facility_id INT,
  immunisation_card_number VARCHAR(80),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_children_caregiver FOREIGN KEY (caregiver_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_children_facility FOREIGN KEY (health_facility_id) REFERENCES health_facilities(id) ON DELETE SET NULL
);

CREATE TABLE child_immunisations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  schedule_id INT NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('pending', 'upcoming', 'completed', 'missed') NOT NULL DEFAULT 'pending',
  date_received DATE,
  health_facility_id INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_child_schedule (child_id, schedule_id),
  INDEX idx_child_immunisations_due (due_date),
  INDEX idx_child_immunisations_status (status),
  CONSTRAINT fk_immunisations_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  CONSTRAINT fk_immunisations_schedule FOREIGN KEY (schedule_id) REFERENCES immunisation_schedule(id) ON DELETE CASCADE,
  CONSTRAINT fk_immunisations_facility FOREIGN KEY (health_facility_id) REFERENCES health_facilities(id) ON DELETE SET NULL
);

CREATE TABLE reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  caregiver_id INT NOT NULL,
  child_immunisation_id INT NOT NULL,
  reminder_type ENUM('seven_day', 'one_day', 'overdue') NOT NULL,
  message TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  status ENUM('unread', 'read') NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_event_reminder (child_immunisation_id, reminder_type),
  CONSTRAINT fk_reminders_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  CONSTRAINT fk_reminders_caregiver FOREIGN KEY (caregiver_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reminders_immunisation FOREIGN KEY (child_immunisation_id) REFERENCES child_immunisations(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80),
  entity_id INT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
