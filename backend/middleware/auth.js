const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(req.headers);

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database
    const [users] = await pool.execute(
      'SELECT id, email, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    if (!users[0].is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account deactivated' 
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

const authorizeHospital = async (req, res, next) => {
  try {
    if (req.user.role !== 'hospital') {
      return res.status(403).json({ 
        success: false, 
        message: 'Hospital access required' 
      });
    }

    // Check if hospital is approved
    const [hospitals] = await pool.execute(
      'SELECT is_approved FROM hospitals WHERE user_id = ?',
      [req.user.id]
    );

    if (hospitals.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hospital profile not found' 
      });
    }

    if (!hospitals[0].is_approved) {
      return res.status(403).json({ 
        success: false, 
        message: 'Hospital not approved yet' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Authorization error' 
    });
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeHospital
};
