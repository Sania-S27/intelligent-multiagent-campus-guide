-- Select the database to use
USE campus_guide_db;

-- 
-- 1. Seed Locations (from KML <Point> Placemarks)
-- 
INSERT INTO locations (name, latitude, longitude) VALUES
('Admin Block', 14.4447309, 75.9014268),
('Main gate', 14.4451595, 75.9003362),
('CSE Block', 14.4449734, 75.9012231),
('ECE Block', 14.4443789, 75.9014354),
('Central Library', 14.4448529, 75.9017306),
('Parking Area', 14.4441130, 75.9017395),
('Information Science', 14.4439236, 75.9022051),
('CME Circle', 14.4442918, 75.9034410),
('Civil Block', 14.4445809, 75.9032047),
('Mechanical Block', 14.4449696, 75.9032034),
('Electrical Block', 14.4453037, 75.9032076),
('Canteen', 14.4445081, 75.9039198),
('SSM cultural Centre', 14.4446524, 75.9045481),
('BIET Back Gate', 14.4443799, 75.9052491),
('Cricket Ground', 14.4438879, 75.9043641),
('FootBall Ground', 14.4449863, 75.9025028),
('Textile Block', 14.4439765, 75.9029515);

-- 
-- 2. Seed Routes (from KML <LineString> Placemarks)
-- NOTE: Coordinates are converted from KML's [lng, lat] to JSON's [lat, lng]
-- 
INSERT INTO routes (name, path_json) VALUES
(
    'Main Gate to Back Gate',
    '[
        [14.4451999, 75.9003404], 
        [14.4451581, 75.9008291], 
        [14.4447106, 75.9010832], 
        [14.4442125, 75.9012065], 
        [14.4442767, 75.9017676], 
        [14.4442949, 75.9022345], 
        [14.4443075, 75.9029831], 
        [14.4443165, 75.9034419], 
        [14.4443307, 75.9039066], 
        [14.4443639, 75.9046451], 
        [14.4443866, 75.9052382]
    ]'
),
(
    'Main to CME circle',
    '[
        [14.4451765, 75.9008465], 
        [14.4453759, 75.9019910], 
        [14.4455933, 75.9034368], 
        [14.4453076, 75.9034396], 
        [14.4449498, 75.9034397], 
        [14.4445639, 75.9034055], 
        [14.4443345, 75.9034146]
    ]'
),
(
    'Quiet Path', -- KML has "Quite Path" 
    '[
        [14.4453828, 75.9020011], 
        [14.4443001, 75.9020832]
    ]'
),
(
    'Parking to Central Library',
    '[
        [14.4442807, 75.9017386], 
        [14.4446962, 75.9017084]
    ]'
);

-- 
-- 3. Seed Sample Users
-- (Passwords are 'adminpass' and 'userpass', hashed)
-- 
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@biet.com', '$2b$12$Ea.MLnSDRAL.dG1E5W1Xj.s28xNP5Nq.e.y.S65kYjwhs7tqKqGky', 'admin'),
('Standard User', 'user@biet.com', '$2b$12$z3gN1G/M36wcE3jG.Jc0COpCTvF/1bAmO1pTwesJkMgj/tUa1N24S', 'user');

-- 
-- 4. Seed Sample Events
-- 
INSERT INTO events (title, description, event_date) VALUES
('Tech Fest "Innovate 2025"', 'Annual inter-college tech fest.', CURDATE() + INTERVAL 7 DAY),
('Guest Lecture on AI', 'By Dr. Jane Doe from Google Brain.', CURDATE() + INTERVAL 3 DAY),
('Sports Day', 'Annual athletic meet.', CURDATE() + INTERVAL 30 DAY);

-- 
-- 5. Seed Sample FAQs
-- 
INSERT INTO faqs (question, answer) VALUES
('What are the library timings?', 'The Central Library is open from 8:00 AM to 8:00 PM on weekdays and 9:00 AM to 5:00 PM on weekends.'),
('Where is the Admin Block?', 'The Admin Block is located near the main entrance, opposite the CSE Block.'),
('How do I pay my fees?', 'Fees can be paid online through the student portal or at the accounts section in the Admin Block.');