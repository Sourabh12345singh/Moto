-- ============================================================
-- MotoShare Production Seed Data
-- Password for ALL accounts: Singh@123
-- BCrypt hash: $2a$10$Vwu7ZIjg5.CtonE5Pe5KgumkimBWXKVkfZZhN8UtrSavCJ3q83NQC
-- ============================================================

-- ============================================================
-- USERS (3 accounts)
-- ============================================================

-- User 1: ADMIN (Sourabh - app owner)
INSERT INTO users (name, phone_no, email, password, role, kyc_status)
VALUES (
    'Sourabh Singh',
    9999900001,
    'sourabh20092004@gmail.com',
    '$2a$10$Vwu7ZIjg5.CtonE5Pe5KgumkimBWXKVkfZZhN8UtrSavCJ3q83NQC',
    'ADMIN',
    'APPROVED'
);

-- User 2: BIKER (Rahul - owns all demo bikes)
INSERT INTO users (name, phone_no, email, password, role, kyc_status)
VALUES (
    'Rahul Sharma',
    9876543210,
    'rahul.biker@motoshare.com',
    '$2a$10$Vwu7ZIjg5.CtonE5Pe5KgumkimBWXKVkfZZhN8UtrSavCJ3q83NQC',
    'BIKER',
    'APPROVED'
);

-- User 3: TAKER (Priya - demo taker who can book)
INSERT INTO users (name, phone_no, email, password, role, kyc_status)
VALUES (
    'Priya Verma',
    9876543211,
    'priya.taker@motoshare.com',
    '$2a$10$Vwu7ZIjg5.CtonE5Pe5KgumkimBWXKVkfZZhN8UtrSavCJ3q83NQC',
    'TAKER',
    'APPROVED'
);

-- User 4: ADMIN (Verification account)
INSERT INTO users (name, phone_no, email, password, role, kyc_status)
VALUES (
    'Admin User',
    9999900002,
    'admin@motoshare.com',
    '$2a$10$Vwu7ZIjg5.CtonE5Pe5KgumkimBWXKVkfZZhN8UtrSavCJ3q83NQC',
    'ADMIN',
    'APPROVED'
);

-- User 5: HYBRID BIKER/TAKER (Rents & Sells)
INSERT INTO users (name, phone_no, email, password, role, kyc_status)
VALUES (
    'Demo Hybrid User',
    9876543220,
    'hybrid@motoshare.com',
    '$2a$10$Vwu7ZIjg5.CtonE5Pe5KgumkimBWXKVkfZZhN8UtrSavCJ3q83NQC',
    'BIKER',
    'APPROVED'
);

-- ============================================================
-- BIKER & TAKER ENTITIES (required for pre-approved KYC users)
-- ============================================================

-- Biker entity for Rahul (user_id = 2)
INSERT INTO biker (user_id, rating, total_ratings)
VALUES (2, 4.5, 12);

-- Taker entity for Priya (user_id = 3)
INSERT INTO taker (user_id, rating, total_ratings)
VALUES (3, 4.8, 5);

-- Biker & Taker entities for hybrid user
INSERT INTO biker (user_id, rating, total_ratings)
SELECT user_id, 5.0, 1 FROM users WHERE email = 'hybrid@motoshare.com';

INSERT INTO taker (user_id, rating, total_ratings)
SELECT user_id, 5.0, 1 FROM users WHERE email = 'hybrid@motoshare.com';


