-- ============================================================
-- MotoShare Production Seed Data (Idempotent Version)
-- Password for ALL accounts: Singh@123
-- BCrypt hash: $2a$10$Vwu7ZIjg5.CtonE5Pe5KgumkimBWXKVkfZZhN8UtrSavCJ3q83NQC
-- ============================================================

-- ============================================================
-- USERS (5 accounts)
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
) ON CONFLICT (email) DO NOTHING;

-- User 2: BIKER (Rahul - owns all demo bikes)
INSERT INTO users (name, phone_no, email, password, role, kyc_status)
VALUES (
    'Rahul Sharma',
    9876543210,
    'rahul.biker@motoshare.com',
    '$2a$10$Vwu7ZIjg5.CtonE5Pe5KgumkimBWXKVkfZZhN8UtrSavCJ3q83NQC',
    'BIKER',
    'APPROVED'
) ON CONFLICT (email) DO NOTHING;

-- User 3: TAKER (Priya - demo taker who can book)
INSERT INTO users (name, phone_no, email, password, role, kyc_status)
VALUES (
    'Priya Verma',
    9876543211,
    'priya.taker@motoshare.com',
    '$2a$10$Vwu7ZIjg5.CtonE5Pe5KgumkimBWXKVkfZZhN8UtrSavCJ3q83NQC',
    'TAKER',
    'APPROVED'
) ON CONFLICT (email) DO NOTHING;

-- User 4: ADMIN (Verification account)
INSERT INTO users (name, phone_no, email, password, role, kyc_status)
VALUES (
    'Admin User',
    9999900002,
    'admin@motoshare.com',
    '$2a$10$Vwu7ZIjg5.CtonE5Pe5KgumkimBWXKVkfZZhN8UtrSavCJ3q83NQC',
    'ADMIN',
    'APPROVED'
) ON CONFLICT (email) DO NOTHING;

-- User 5: HYBRID BIKER/TAKER (Rents & Sells)
INSERT INTO users (name, phone_no, email, password, role, kyc_status)
VALUES (
    'Demo Hybrid User',
    9876543220,
    'hybrid@motoshare.com',
    '$2a$10$Vwu7ZIjg5.CtonE5Pe5KgumkimBWXKVkfZZhN8UtrSavCJ3q83NQC',
    'BIKER',
    'APPROVED'
) ON CONFLICT (email) DO NOTHING;


-- ============================================================
-- BIKER & TAKER ENTITIES
-- ============================================================

-- Biker entity for Rahul
INSERT INTO biker (user_id, rating, total_ratings)
SELECT user_id, 4.5, 12 FROM users WHERE email = 'rahul.biker@motoshare.com'
ON CONFLICT (user_id) DO NOTHING;

-- Taker entity for Priya
INSERT INTO taker (user_id, rating, total_ratings)
SELECT user_id, 4.8, 5 FROM users WHERE email = 'priya.taker@motoshare.com'
ON CONFLICT (user_id) DO NOTHING;

-- Biker & Taker entities for hybrid user
INSERT INTO biker (user_id, rating, total_ratings)
SELECT user_id, 5.0, 1 FROM users WHERE email = 'hybrid@motoshare.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO taker (user_id, rating, total_ratings)
SELECT user_id, 5.0, 1 FROM users WHERE email = 'hybrid@motoshare.com'
ON CONFLICT (user_id) DO NOTHING;


-- ============================================================
-- BIKES (Rahul - rahul.biker@motoshare.com owns all demo bikes)
-- ============================================================

