USE mamacare_immunisation;

INSERT INTO users (id, full_name, phone, email, password, role, status, preferred_reminder_method) VALUES
(1, 'Grace Nakato', '+256700000001', 'admin@mamacare.test', '$2b$10$X9dyAJPYOv7iGvybwQWU/.S3PifGUiJWce9DVifLdESg.H57e9z1y', 'admin', 'active', 'in_app'),
(2, 'Amina Nansubuga', '+256700000002', 'amina@mamacare.test', '$2b$10$1/RC7k6HZ3GmMSnuzCnGP./0OZqLI.kidLAXFdS5Y3o4ILqMacb4y', 'caregiver', 'active', 'sms'),
(3, 'Sarah Achiro', '+256700000003', 'sarah@mamacare.test', '$2b$10$1/RC7k6HZ3GmMSnuzCnGP./0OZqLI.kidLAXFdS5Y3o4ILqMacb4y', 'caregiver', 'active', 'whatsapp'),
(4, 'Prossy Namutebi', '+256700000004', 'prossy@mamacare.test', '$2b$10$1/RC7k6HZ3GmMSnuzCnGP./0OZqLI.kidLAXFdS5Y3o4ILqMacb4y', 'caregiver', 'active', 'in_app');

INSERT INTO health_facilities (id, name, district, subcounty, phone) VALUES
(1, 'Kisenyi Health Centre IV', 'Kampala', 'Central Division', '+256414000100'),
(2, 'Mukono General Hospital', 'Mukono', 'Mukono Central', '+256414000200'),
(3, 'Gulu Regional Referral Hospital', 'Gulu', 'Bardege-Layibi', '+256414000300'),
(4, 'Mbarara Regional Referral Hospital', 'Mbarara', 'Mbarara City', '+256414000400');

INSERT INTO immunisation_schedule
(id, vaccine_name, description, recommended_age_label, due_offset_days, dose_number, is_required, is_active) VALUES
(1, 'BCG', 'Protection against severe tuberculosis.', 'At birth', 0, 1, 1, 1),
(2, 'OPV 0', 'Oral polio vaccine birth dose.', 'At birth', 0, 0, 1, 1),
(3, 'Hepatitis B Birth Dose', 'Hepatitis B birth dose where available.', 'At birth', 0, 1, 1, 1),
(4, 'DPT-HepB-Hib 1', 'First pentavalent vaccine dose.', '6 weeks', 42, 1, 1, 1),
(5, 'OPV 1', 'First oral polio vaccine routine dose.', '6 weeks', 42, 1, 1, 1),
(6, 'PCV 1', 'First pneumococcal conjugate vaccine dose.', '6 weeks', 42, 1, 1, 1),
(7, 'Rotavirus 1', 'First rotavirus vaccine dose.', '6 weeks', 42, 1, 1, 1),
(8, 'DPT-HepB-Hib 2', 'Second pentavalent vaccine dose.', '10 weeks', 70, 2, 1, 1),
(9, 'OPV 2', 'Second oral polio vaccine routine dose.', '10 weeks', 70, 2, 1, 1),
(10, 'PCV 2', 'Second pneumococcal conjugate vaccine dose.', '10 weeks', 70, 2, 1, 1),
(11, 'Rotavirus 2', 'Second rotavirus vaccine dose.', '10 weeks', 70, 2, 1, 1),
(12, 'DPT-HepB-Hib 3', 'Third pentavalent vaccine dose.', '14 weeks', 98, 3, 1, 1),
(13, 'OPV 3', 'Third oral polio vaccine routine dose.', '14 weeks', 98, 3, 1, 1),
(14, 'PCV 3', 'Third pneumococcal conjugate vaccine dose.', '14 weeks', 98, 3, 1, 1),
(15, 'IPV', 'Inactivated polio vaccine.', '14 weeks', 98, 1, 1, 1),
(16, 'Malaria Vaccine 1', 'Optional malaria vaccine dose for eligible rollout areas.', '6 months', 182, 1, 0, 1),
(17, 'Malaria Vaccine 2', 'Optional malaria vaccine dose for eligible rollout areas.', '7 months', 213, 2, 0, 1),
(18, 'Malaria Vaccine 3', 'Optional malaria vaccine dose for eligible rollout areas.', '8 months', 243, 3, 0, 1),
(19, 'Measles-Rubella 1', 'First measles-rubella vaccine dose.', '9 months', 274, 1, 1, 1),
(20, 'Yellow Fever', 'Yellow fever vaccine.', '9 months', 274, 1, 1, 1),
(21, 'Measles-Rubella 2', 'Second measles-rubella vaccine dose.', '18 months', 548, 2, 1, 1),
(22, 'Malaria Vaccine 4', 'Optional malaria vaccine booster for eligible rollout areas.', '18 months', 548, 4, 0, 1);

