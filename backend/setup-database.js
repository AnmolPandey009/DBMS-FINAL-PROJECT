const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('Setting up Blood Bank Database...');
    
    // Read database configuration
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '@Abhishek2005@',
      port: process.env.DB_PORT || 3306
    };
    
    console.log('Connecting to MySQL...');
    const connection = await mysql.createConnection(config);
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'blood_bank_db';
    console.log(`Creating database: ${dbName}`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    
    // Use the database
    await connection.execute(`USE ${dbName}`);
    
    // Create tables one by one
    console.log('Creating tables...');
    
    // Create donors table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS donors (
        donor_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(15) NOT NULL,
        blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
        age INT NOT NULL CHECK (age >= 18 AND age <= 65),
        gender ENUM('Male', 'Female', 'Other') NOT NULL,
        address TEXT,
        last_donate DATE,
        is_eligible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create hospitals table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS hospitals (
        hospital_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pincode VARCHAR(10),
        phone VARCHAR(15),
        email VARCHAR(100),
        contact_person VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff', 'doctor', 'nurse') NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(15),
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create patients table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patients (
        patient_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(15) NOT NULL,
        blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
        age INT NOT NULL,
        gender ENUM('Male', 'Female', 'Other') NOT NULL,
        hospital_id INT,
        units_needed INT NOT NULL DEFAULT 1,
        urgency ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
        status ENUM('Pending', 'Approved', 'Rejected', 'Fulfilled') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id) ON DELETE SET NULL
      )
    `);
    
    // Create blood_donations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS blood_donations (
        donation_id INT PRIMARY KEY AUTO_INCREMENT,
        donor_id INT NOT NULL,
        blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
        units INT NOT NULL DEFAULT 1,
        donate_date DATE NOT NULL,
        donation_type ENUM('Whole Blood', 'Platelets', 'Plasma') DEFAULT 'Whole Blood',
        status ENUM('Completed', 'In Progress', 'Cancelled') DEFAULT 'Completed',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (donor_id) REFERENCES donors(donor_id) ON DELETE CASCADE
      )
    `);
    
    // Create blood_inventory table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS blood_inventory (
        inventory_id INT PRIMARY KEY AUTO_INCREMENT,
        blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
        units_available INT NOT NULL DEFAULT 0,
        expiry_date DATE NOT NULL,
        donation_id INT,
        status ENUM('Available', 'Reserved', 'Expired', 'Used') DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (donation_id) REFERENCES blood_donations(donation_id) ON DELETE SET NULL
      )
    `);
    
    // Create blood_requests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS blood_requests (
        request_id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL,
        blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
        units INT NOT NULL DEFAULT 1,
        urgency ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
        status ENUM('Pending', 'Approved', 'Rejected', 'Fulfilled', 'Cancelled') DEFAULT 'Pending',
        request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        required_by DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
      )
    `);
    
    // Create blood_components table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS blood_components (
        component_id INT PRIMARY KEY AUTO_INCREMENT,
        type ENUM('Red Blood Cells', 'Platelets', 'Plasma', 'White Blood Cells') NOT NULL,
        blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
        units INT NOT NULL DEFAULT 1,
        expiry_date DATE NOT NULL,
        donation_id INT,
        status ENUM('Available', 'Reserved', 'Expired', 'Used') DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (donation_id) REFERENCES blood_donations(donation_id) ON DELETE SET NULL
      )
    `);
    
    // Create blood_issues table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS blood_issues (
        issue_id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL,
        inventory_id INT,
        component_id INT,
        units INT NOT NULL DEFAULT 1,
        issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        issued_by INT NOT NULL,
        status ENUM('Issued', 'Returned', 'Used') DEFAULT 'Issued',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
        FOREIGN KEY (inventory_id) REFERENCES blood_inventory(inventory_id) ON DELETE SET NULL,
        FOREIGN KEY (component_id) REFERENCES blood_components(component_id) ON DELETE SET NULL,
        FOREIGN KEY (issued_by) REFERENCES users(user_id) ON DELETE RESTRICT
      )
    `);
    
    // Insert sample data
    console.log('Inserting sample data...');
    
    // Insert sample hospitals
    await connection.execute(`
      INSERT IGNORE INTO hospitals (name, address, city, state, pincode, phone, email, contact_person) VALUES
      ('City General Hospital', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', '022-12345678', 'info@citygeneral.com', 'Dr. John Smith'),
      ('Metro Medical Center', '456 Park Avenue', 'Delhi', 'Delhi', '110001', '011-87654321', 'contact@metromedical.com', 'Dr. Jane Doe')
    `);
    
    // Insert sample users
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.execute(`
      INSERT IGNORE INTO users (username, email, password, role, full_name, phone) VALUES
      ('admin', 'admin@bloodbank.com', ?, 'admin', 'System Administrator', '9876543210'),
      ('staff1', 'staff@bloodbank.com', ?, 'staff', 'Staff Member', '9876543211')
    `, [hashedPassword, hashedPassword]);
    
    console.log('✅ Database setup completed successfully!');
    console.log('✅ Tables created:');
    console.log('   - donors');
    console.log('   - patients');
    console.log('   - blood_inventory');
    console.log('   - blood_donations');
    console.log('   - blood_requests');
    console.log('   - hospitals');
    console.log('   - users');
    console.log('   - blood_components');
    console.log('   - blood_issues');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Please check your MySQL connection and credentials.');
    process.exit(1);
  }
}

setupDatabase();