-- ============================================================
-- DELHI BIKES (3 bikes) - biker_id = 2
-- ============================================================

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (2, 'Honda', 'Activa 6G', 80, 'DL01AB1234', 'DL01-2023-001234', 12000, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600');

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (2, 'Royal Enfield', 'Classic 350', 150, 'DL05CD5678', 'DL05-2022-005678', 25000, 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600');

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (2, 'Bajaj', 'Pulsar 150', 100, 'DL10EF9012', 'DL10-2024-009012', 8000, 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600');

-- ============================================================
-- MUMBAI BIKES (3 bikes) - biker_id = 2
-- ============================================================

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (2, 'TVS', 'Jupiter 125', 70, 'MH01GH3456', 'MH01-2023-003456', 15000, 'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=600');

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (2, 'Yamaha', 'R15 V4', 200, 'MH04IJ7890', 'MH04-2024-007890', 5000, 'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=600');

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (2, 'Hero', 'Splendor Plus', 60, 'MH02KL1122', 'MH02-2022-001122', 30000, 'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=600');

-- ============================================================
-- JAIPUR BIKES (7 bikes) - biker_id = 2
-- ============================================================

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (2, 'Royal Enfield', 'Meteor 350', 140, 'RJ14AA1001', 'RJ14-2023-001001', 9500, 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=600');

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (2, 'Honda', 'SP 125', 75, 'RJ14BB2002', 'RJ14-2024-002002', 6000, 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600');

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (2, 'Bajaj', 'Dominar 400', 180, 'RJ14CC3003', 'RJ14-2023-003003', 18000, 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600');

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (2, 'TVS', 'Apache RTR 160', 110, 'RJ14DD4004', 'RJ14-2024-004004', 11000, 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600');

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (2, 'Yamaha', 'FZ-S V3', 120, 'RJ14EE5005', 'RJ14-2023-005005', 14000, 'https://images.unsplash.com/photo-1525160354320-d8e92641c563?w=600');

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (2, 'Hero', 'Xtreme 160R', 100, 'RJ14FF6006', 'RJ14-2024-006006', 7500, 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600');

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
VALUES (2, 'KTM', 'Duke 200', 220, 'RJ14GG7007', 'RJ14-2023-007007', 20000, 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600');

-- ============================================================
-- AVAILABILITY SLOTS (20 slots across next 7 days)
-- Using CURRENT_TIMESTAMP so dates are always relative to when seeded
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

-- Jaipur: Royal Enfield Meteor 350 (bike_id = 7)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 7,
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '7 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '20 hours',
    140, true, 'Jaipur', 'Hawa Mahal Road, Near Clock Tower');

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 7,
    CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '8 hours',
    CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '19 hours',
    140, true, 'Jaipur', 'Hawa Mahal Road, Near Clock Tower');

-- Jaipur: Honda SP 125 (bike_id = 8)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 8,
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '8 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '18 hours',
    75, true, 'Jaipur', 'Sindhi Camp Bus Stand, Gate 2');

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 8,
    CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '9 hours',
    CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '21 hours',
    75, true, 'Jaipur', 'Sindhi Camp Bus Stand, Gate 2');

-- Jaipur: Bajaj Dominar 400 (bike_id = 9)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 9,
    CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '6 hours',
    CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '22 hours',
    180, true, 'Jaipur', 'Amer Fort Parking, Main Gate');

-- Jaipur: TVS Apache RTR 160 (bike_id = 10)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 10,
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '9 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '19 hours',
    110, true, 'Jaipur', 'MI Road, Near Panch Batti');

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 10,
    CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '7 hours',
    CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '20 hours',
    110, true, 'Jaipur', 'MI Road, Near Panch Batti');

-- Jaipur: Yamaha FZ-S V3 (bike_id = 11)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 11,
    CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '8 hours',
    CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '20 hours',
    120, true, 'Jaipur', 'Mansarovar Metro Station');

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 11,
    CURRENT_TIMESTAMP + INTERVAL '6 days' + INTERVAL '7 hours',
    CURRENT_TIMESTAMP + INTERVAL '6 days' + INTERVAL '21 hours',
    120, true, 'Jaipur', 'Mansarovar Metro Station');

-- Jaipur: Hero Xtreme 160R (bike_id = 12)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 12,
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '7 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '21 hours',
    100, true, 'Jaipur', 'Jagatpura, Near IIHMR');

-- Jaipur: KTM Duke 200 (bike_id = 13)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 13,
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '8 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '22 hours',
    220, true, 'Jaipur', 'C-Scheme, Near Raj Mandir Cinema');

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
VALUES (gen_random_uuid(), 13,
    CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '6 hours',
    CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '20 hours',
    220, true, 'Jaipur', 'C-Scheme, Near Raj Mandir Cinema');
