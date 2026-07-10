-- PostgreSQL database schema for ImmuniTrack

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS child_immunisations CASCADE;
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS immunisation_schedule CASCADE;
DROP TABLE IF EXISTS health_facilities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS reminder_method CASCADE;
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS immunisation_status CASCADE;
DROP TYPE IF EXISTS reminder_type_enum CASCADE;
DROP TYPE IF EXISTS reminder_status CASCADE;

CREATE TYPE user_role AS ENUM ('admin', 'health_worker', 'caregiver');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE reminder_method AS ENUM ('in_app', 'sms', 'whatsapp');
CREATE TYPE gender_type AS ENUM ('Female', 'Male', 'Other');
CREATE TYPE immunisation_status AS ENUM ('pending', 'upcoming', 'completed', 'missed');
CREATE TYPE reminder_type_enum AS ENUM ('seven_day', 'one_day', 'overdue');
CREATE TYPE reminder_status AS ENUM ('unread', 'read');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'caregiver',
  status user_status NOT NULL DEFAULT 'active',
  preferred_reminder_method reminder_method NOT NULL DEFAULT 'in_app',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE health_facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  district VARCHAR(100) NOT NULL,
  subcounty VARCHAR(120),
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE immunisation_schedule (
  id SERIAL PRIMARY KEY,
  vaccine_name VARCHAR(180) NOT NULL,
  description TEXT,
  recommended_age_label VARCHAR(80) NOT NULL,
  due_offset_days INT NOT NULL,
  dose_number INT NOT NULL DEFAULT 1,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE children (
  id SERIAL PRIMARY KEY,
  caregiver_id INT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender_type NOT NULL,
  birth_place VARCHAR(180),
  district VARCHAR(100) NOT NULL,
  subcounty VARCHAR(120),
  health_facility_id INT,
  immunisation_card_number VARCHAR(80),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_children_caregiver FOREIGN KEY (caregiver_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_children_facility FOREIGN KEY (health_facility_id) REFERENCES health_facilities(id) ON DELETE SET NULL
);

CREATE TABLE child_immunisations (
  id SERIAL PRIMARY KEY,
  child_id INT NOT NULL,
  schedule_id INT NOT NULL,
  due_date DATE NOT NULL,
  status immunisation_status NOT NULL DEFAULT 'pending',
  date_received DATE,
  health_facility_id INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_child_schedule UNIQUE (child_id, schedule_id),
  CONSTRAINT fk_immunisations_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  CONSTRAINT fk_immunisations_schedule FOREIGN KEY (schedule_id) REFERENCES immunisation_schedule(id) ON DELETE CASCADE,
  CONSTRAINT fk_immunisations_facility FOREIGN KEY (health_facility_id) REFERENCES health_facilities(id) ON DELETE SET NULL
);

CREATE INDEX idx_child_immunisations_due ON child_immunisations(due_date);
CREATE INDEX idx_child_immunisations_status ON child_immunisations(status);

CREATE TABLE reminders (
  id SERIAL PRIMARY KEY,
  child_id INT NOT NULL,
  caregiver_id INT NOT NULL,
  child_immunisation_id INT NOT NULL,
  reminder_type reminder_type_enum NOT NULL,
  message TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  status reminder_status NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_event_reminder UNIQUE (child_immunisation_id, reminder_type),
  CONSTRAINT fk_reminders_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  CONSTRAINT fk_reminders_caregiver FOREIGN KEY (caregiver_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reminders_immunisation FOREIGN KEY (child_immunisation_id) REFERENCES child_immunisations(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80),
  entity_id INT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Triggers to auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_facilities_modtime BEFORE UPDATE ON health_facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_immunisation_schedule_modtime BEFORE UPDATE ON immunisation_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_children_modtime BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_child_immunisations_modtime BEFORE UPDATE ON child_immunisations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_modtime BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
