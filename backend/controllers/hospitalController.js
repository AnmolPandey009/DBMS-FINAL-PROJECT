const { pool } = require('../config/database');

// Get all hospitals
const getAllHospitals = async (req, res) => {
  try {
    const [hospitals] = await pool.execute(`
      SELECT h.*, u.email, u.created_at as user_created_at
      FROM hospitals h
      JOIN users u ON h.user_id = u.id
      WHERE u.is_active = true
      ORDER BY h.created_at DESC
    `);

    res.json({
      success: true,
      data: hospitals
    });
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get hospital by ID
const getHospitalById = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const [hospitals] = await pool.execute(`
      SELECT h.*, u.email, u.created_at as user_created_at
      FROM hospitals h
      JOIN users u ON h.user_id = u.id
      WHERE h.id = ? AND u.is_active = true
    `, [hospitalId]);

    if (hospitals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      data: hospitals[0]
    });
  } catch (error) {
    console.error('Get hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user's hospital profile
const getHospitalProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [hospitals] = await pool.execute(`
      SELECT h.*, u.email, u.created_at as user_created_at
      FROM hospitals h
      JOIN users u ON h.user_id = u.id
      WHERE h.user_id = ?
    `, [userId]);

    if (hospitals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hospital profile not found'
      });
    }

    res.json({
      success: true,
      data: hospitals[0]
    });
  } catch (error) {
    console.error('Get hospital profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create hospital profile
const createHospital = async (req, res) => {
  try {
    const userId = req.user.id;
    const hospitalData = req.body;

    // Check if hospital profile already exists
    const [existingHospitals] = await pool.execute(
      'SELECT id FROM hospitals WHERE user_id = ?',
      [userId]
    );

    if (existingHospitals.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Hospital profile already exists'
      });
    }

    // Check if license number already exists
    const [licenseCheck] = await pool.execute(
      'SELECT id FROM hospitals WHERE license_number = ?',
      [hospitalData.license_number]
    );

    if (licenseCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'License number already exists'
      });
    }

    // Create hospital profile
    const [result] = await pool.execute(`
      INSERT INTO hospitals (
        user_id, hospital_name, license_number, address, 
        phone, email, contact_person, is_approved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      hospitalData.hospital_name,
      hospitalData.license_number,
      hospitalData.address,
      hospitalData.phone,
      hospitalData.email || null,
      hospitalData.contact_person,
      1 || '1',
    ]);

    const hospitalId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'Hospital profile created successfully',
      data: { id: hospitalId }
    });
  } catch (error) {
    console.error('Create hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update hospital profile
const updateHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const hospitalData = req.body;
    const userId = req.user.id;

    // Check if hospital exists and belongs to current user (or user is admin)
    const [hospitals] = await pool.execute(
      'SELECT user_id FROM hospitals WHERE id = ?',
      [hospitalId]
    );

    if (hospitals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    if (hospitals[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check license number uniqueness if being updated
    if (hospitalData.license_number) {
      const [licenseCheck] = await pool.execute(
        'SELECT id FROM hospitals WHERE license_number = ? AND id != ?',
        [hospitalData.license_number, hospitalId]
      );

      if (licenseCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'License number already exists'
        });
      }
    }

    // Update hospital
    const updateFields = [];
    const updateValues = [];

    Object.keys(hospitalData).forEach(key => {
      if (hospitalData[key] !== undefined && hospitalData[key] !== null) {
        updateFields.push(`${key} = ?`);
        updateValues.push(hospitalData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(hospitalId);

    await pool.execute(
      `UPDATE hospitals SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Hospital profile updated successfully'
    });
  } catch (error) {
    console.error('Update hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Approve hospital
const approveHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const adminId = req.user.id;

    // Check if hospital exists
    const [hospitals] = await pool.execute(
      'SELECT id, is_approved FROM hospitals WHERE id = ?',
      [hospitalId]
    );

    if (hospitals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    if (hospitals[0].is_approved) {
      return res.status(400).json({
        success: false,
        message: 'Hospital already approved'
      });
    }

    // Approve hospital
    await pool.execute(
      'UPDATE hospitals SET is_approved = true, approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?',
      [adminId, hospitalId]
    );

    res.json({
      success: true,
      message: 'Hospital approved successfully'
    });
  } catch (error) {
    console.error('Approve hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete hospital
const deleteHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const userId = req.user.id;

    // Check if hospital exists and belongs to current user (or user is admin)
    const [hospitals] = await pool.execute(
      'SELECT user_id FROM hospitals WHERE id = ?',
      [hospitalId]
    );

    if (hospitals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    if (hospitals[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete hospital (cascade will handle related records)
    await pool.execute('DELETE FROM hospitals WHERE id = ?', [hospitalId]);

    res.json({
      success: true,
      message: 'Hospital deleted successfully'
    });
  } catch (error) {
    console.error('Delete hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get pending hospitals (admin only)
const getPendingHospitals = async (req, res) => {
  try {
    const [hospitals] = await pool.execute(`
      SELECT h.*, u.email, u.created_at as user_created_at
      FROM hospitals h
      JOIN users u ON h.user_id = u.id
      WHERE h.is_approved = false AND u.is_active = true
      ORDER BY h.created_at ASC
    `);

    res.json({
      success: true,
      data: hospitals
    });
  } catch (error) {
    console.error('Get pending hospitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get hospital statistics
const getHospitalStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get hospital ID
    const [hospitalData] = await pool.execute(
      'SELECT id FROM hospitals WHERE user_id = ?',
      [userId]
    );

    if (hospitalData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hospital profile not found'
      });
    }

    const hospitalId = hospitalData[0].id;

    // Get donation statistics
    const [donationStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_donations,
        SUM(units_donated) as total_units_received,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_donations
      FROM blood_donations 
      WHERE hospital_id = ?
    `, [hospitalId]);

    // Get request statistics
    const [requestStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(units_requested) as total_units_requested,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests
      FROM blood_requests 
      WHERE hospital_id = ?
    `, [hospitalId]);

    // Get inventory statistics
    const [inventoryStats] = await pool.execute(`
      SELECT 
        SUM(units_available) as total_units_available,
        SUM(units_used) as total_units_used,
        COUNT(*) as blood_types_in_stock
      FROM blood_inventory 
      WHERE hospital_id = ?
    `, [hospitalId]);

    res.json({
      success: true,
      data: {
        donations: donationStats[0],
        requests: requestStats[0],
        inventory: inventoryStats[0]
      }
    });
  } catch (error) {
    console.error('Get hospital stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllHospitals,
  getHospitalById,
  getHospitalProfile,
  createHospital,
  updateHospital,
  approveHospital,
  deleteHospital,
  getPendingHospitals,
  getHospitalStats
};
