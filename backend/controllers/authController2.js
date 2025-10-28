const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Register new user
const registerUser = async (req, res) => {
  try {
    const { email, password, role, name, age, gender, blood_group, contact, address, city, state, pincode } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );

    const userId = result.insertId;

    // Create role-specific profile based on role
    if (role === 'donor') {
      await pool.execute(`
        INSERT INTO donors (
          user_id, first_name, last_name, date_of_birth, gender, 
          blood_group, phone, address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        name || 'Unknown',
        '', // last_name - you might want to split the name
        new Date(Date.now() - (age || 18) * 365 * 24 * 60 * 60 * 1000), // Calculate birth date from age
        gender?.toLowerCase() || 'other',
        blood_group || 'O+',
        contact || '',
        `${address || ''}, ${city || ''}, ${state || ''} - ${pincode || ''}`
      ]);
    } else if (role === 'patient') {
      await pool.execute(`
        INSERT INTO patients (
          user_id, first_name, last_name, date_of_birth, gender, 
          blood_group, phone, address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        name || 'Unknown',
        '', // last_name
        new Date(Date.now() - (age || 18) * 365 * 24 * 60 * 60 * 1000),
        gender?.toLowerCase() || 'other',
        blood_group || 'O+',
        contact || '',
        `${address || ''}, ${city || ''}, ${state || ''} - ${pincode || ''}`
      ]);
    } else if (role === 'hospital') {
      await pool.execute(`
        INSERT INTO hospitals (
          user_id, hospital_name, license_number, address, 
          phone, contact_person
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        userId,
        name || 'Hospital Name',
        `LIC-${Date.now()}`, // Generate a temporary license number
        `${address || ''}, ${city || ''}, ${state || ''} - ${pincode || ''}`,
        contact || '',
        name || 'Contact Person'
      ]);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        role,
        name: name || 'Unknown'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, password, role, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details
    const [users] = await pool.execute(
      'SELECT id, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Get role-specific profile data
    let profileData = null;
    if (user.role === 'donor') {
      const [donors] = await pool.execute(
        'SELECT * FROM donors WHERE user_id = ?',
        [userId]
      );
      profileData = donors[0] || null;
    } else if (user.role === 'patient') {
      const [patients] = await pool.execute(
        'SELECT * FROM patients WHERE user_id = ?',
        [userId]
      );
      profileData = patients[0] || null;
    } else if (user.role === 'hospital') {
      const [hospitals] = await pool.execute(
        'SELECT * FROM hospitals WHERE user_id = ?',
        [userId]
      );
      profileData = hospitals[0] || null;
    }

    res.json({
      success: true,
      user: {
        ...user,
        profile: profileData
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Update user
    const updateFields = [];
    const updateValues = [];

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(userId);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};
