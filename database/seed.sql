-- PostgreSQL seed data for ImmuniTrack

INSERT INTO users (id, full_name, phone, email, password, role, status, preferred_reminder_method) VALUES
(1, 'Grace Nakato', '+256700000001', 'admin@immunitrack.test', '$2b$10$X9dyAJPYOv7iGvybwQWU/.S3PifGUiJWce9DVifLdESg.H57e9z1y', 'admin'::user_role, 'active'::user_status, 'in_app'::reminder_method),
(2, 'Amina Nansubuga', '+256700000002', 'amina@immunitrack.test', '$2b$10$1/RC7k6HZ3GmMSnuzCnGP./0OZqLI.kidLAXFdS5Y3o4ILqMacb4y', 'caregiver'::user_role, 'active'::user_status, 'sms'::reminder_method),
(3, 'Sarah Achiro', '+256700000003', 'sarah@immunitrack.test', '$2b$10$1/RC7k6HZ3GmMSnuzCnGP./0OZqLI.kidLAXFdS5Y3o4ILqMacb4y', 'caregiver'::user_role, 'active'::user_status, 'whatsapp'::reminder_method),
(4, 'Prossy Namutebi', '+256700000004', 'prossy@immunitrack.test', '$2b$10$1/RC7k6HZ3GmMSnuzCnGP./0OZqLI.kidLAXFdS5Y3o4ILqMacb4y', 'caregiver'::user_role, 'active'::user_status, 'in_app'::reminder_method);

-- Adjust user sequence because of manual ID insertion
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

INSERT INTO health_facilities (id, name, district, subcounty, phone) VALUES
(1, 'Kisenyi Health Centre IV', 'Kampala', 'Central Division', '+256414000100'),
(2, 'Mukono General Hospital', 'Mukono', 'Mukono Central', '+256414000200'),
(3, 'Gulu Regional Referral Hospital', 'Gulu', 'Bardege-Layibi', '+256414000300'),
(4, 'Mbarara Regional Referral Hospital', 'Mbarara', 'Mbarara City', '+256414000400');

SELECT setval('health_facilities_id_seq', (SELECT MAX(id) FROM health_facilities));

INSERT INTO immunisation_schedule
(id, vaccine_name, description, recommended_age_label, due_offset_days, dose_number, is_required, is_active) VALUES
(1, 'BCG', 'Protection against severe tuberculosis.', 'At birth', 0, 1, TRUE, TRUE),
(2, 'OPV 0', 'Oral polio vaccine birth dose.', 'At birth', 0, 0, TRUE, TRUE),
(3, 'Hepatitis B Birth Dose', 'Hepatitis B birth dose where available.', 'At birth', 0, 1, TRUE, TRUE),
(4, 'DPT-HepB-Hib 1', 'First pentavalent vaccine dose.', '6 weeks', 42, 1, TRUE, TRUE),
(5, 'OPV 1', 'First oral polio vaccine routine dose.', '6 weeks', 42, 1, TRUE, TRUE),
(6, 'PCV 1', 'First pneumococcal conjugate vaccine dose.', '6 weeks', 42, 1, TRUE, TRUE),
(7, 'Rotavirus 1', 'First rotavirus vaccine dose.', '6 weeks', 42, 1, TRUE, TRUE),
(8, 'DPT-HepB-Hib 2', 'Second pentavalent vaccine dose.', '10 weeks', 70, 2, TRUE, TRUE),
(9, 'OPV 2', 'Second oral polio vaccine routine dose.', '10 weeks', 70, 2, TRUE, TRUE),
(10, 'PCV 2', 'Second pneumococcal conjugate vaccine dose.', '10 weeks', 70, 2, TRUE, TRUE),
(11, 'Rotavirus 2', 'Second rotavirus vaccine dose.', '10 weeks', 70, 2, TRUE, TRUE),
(12, 'DPT-HepB-Hib 3', 'Third pentavalent vaccine dose.', '14 weeks', 98, 3, TRUE, TRUE),
(13, 'OPV 3', 'Third oral polio vaccine routine dose.', '14 weeks', 98, 3, TRUE, TRUE),
(14, 'PCV 3', 'Third pneumococcal conjugate vaccine dose.', '14 weeks', 98, 3, TRUE, TRUE),
(15, 'IPV', 'Inactivated polio vaccine.', '14 weeks', 98, 1, TRUE, TRUE),
(16, 'Malaria Vaccine 1', 'Optional malaria vaccine dose for eligible rollout areas.', '6 months', 182, 1, FALSE, TRUE),
(17, 'Malaria Vaccine 2', 'Optional malaria vaccine dose for eligible rollout areas.', '7 months', 213, 2, FALSE, TRUE),
(18, 'Malaria Vaccine 3', 'Optional malaria vaccine dose for eligible rollout areas.', '8 months', 243, 3, FALSE, TRUE),
(19, 'Measles-Rubella 1', 'First measles-rubella vaccine dose.', '9 months', 274, 1, TRUE, TRUE),
(20, 'Yellow Fever', 'Yellow fever vaccine.', '9 months', 274, 1, TRUE, TRUE),
(21, 'Measles-Rubella 2', 'Second measles-rubella vaccine dose.', '18 months', 548, 2, TRUE, TRUE),
(22, 'Malaria Vaccine 4', 'Optional malaria vaccine booster for eligible rollout areas.', '18 months', 548, 4, FALSE, TRUE);