INSERT INTO children
(id, caregiver_id, full_name, date_of_birth, gender, birth_place, district, subcounty, health_facility_id, immunisation_card_number) VALUES
(1, 2, 'Mariam Kato', DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Female', 'Kisenyi Health Centre IV', 'Kampala', 'Central Division', 1, 'UG-KLA-001'),
(2, 2, 'Isaac Kato', DATE_SUB(CURDATE(), INTERVAL 84 DAY), 'Male', 'Mukono General Hospital', 'Mukono', 'Mukono Central', 2, 'UG-MUK-002'),
(3, 3, 'Laker Aciro', DATE_SUB(CURDATE(), INTERVAL 200 DAY), 'Female', 'Gulu Regional Referral Hospital', 'Gulu', 'Bardege-Layibi', 3, 'UG-GUL-003'),
(4, 3, 'Daniel Okello', DATE_SUB(CURDATE(), INTERVAL 560 DAY), 'Male', 'Gulu Regional Referral Hospital', 'Gulu', 'Bardege-Layibi', 3, 'UG-GUL-004'),
(5, 4, 'Hope Birungi', DATE_SUB(CURDATE(), INTERVAL 267 DAY), 'Female', 'Mbarara Regional Referral Hospital', 'Mbarara', 'Mbarara City', 4, 'UG-MBA-005');

INSERT INTO child_immunisations (child_id, schedule_id, due_date, status, date_received, health_facility_id, notes)
SELECT c.id, s.id, DATE_ADD(c.date_of_birth, INTERVAL s.due_offset_days DAY),
  CASE
    WHEN DATE_ADD(c.date_of_birth, INTERVAL s.due_offset_days DAY) < DATE_SUB(CURDATE(), INTERVAL 14 DAY) THEN 'completed'
    WHEN DATE_ADD(c.date_of_birth, INTERVAL s.due_offset_days DAY) < CURDATE() THEN 'missed'
    WHEN DATE_ADD(c.date_of_birth, INTERVAL s.due_offset_days DAY) <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'upcoming'
    ELSE 'pending'
  END,
  CASE
    WHEN DATE_ADD(c.date_of_birth, INTERVAL s.due_offset_days DAY) < DATE_SUB(CURDATE(), INTERVAL 14 DAY)
    THEN DATE_ADD(DATE_ADD(c.date_of_birth, INTERVAL s.due_offset_days DAY), INTERVAL 1 DAY)
    ELSE NULL
  END,
  CASE
    WHEN DATE_ADD(c.date_of_birth, INTERVAL s.due_offset_days DAY) < DATE_SUB(CURDATE(), INTERVAL 14 DAY)
    THEN c.health_facility_id
    ELSE NULL
  END,
  CASE
    WHEN DATE_ADD(c.date_of_birth, INTERVAL s.due_offset_days DAY) < DATE_SUB(CURDATE(), INTERVAL 14 DAY)
    THEN 'Recorded during seed setup'
    ELSE NULL
  END
FROM children c
JOIN immunisation_schedule s ON s.is_active = 1;

INSERT INTO reminders (child_id, caregiver_id, child_immunisation_id, reminder_type, message, reminder_date, status)
SELECT c.id, c.caregiver_id, ci.id, 'seven_day',
       CONCAT(c.full_name, ' is due for ', s.vaccine_name, ' on ', DATE_FORMAT(ci.due_date, '%Y-%m-%d'), '.'),
       DATE_SUB(ci.due_date, INTERVAL 7 DAY),
       'unread'
FROM child_immunisations ci
JOIN children c ON c.id = ci.child_id
JOIN immunisation_schedule s ON s.id = ci.schedule_id
WHERE ci.status IN ('upcoming', 'missed')
LIMIT 8;
