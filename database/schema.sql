CREATE DATABASE IF NOT EXISTS campus_guide_db_oncenobody;
USE campus_guide_db_oncenobody;

-- User, Events, FAQs tables (No change from original)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
);
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL
);
CREATE TABLE IF NOT EXISTS faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL
);

-- Locations table (No change)
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL
);

-- NEW: Routes table to store pre-defined paths from your KML
CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path_json JSON NOT NULL -- Stores the [lat, lng] coordinates
);
CREATE TABLE IF NOT EXISTS unanswered_queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_text VARCHAR(255) NOT NULL UNIQUE,
    ask_count INT NOT NULL DEFAULT 1,
    last_asked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE events
ADD COLUMN location_id INT NULL,
ADD CONSTRAINT fk_event_location
    FOREIGN KEY (location_id)
    REFERENCES locations(id)
    ON DELETE SET NULL;
-- Add registration_link to events table (Optional external link)
ALTER TABLE events ADD COLUMN registration_link VARCHAR(255) NULL;

-- 1. Create a table to track which user registered for which event
CREATE TABLE IF NOT EXISTS event_registrations (
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);
CREATE TABLE IF NOT EXISTS unanswered_queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_text VARCHAR(255) NOT NULL UNIQUE,
    ask_count INT NOT NULL DEFAULT 1,
    last_asked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Create a table to log all notifications sent to users
CREATE TABLE IF NOT EXISTS notification_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