-- Delhi Bikes
INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
SELECT b.user_id, 'Honda', 'Activa 6G', 80, 'DL01AB1234', 'DL01-2023-001234', 12000, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600'
FROM biker b JOIN users u ON b.user_id = u.user_id WHERE u.email = 'rahul.biker@motoshare.com'
ON CONFLICT (bike_number) DO NOTHING;

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
SELECT b.user_id, 'Royal Enfield', 'Classic 350', 150, 'DL05CD5678', 'DL05-2022-005678', 25000, 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600'
FROM biker b JOIN users u ON b.user_id = u.user_id WHERE u.email = 'rahul.biker@motoshare.com'
ON CONFLICT (bike_number) DO NOTHING;

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
SELECT b.user_id, 'Bajaj', 'Pulsar 150', 100, 'DL10EF9012', 'DL10-2024-009012', 8000, 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600'
FROM biker b JOIN users u ON b.user_id = u.user_id WHERE u.email = 'rahul.biker@motoshare.com'
ON CONFLICT (bike_number) DO NOTHING;

-- Mumbai Bikes
INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
SELECT b.user_id, 'TVS', 'Jupiter 125', 70, 'MH01GH3456', 'MH01-2023-003456', 15000, 'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=600'
FROM biker b JOIN users u ON b.user_id = u.user_id WHERE u.email = 'rahul.biker@motoshare.com'
ON CONFLICT (bike_number) DO NOTHING;

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
SELECT b.user_id, 'Yamaha', 'R15 V4', 200, 'MH04IJ7890', 'MH04-2024-007890', 5000, 'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=600'
FROM biker b JOIN users u ON b.user_id = u.user_id WHERE u.email = 'rahul.biker@motoshare.com'
ON CONFLICT (bike_number) DO NOTHING;

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
SELECT b.user_id, 'Hero', 'Splendor Plus', 60, 'MH02KL1122', 'MH02-2022-001122', 30000, 'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=600'
FROM biker b JOIN users u ON b.user_id = u.user_id WHERE u.email = 'rahul.biker@motoshare.com'
ON CONFLICT (bike_number) DO NOTHING;

-- Jaipur Bikes
INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
SELECT b.user_id, 'Royal Enfield', 'Meteor 350', 140, 'RJ14AA1001', 'RJ14-2023-001001', 9500, 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=600'
FROM biker b JOIN users u ON b.user_id = u.user_id WHERE u.email = 'rahul.biker@motoshare.com'
ON CONFLICT (bike_number) DO NOTHING;

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
SELECT b.user_id, 'Honda', 'SP 125', 75, 'RJ14BB2002', 'RJ14-2024-002002', 6000, 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600'
FROM biker b JOIN users u ON b.user_id = u.user_id WHERE u.email = 'rahul.biker@motoshare.com'
ON CONFLICT (bike_number) DO NOTHING;

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
SELECT b.user_id, 'Bajaj', 'Dominar 400', 180, 'RJ14CC3003', 'RJ14-2023-003003', 18000, 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600'
FROM biker b JOIN users u ON b.user_id = u.user_id WHERE u.email = 'rahul.biker@motoshare.com'
ON CONFLICT (bike_number) DO NOTHING;

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
SELECT b.user_id, 'TVS', 'Apache RTR 160', 110, 'RJ14DD4004', 'RJ14-2024-004004', 11000, 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600'
FROM biker b JOIN users u ON b.user_id = u.user_id WHERE u.email = 'rahul.biker@motoshare.com'
ON CONFLICT (bike_number) DO NOTHING;

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
SELECT b.user_id, 'Yamaha', 'FZ-S V3', 120, 'RJ14EE5005', 'RJ14-2023-005005', 14000, 'https://images.unsplash.com/photo-1525160354320-d8e92641c563?w=600'
FROM biker b JOIN users u ON b.user_id = u.user_id WHERE u.email = 'rahul.biker@motoshare.com'
ON CONFLICT (bike_number) DO NOTHING;

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
SELECT b.user_id, 'Hero', 'Xtreme 160R', 100, 'RJ14FF6006', 'RJ14-2024-006006', 7500, 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600'
FROM biker b JOIN users u ON b.user_id = u.user_id WHERE u.email = 'rahul.biker@motoshare.com'
ON CONFLICT (bike_number) DO NOTHING;

INSERT INTO bikes (biker_id, company, model, rate_per_hour, bike_number, rc_number, kms, image_url)
SELECT b.user_id, 'KTM', 'Duke 200', 220, 'RJ14GG7007', 'RJ14-2023-007007', 20000, 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600'
FROM biker b JOIN users u ON b.user_id = u.user_id WHERE u.email = 'rahul.biker@motoshare.com'
ON CONFLICT (bike_number) DO NOTHING;


