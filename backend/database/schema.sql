-- Blood Bank Management System Database Schema
-- MySQL Database Schema for Blood Bank Management System

-- Create database
CREATE DATABASE IF NOT EXISTS blood_bank_db;
USE blood_bank_db;

-- Users table (base user information)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('donor', 'patient', 'hospital', 'admin') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Donors table
CREATE TABLE donors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    emergency_contact VARCHAR(20),
    medical_history TEXT,
    last_donation_date DATE,
    is_eligible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Patients table
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    emergency_contact VARCHAR(20),
    medical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Hospitals table
CREATE TABLE hospitals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    contact_person VARCHAR(100) NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Blood donations table
CREATE TABLE blood_donations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    donor_id INT NOT NULL,
    hospital_id INT NOT NULL,
    donation_date DATE NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_donated DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    hemoglobin_level DECIMAL(4,2),
    blood_pressure VARCHAR(20),
    temperature DECIMAL(4,2),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

-- Blood inventory table
CREATE TABLE blood_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_available DECIMAL(6,2) NOT NULL DEFAULT 0,
    units_used DECIMAL(6,2) NOT NULL DEFAULT 0,
    expiry_date DATE,
    status ENUM('available', 'expired', 'used') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    UNIQUE KEY unique_hospital_blood_group (hospital_id, blood_group)
);

-- Blood requests table
CREATE TABLE blood_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    hospital_id INT NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_requested DECIMAL(4,2) NOT NULL,
    urgency ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    reason TEXT NOT NULL,
    doctor_name VARCHAR(100),
    doctor_contact VARCHAR(20),
    status ENUM('pending', 'approved', 'rejected', 'fulfilled') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    fulfilled_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

-- Blood issues table (transactions when blood is issued to patients)
CREATE TABLE blood_issues (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    hospital_id INT NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_issued DECIMAL(4,2) NOT NULL,
    issued_to VARCHAR(100) NOT NULL,
    issued_by VARCHAR(100) NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_donors_blood_group ON donors(blood_group);
CREATE INDEX idx_donors_eligible ON donors(is_eligible);
CREATE INDEX idx_patients_blood_group ON patients(blood_group);
CREATE INDEX idx_hospitals_approved ON hospitals(is_approved);
CREATE INDEX idx_donations_status ON blood_donations(status);
CREATE INDEX idx_donations_donor ON blood_donations(donor_id);
CREATE INDEX idx_donations_hospital ON blood_donations(hospital_id);
CREATE INDEX idx_inventory_blood_group ON blood_inventory(blood_group);
CREATE INDEX idx_inventory_status ON blood_inventory(status);
CREATE INDEX idx_requests_status ON blood_requests(status);
CREATE INDEX idx_requests_patient ON blood_requests(patient_id);
CREATE INDEX idx_requests_hospital ON blood_requests(hospital_id);
CREATE INDEX idx_issues_date ON blood_issues(issue_date);

-- Insert default admin user
INSERT INTO users (email, password, role) VALUES 
('admin@bloodbank.com', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV0wX1yZ2aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR7sT8uV9wX0yZ1aB2cD3eF4gH5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4', 'admin');

-- Create triggers for automatic inventory updates
DELIMITER //

-- Trigger to update inventory when donation is approved
CREATE TRIGGER update_inventory_on_donation_approval
AFTER UPDATE ON blood_donations
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO blood_inventory (hospital_id, blood_group, units_available, expiry_date)
        VALUES (NEW.hospital_id, NEW.blood_group, NEW.units_donated, DATE_ADD(NEW.donation_date, INTERVAL 42 DAY))
        ON DUPLICATE KEY UPDATE
        units_available = units_available + NEW.units_donated,
        updated_at = CURRENT_TIMESTAMP;
    END IF;
END//

-- Trigger to update inventory when blood is issued
CREATE TRIGGER update_inventory_on_blood_issue
AFTER INSERT ON blood_issues
FOR EACH ROW
BEGIN
    UPDATE blood_inventory 
    SET units_available = units_available - NEW.units_issued,
        units_used = units_used + NEW.units_issued,
        updated_at = CURRENT_TIMESTAMP
    WHERE hospital_id = NEW.hospital_id 
    AND blood_group = NEW.blood_group;
    
    -- Update request status to fulfilled
    UPDATE blood_requests 
    SET status = 'fulfilled',
        fulfilled_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.request_id;
END//

DELIMITER ;