SELECT setval('immunisation_schedule_id_seq', (SELECT MAX(id) FROM immunisation_schedule));

INSERT INTO children
(id, caregiver_id, full_name, date_of_birth, gender, birth_place, district, subcounty, health_facility_id, immunisation_card_number) VALUES
(1, 2, 'Mariam Kato', CURRENT_DATE - INTERVAL '20 days', 'Female'::gender_type, 'Kisenyi Health Centre IV', 'Kampala', 'Central Division', 1, 'UG-KLA-001'),
(2, 2, 'Isaac Kato', CURRENT_DATE - INTERVAL '84 days', 'Male'::gender_type, 'Mukono General Hospital', 'Mukono', 'Mukono Central', 2, 'UG-MUK-002'),
(3, 3, 'Laker Aciro', CURRENT_DATE - INTERVAL '200 days', 'Female'::gender_type, 'Gulu Regional Referral Hospital', 'Gulu', 'Bardege-Layibi', 3, 'UG-GUL-003'),
(4, 3, 'Daniel Okello', CURRENT_DATE - INTERVAL '560 days', 'Male'::gender_type, 'Gulu Regional Referral Hospital', 'Gulu', 'Bardege-Layibi', 3, 'UG-GUL-004'),
(5, 4, 'Hope Birungi', CURRENT_DATE - INTERVAL '267 days', 'Female'::gender_type, 'Mbarara Regional Referral Hospital', 'Mbarara', 'Mbarara City', 4, 'UG-MBA-005');

SELECT setval('children_id_seq', (SELECT MAX(id) FROM children));

INSERT INTO child_immunisations (child_id, schedule_id, due_date, status, date_received, health_facility_id, notes)
SELECT c.id, s.id, c.date_of_birth + s.due_offset_days,
  CASE
    WHEN c.date_of_birth + s.due_offset_days < CURRENT_DATE - INTERVAL '14 days' THEN 'completed'::immunisation_status
    WHEN c.date_of_birth + s.due_offset_days < CURRENT_DATE THEN 'missed'::immunisation_status
    WHEN c.date_of_birth + s.due_offset_days <= CURRENT_DATE + INTERVAL '7 days' THEN 'upcoming'::immunisation_status
    ELSE 'pending'::immunisation_status
  END,
  CASE
    WHEN c.date_of_birth + s.due_offset_days < CURRENT_DATE - INTERVAL '14 days'
    THEN c.date_of_birth + s.due_offset_days + 1
    ELSE NULL
  END,
  CASE
    WHEN c.date_of_birth + s.due_offset_days < CURRENT_DATE - INTERVAL '14 days'
    THEN c.health_facility_id
    ELSE NULL
  END,
  CASE
    WHEN c.date_of_birth + s.due_offset_days < CURRENT_DATE - INTERVAL '14 days'
    THEN 'Recorded during seed setup'
    ELSE NULL
  END
FROM children c
JOIN immunisation_schedule s ON s.is_active = TRUE;

INSERT INTO reminders (child_id, caregiver_id, child_immunisation_id, reminder_type, message, reminder_date, status)
SELECT c.id, c.caregiver_id, ci.id, 'seven_day'::reminder_type_enum,
       CONCAT(c.full_name, ' is due for ', s.vaccine_name, ' on ', to_char(ci.due_date, 'YYYY-MM-DD'), '.'),
       ci.due_date - 7,
       'unread'::reminder_status
FROM child_immunisations ci
JOIN children c ON c.id = ci.child_id
JOIN immunisation_schedule s ON s.id = ci.schedule_id
WHERE ci.status IN ('upcoming'::immunisation_status, 'missed'::immunisation_status)
LIMIT 8;