-- ============================================================
-- AVAILABILITY SLOTS (22 slots across next 7 days)
-- ============================================================

-- Delhi: Honda Activa 6G (DL01AB1234)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '8 hours', CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '18 hours', 80, true, 'Delhi', 'Rajiv Chowk Metro Gate 3'
FROM bikes b WHERE b.bike_number = 'DL01AB1234' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Delhi' AND a.start_hour > CURRENT_TIMESTAMP);

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '9 hours', CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '20 hours', 80, true, 'Delhi', 'Rajiv Chowk Metro Gate 3'
FROM bikes b WHERE b.bike_number = 'DL01AB1234' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Delhi' AND a.start_hour > CURRENT_TIMESTAMP + INTERVAL '2 days');

-- Delhi: Royal Enfield Classic 350 (DL05CD5678)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '7 hours', CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '22 hours', 150, true, 'Delhi', 'Connaught Place, Near PVR'
FROM bikes b WHERE b.bike_number = 'DL05CD5678' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Delhi' AND a.start_hour > CURRENT_TIMESTAMP);

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '6 hours', CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '21 hours', 150, true, 'Delhi', 'Connaught Place, Near PVR'
FROM bikes b WHERE b.bike_number = 'DL05CD5678' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Delhi' AND a.start_hour > CURRENT_TIMESTAMP + INTERVAL '4 days');

-- Delhi: Bajaj Pulsar 150 (DL10EF9012)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '10 hours', CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '19 hours', 100, true, 'Delhi', 'Karol Bagh Metro Station'
FROM bikes b WHERE b.bike_number = 'DL10EF9012' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Delhi' AND a.start_hour > CURRENT_TIMESTAMP);

-- Mumbai: TVS Jupiter 125 (MH01GH3456)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '8 hours', CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '20 hours', 70, true, 'Mumbai', 'Andheri Station West Exit'
FROM bikes b WHERE b.bike_number = 'MH01GH3456' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Mumbai' AND a.start_hour > CURRENT_TIMESTAMP);

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '7 hours', CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '19 hours', 70, true, 'Mumbai', 'Andheri Station West Exit'
FROM bikes b WHERE b.bike_number = 'MH01GH3456' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Mumbai' AND a.start_hour > CURRENT_TIMESTAMP + INTERVAL '3 days');

-- Mumbai: Yamaha R15 V4 (MH04IJ7890)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '9 hours', CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '22 hours', 200, true, 'Mumbai', 'Bandra Bandstand, Near Sea Link'
FROM bikes b WHERE b.bike_number = 'MH04IJ7890' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Mumbai' AND a.start_hour > CURRENT_TIMESTAMP);

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '6 days' + INTERVAL '8 hours', CURRENT_TIMESTAMP + INTERVAL '6 days' + INTERVAL '20 hours', 200, true, 'Mumbai', 'Bandra Bandstand, Near Sea Link'
FROM bikes b WHERE b.bike_number = 'MH04IJ7890' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Mumbai' AND a.start_hour > CURRENT_TIMESTAMP + INTERVAL '5 days');

-- Mumbai: Hero Splendor Plus (MH02KL1122)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '6 hours', CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '18 hours', 60, true, 'Mumbai', 'Dadar Station East'
FROM bikes b WHERE b.bike_number = 'MH02KL1122' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Mumbai' AND a.start_hour > CURRENT_TIMESTAMP);

-- Jaipur: Royal Enfield Meteor 350 (RJ14AA1001)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '7 hours', CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '20 hours', 140, true, 'Jaipur', 'Hawa Mahal Road, Near Clock Tower'
FROM bikes b WHERE b.bike_number = 'RJ14AA1001' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Jaipur' AND a.start_hour > CURRENT_TIMESTAMP);

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '8 hours', CURRENT_TIMESTAMP + INTERVAL '4 days' + INTERVAL '19 hours', 140, true, 'Jaipur', 'Hawa Mahal Road, Near Clock Tower'
FROM bikes b WHERE b.bike_number = 'RJ14AA1001' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Jaipur' AND a.start_hour > CURRENT_TIMESTAMP + INTERVAL '3 days');

