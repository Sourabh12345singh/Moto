-- ============================================================
-- MotoShare Demo Seed Data
-- Password for demo accounts: demo123
-- BCrypt hash: $2a$10$IRIvS0OZN2NejfQkKVR1/eNmOsSY.cKtQ64.eSLtTd/RTYdzRbzdy
-- ============================================================

-- 1. Demo BIKER user (owns the demo bikes)
INSERT INTO users (name, phone_no, email, password, role, kyc_status)
VALUES (
    'Rahul Sharma',
    9876543210,
    'rahul.biker@motoshare.com',
    '$2a$10$IRIvS0OZN2NejfQkKVR1/eNmOsSY.cKtQ64.eSLtTd/RTYdzRbzdy',
    'BIKER',
    'APPROVED'
);

-- 2. Create biker entity for Rahul (user_id references the auto-generated ID above)
--    Since ddl-auto=create and this is the first user, user_id will be 1
INSERT INTO biker (user_id, rating, total_ratings)
VALUES (1, 4.5, 12);

-- ============================================================
-- DELHI BIKES (3 bikes)
-- ============================================================

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (1, 'Honda', 'Activa 6G', 80, 'DL01AB1234', 'DL01-2023-001234', 12000, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600');

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (1, 'Royal Enfield', 'Classic 350', 150, 'DL05CD5678', 'DL05-2022-005678', 25000, 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600');

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (1, 'Bajaj', 'Pulsar 150', 100, 'DL10EF9012', 'DL10-2024-009012', 8000, 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600');

-- ============================================================
-- MUMBAI BIKES (3 bikes)
-- ============================================================

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (1, 'TVS', 'Jupiter 125', 70, 'MH01GH3456', 'MH01-2023-003456', 15000, 'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=600');

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (1, 'Yamaha', 'R15 V4', 200, 'MH04IJ7890', 'MH04-2024-007890', 5000, 'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=600');

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (1, 'Hero', 'Splendor Plus', 60, 'MH02KL1122', 'MH02-2022-001122', 30000, 'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=600');

-- ============================================================
-- AVAILABILITY SLOTS (next 7 days)
-- Using CURRENT_TIMESTAMP so dates are always relative to server start
-- ============================================================

-- Delhi: Honda Activa 6G (bike_id = 1)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 1,
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '8 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '18 hours',
    80, true, 'Delhi', 'Rajiv Chowk Metro Gate 3');

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 1,
    CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '9 hours',
    CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '20 hours',
    80, true, 'Delhi', 'Rajiv Chowk Metro Gate 3');

-- Delhi: Royal Enfield Classic 350 (bike_id = 2)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 2,
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '7 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '22 hours',
    150, true, 'Delhi', 'Connaught Place, Near PVR');

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 2,
    CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '6 hours',
    CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '21 hours',
    150, true, 'Delhi', 'Connaught Place, Near PVR');

-- Delhi: Bajaj Pulsar 150 (bike_id = 3)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 3,
    CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '10 hours',
    CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '19 hours',
    100, true, 'Delhi', 'Karol Bagh Metro Station');

-- Mumbai: TVS Jupiter 125 (bike_id = 4)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 4,
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '8 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '20 hours',
    70, true, 'Mumbai', 'Andheri Station West Exit');

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 4,
    CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '7 hours',
    CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '19 hours',
    70, true, 'Mumbai', 'Andheri Station West Exit');

-- Mumbai: Yamaha R15 V4 (bike_id = 5)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 5,
    CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '9 hours',
    CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '22 hours',
    200, true, 'Mumbai', 'Bandra Bandstand, Near Sea Link');

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 5,
    CURRENT_TIMESTAMP + INTERVAL '6 days' + INTERVAL '8 hours',
    CURRENT_TIMESTAMP + INTERVAL '6 days' + INTERVAL '20 hours',
    200, true, 'Mumbai', 'Bandra Bandstand, Near Sea Link');

-- Mumbai: Hero Splendor Plus (bike_id = 6)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 6,
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '6 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '18 hours',
    60, true, 'Mumbai', 'Dadar Station East');
