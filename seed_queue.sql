
-- Create appointments for today if not exist
INSERT INTO appointments (patient_id, doctor_id, room_id, appointment_date, appointment_time, status, reason, created_at)
VALUES 
  (1, 1, 1, CURRENT_DATE, '08:00', 'CHECKED_IN', 'Khám sức khỏe định kỳ', NOW()),
  (2, 1, 1, CURRENT_DATE, '08:30', 'CHECKED_IN', 'Đau tức ngực trái khó thở', NOW()),
  (3, 1, 1, CURRENT_DATE, '09:00', 'CHECKED_IN', 'Tăng huyết áp dao động', NOW()),
  (4, 1, 1, CURRENT_DATE, '09:30', 'CHECKED_IN', 'Tái khám đái tháo đường', NOW())
ON CONFLICT DO NOTHING;

-- Get the appointment ids and insert check_ins
INSERT INTO check_ins (appointment_id, method, status, triage_level, checked_in_at, triaged_at, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, spo2)
SELECT a.id, 'KIOSK', 'CHECKED_IN', 'LEVEL_3_URGENT', NOW(), NOW(), 120, 80, 75, 36.8, 98
FROM appointments a
WHERE a.appointment_date = CURRENT_DATE AND a.room_id = 1
ON CONFLICT (appointment_id) DO NOTHING;

-- Delete any old queue_tickets for room 1 on CURRENT_DATE to avoid duplicates
DELETE FROM queue_tickets WHERE room_id = 1 AND queue_date = CURRENT_DATE;

-- Insert the 4 queue tickets
INSERT INTO queue_tickets (
    queue_number, status, priority_score, urgency_level, is_walk_in, is_return_patient, 
    estimated_wait_minutes, queue_date, created_at, called_at, check_in_id, doctor_id, room_id
)
SELECT 
    'A-108', 'CALLED', 85, 3, false, false, 0, CURRENT_DATE, NOW() - interval '25 minutes', NOW() - interval '2 minutes',
    (SELECT c.id FROM check_ins c JOIN appointments a ON c.appointment_id = a.id WHERE a.patient_id = 1 AND a.appointment_date = CURRENT_DATE LIMIT 1),
    1, 1
UNION ALL
SELECT 
    'A-109', 'WAITING', 72, 3, false, false, 15, CURRENT_DATE, NOW() - interval '18 minutes', null,
    (SELECT c.id FROM check_ins c JOIN appointments a ON c.appointment_id = a.id WHERE a.patient_id = 2 AND a.appointment_date = CURRENT_DATE LIMIT 1),
    1, 1
UNION ALL
SELECT 
    'A-110', 'WAITING', 65, 3, false, false, 30, CURRENT_DATE, NOW() - interval '12 minutes', null,
    (SELECT c.id FROM check_ins c JOIN appointments a ON c.appointment_id = a.id WHERE a.patient_id = 3 AND a.appointment_date = CURRENT_DATE LIMIT 1),
    1, 1
UNION ALL
SELECT 
    'A-111', 'WAITING', 58, 4, false, false, 45, CURRENT_DATE, NOW() - interval '5 minutes', null,
    (SELECT c.id FROM check_ins c JOIN appointments a ON c.appointment_id = a.id WHERE a.patient_id = 4 AND a.appointment_date = CURRENT_DATE LIMIT 1),
    1, 1;