-- Jaipur: Honda SP 125 (RJ14BB2002)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '8 hours', CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '18 hours', 75, true, 'Jaipur', 'Sindhi Camp Bus Stand, Gate 2'
FROM bikes b WHERE b.bike_number = 'RJ14BB2002' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Jaipur' AND a.start_hour > CURRENT_TIMESTAMP);

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '9 hours', CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '21 hours', 75, true, 'Jaipur', 'Sindhi Camp Bus Stand, Gate 2'
FROM bikes b WHERE b.bike_number = 'RJ14BB2002' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Jaipur' AND a.start_hour > CURRENT_TIMESTAMP + INTERVAL '2 days');

-- Jaipur: Bajaj Dominar 400 (RJ14CC3003)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '6 hours', CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '22 hours', 180, true, 'Jaipur', 'Amer Fort Parking, Main Gate'
FROM bikes b WHERE b.bike_number = 'RJ14CC3003' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Jaipur' AND a.start_hour > CURRENT_TIMESTAMP);

-- Jaipur: TVS Apache RTR 160 (RJ14DD4004)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '9 hours', CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '19 hours', 110, true, 'Jaipur', 'MI Road, Near Panch Batti'
FROM bikes b WHERE b.bike_number = 'RJ14DD4004' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Jaipur' AND a.start_hour > CURRENT_TIMESTAMP);

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '7 hours', CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '20 hours', 110, true, 'Jaipur', 'MI Road, Near Panch Batti'
FROM bikes b WHERE b.bike_number = 'RJ14DD4004' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Jaipur' AND a.start_hour > CURRENT_TIMESTAMP + INTERVAL '4 days');

-- Jaipur: Yamaha FZ-S V3 (RJ14EE5005)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '8 hours', CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '20 hours', 120, true, 'Jaipur', 'Mansarovar Metro Station'
FROM bikes b WHERE b.bike_number = 'RJ14EE5005' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Jaipur' AND a.start_hour > CURRENT_TIMESTAMP);

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '6 days' + INTERVAL '7 hours', CURRENT_TIMESTAMP + INTERVAL '6 days' + INTERVAL '21 hours', 120, true, 'Jaipur', 'Mansarovar Metro Station'
FROM bikes b WHERE b.bike_number = 'RJ14EE5005' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Jaipur' AND a.start_hour > CURRENT_TIMESTAMP + INTERVAL '5 days');

-- Jaipur: Hero Xtreme 160R (RJ14FF6006)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '7 hours', CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '21 hours', 100, true, 'Jaipur', 'Jagatpura, Near IIHMR'
FROM bikes b WHERE b.bike_number = 'RJ14FF6006' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Jaipur' AND a.start_hour > CURRENT_TIMESTAMP);

-- Jaipur: KTM Duke 200 (RJ14GG7007)
INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '8 hours', CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '22 hours', 220, true, 'Jaipur', 'C-Scheme, Near Raj Mandir Cinema'
FROM bikes b WHERE b.bike_number = 'RJ14GG7007' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Jaipur' AND a.start_hour > CURRENT_TIMESTAMP);

INSERT INTO availability_slots (id, bike_id, start_hour, end_hour, price_per_hour, is_available, city, pickup_location)
SELECT gen_random_uuid(), b.bike_id, CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '6 hours', CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '20 hours', 220, true, 'Jaipur', 'C-Scheme, Near Raj Mandir Cinema'
FROM bikes b WHERE b.bike_number = 'RJ14GG7007' AND NOT EXISTS (SELECT 1 FROM availability_slots a WHERE a.bike_id = b.bike_id AND a.city = 'Jaipur' AND a.start_hour > CURRENT_TIMESTAMP + INTERVAL '2 days');
