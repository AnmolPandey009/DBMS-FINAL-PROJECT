const { pool } = require('../config/database');

// Get all patients
const getAllPatients = async (req, res) => {
  try {
    const [patients] = await pool.execute(`
      SELECT p.*, u.email, u.created_at as user_created_at
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE u.is_active = true
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get patient by ID
const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;

    const [patients] = await pool.execute(`
      SELECT p.*, u.email, u.created_at as user_created_at
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND u.is_active = true
    `, [patientId]);

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patients[0]
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user's patient profile
const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [patients] = await pool.execute(`
      SELECT p.*, u.email, u.created_at as user_created_at
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `, [userId]);

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.json({
      success: true,
      data: patients[0]
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create patient profile
const createPatient = async (req, res) => {
  try {
    const userId = req.user.id;
    const patientData = req.body;

    // Check if patient profile already exists
    const [existingPatients] = await pool.execute(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (existingPatients.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Patient profile already exists'
      });
    }

    // Create patient profile
    const [result] = await pool.execute(`
      INSERT INTO patients (
        user_id, first_name, last_name, date_of_birth, gender, 
        blood_group, phone, address, emergency_contact, medical_history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      patientData.first_name,
      patientData.last_name,
      patientData.date_of_birth,
      patientData.gender,
      patientData.blood_group,
      patientData.phone,
      patientData.address,
      patientData.emergency_contact || null,
      patientData.medical_history || null
    ]);

    const patientId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'Patient profile created successfully',
      data: { id: patientId }
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update patient profile
const updatePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patientData = req.body;
    const userId = req.user.id;

    // Check if patient exists and belongs to current user (or user is admin)
    const [patients] = await pool.execute(
      'SELECT user_id FROM patients WHERE id = ?',
      [patientId]
    );

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (patients[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update patient
    const updateFields = [];
    const updateValues = [];

    Object.keys(patientData).forEach(key => {
      if (patientData[key] !== undefined && patientData[key] !== null) {
        updateFields.push(`${key} = ?`);
        updateValues.push(patientData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(patientId);

    await pool.execute(
      `UPDATE patients SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Patient profile updated successfully'
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete patient
const deletePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.id;

    // Check if patient exists and belongs to current user (or user is admin)
    const [patients] = await pool.execute(
      'SELECT user_id FROM patients WHERE id = ?',
      [patientId]
    );

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (patients[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete patient (cascade will handle related records)
    await pool.execute('DELETE FROM patients WHERE id = ?', [patientId]);

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get patient statistics
const getPatientStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total requests
    const [requestStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(units_requested) as total_units_requested,
        MAX(requested_at) as last_request_date
      FROM blood_requests 
      WHERE patient_id = (SELECT id FROM patients WHERE user_id = ?)
    `, [userId]);

    // Get request history
    const [requestHistory] = await pool.execute(`
      SELECT br.*, h.hospital_name
      FROM blood_requests br
      JOIN hospitals h ON br.hospital_id = h.id
      WHERE br.patient_id = (SELECT id FROM patients WHERE user_id = ?)
      ORDER BY br.requested_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: {
        stats: requestStats[0],
        history: requestHistory
      }
    });
  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  getPatientProfile,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientStats
};
