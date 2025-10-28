const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all users with pagination and filters
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT user_id, username, email, role, full_name, phone, is_active, 
             last_login, created_at
      FROM users 
      WHERE 1=1
    `;
    const queryParams = [];
    
    if (role) {
      query += ' AND role = ?';
      queryParams.push(role);
    }
    
    if (search) {
      query += ' AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [users] = await pool.execute(query, queryParams);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    
    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }
    
    if (search) {
      countQuery += ' AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await pool.execute(
      'SELECT user_id, username, email, role, full_name, phone, is_active, last_login, created_at FROM users WHERE user_id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const {
      username, email, password, role, full_name, phone
    } = req.body;
    
    // Check if username already exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    
    // Check if email already exists
    const [existingEmails] = await pool.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password, role, full_name, phone) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, role, full_name, phone]
    );
    
    const [newUser] = await pool.execute(
      'SELECT user_id, username, email, role, full_name, phone, is_active, created_at FROM users WHERE user_id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username, email, role, full_name, phone, is_active
    } = req.body;
    
    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE user_id = ?',
      [id]
    );
    
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if username already exists for another user
    const [usernameCheck] = await pool.execute(
      'SELECT user_id FROM users WHERE username = ? AND user_id != ?',
      [username, id]
    );
    
    if (usernameCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    
    // Check if email already exists for another user
    const [emailCheck] = await pool.execute(
      'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
      [email, id]
    );
    
    if (emailCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered to another user'
      });
    }
    
    await pool.execute(
      `UPDATE users SET username = ?, email = ?, role = ?, full_name = ?, 
       phone = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = ?`,
      [username, email, role, full_name, phone, is_active, id]
    );
    
    const [updatedUser] = await pool.execute(
      'SELECT user_id, username, email, role, full_name, phone, is_active, last_login, created_at FROM users WHERE user_id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE user_id = ?',
      [id]
    );
    
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has issued any blood
    const [bloodIssues] = await pool.execute(
      'SELECT issue_id FROM blood_issues WHERE issued_by = ?',
      [id]
    );
    
    if (bloodIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with blood issue history'
      });
    }
    
    await pool.execute('DELETE FROM users WHERE user_id = ?', [id]);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// User signup (public endpoint)
const signupUser = async (req, res) => {
  try {
    const {
      username, email, password, role, full_name, phone
    } = req.body;
    
    // Validate required fields
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, and full name are required'
      });
    }
    
    // Check if username already exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    
    // Check if email already exists
    const [existingEmails] = await pool.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Set default role to 'staff' for public signup (admin can change later)
    const userRole = role || 'staff';
    
    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password, role, full_name, phone) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, userRole, full_name, phone]
    );
    
    // Generate JWT token for immediate login
    const token = jwt.sign(
      { 
        userId: result.insertId, 
        username: username, 
        role: userRole 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    const [newUser] = await pool.execute(
      'SELECT user_id, username, email, role, full_name, phone, is_active, created_at FROM users WHERE user_id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser[0],
        token
      }
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({
      success: false,
      message: 'Signup failed',
      error: error.message
    });
  }
};

// User login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username or email
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1',
      [username, username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const user = users[0];
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    await pool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?',
      [user.user_id]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const [users] = await pool.execute(
      'SELECT user_id, password FROM users WHERE user_id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [hashedNewPassword, id]
    );
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_users,
        role,
        COUNT(*) as count_by_role
      FROM users 
      GROUP BY role
      ORDER BY count_by_role DESC
    `);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  signupUser,
  loginUser,
  changePassword,
  getUserStats
};
