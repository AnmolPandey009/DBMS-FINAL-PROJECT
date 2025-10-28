const { pool } = require('../config/database');

// Get all requests
const getAllRequests = async (req, res) => {
  try {
    const [requests] = await pool.execute(`
      SELECT br.*, 
             p.first_name as patient_first_name, 
             p.last_name as patient_last_name,
             p.blood_group as patient_blood_group,
             h.hospital_name
      FROM blood_requests br
      JOIN patients p ON br.patient_id = p.id
      JOIN hospitals h ON br.hospital_id = h.id
      ORDER BY br.requested_at DESC
    `);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get request by ID
const getRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;

    const [requests] = await pool.execute(`
      SELECT br.*, 
             p.first_name as patient_first_name, 
             p.last_name as patient_last_name,
             p.blood_group as patient_blood_group,
             h.hospital_name
      FROM blood_requests br
      JOIN patients p ON br.patient_id = p.id
      JOIN hospitals h ON br.hospital_id = h.id
      WHERE br.id = ?
    `, [requestId]);

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: requests[0]
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get requests by patient
const getRequestsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const [requests] = await pool.execute(`
      SELECT br.*, h.hospital_name
      FROM blood_requests br
      JOIN hospitals h ON br.hospital_id = h.id
      WHERE br.patient_id = ?
      ORDER BY br.requested_at DESC
    `, [patientId]);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get requests by patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get requests by status
const getRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const [requests] = await pool.execute(`
      SELECT br.*, 
             p.first_name as patient_first_name, 
             p.last_name as patient_last_name,
             p.blood_group as patient_blood_group,
             h.hospital_name
      FROM blood_requests br
      JOIN patients p ON br.patient_id = p.id
      JOIN hospitals h ON br.hospital_id = h.id
      WHERE br.status = ?
      ORDER BY br.requested_at DESC
    `, [status]);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get requests by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create blood request
const createRequest = async (req, res) => {
  try {
    const requestData = req.body;
    const userId = req.user.id;

    // Get patient ID for current user
    const [patientData] = await pool.execute(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (patientData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const patientId = patientData[0].id;

    // Create blood request
    const [result] = await pool.execute(`
      INSERT INTO blood_requests (
        patient_id, hospital_id, blood_group, units_requested, 
        urgency, reason, doctor_name, doctor_contact, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      patientId,
      requestData.hospital_id,
      requestData.blood_group,
      requestData.units_requested,
      requestData.urgency || 'medium',
      requestData.reason,
      requestData.doctor_name || null,
      requestData.doctor_contact || null,
      requestData.notes || null
    ]);

    const requestId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: { id: requestId }
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update request status
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Check if request exists and belongs to current user's hospital
    const [requests] = await pool.execute(`
      SELECT br.*, h.user_id as hospital_user_id
      FROM blood_requests br
      JOIN hospitals h ON br.hospital_id = h.id
      WHERE br.id = ?
    `, [requestId]);

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (requests[0].hospital_user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update request status
    const updateFields = ['status = ?'];
    const updateValues = [status];

    if (status === 'approved') {
      updateFields.push('approved_at = CURRENT_TIMESTAMP');
    }

    updateValues.push(requestId);

    await pool.execute(
      `UPDATE blood_requests SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Request status updated successfully'
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update request
const updateRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const requestData = req.body;
    const userId = req.user.id;

    // Check if request exists and belongs to current user's patient
    const [requests] = await pool.execute(`
      SELECT br.*, p.user_id as patient_user_id
      FROM blood_requests br
      JOIN patients p ON br.patient_id = p.id
      WHERE br.id = ?
    `, [requestId]);

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (requests[0].patient_user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update request
    const updateFields = [];
    const updateValues = [];

    Object.keys(requestData).forEach(key => {
      if (requestData[key] !== undefined && requestData[key] !== null) {
        updateFields.push(`${key} = ?`);
        updateValues.push(requestData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(requestId);

    await pool.execute(
      `UPDATE blood_requests SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Request updated successfully'
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete request
const deleteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // Check if request exists and belongs to current user's patient
    const [requests] = await pool.execute(`
      SELECT br.*, p.user_id as patient_user_id
      FROM blood_requests br
      JOIN patients p ON br.patient_id = p.id
      WHERE br.id = ?
    `, [requestId]);

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (requests[0].patient_user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete request
    await pool.execute('DELETE FROM blood_requests WHERE id = ?', [requestId]);

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get pending requests
const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get hospital ID for current user
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

    const [requests] = await pool.execute(`
      SELECT br.*, 
             p.first_name as patient_first_name, 
             p.last_name as patient_last_name,
             p.blood_group as patient_blood_group
      FROM blood_requests br
      JOIN patients p ON br.patient_id = p.id
      WHERE br.hospital_id = ? AND br.status = 'pending'
      ORDER BY br.urgency DESC, br.requested_at ASC
    `, [hospitalId]);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get request statistics
const getRequestStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(units_requested) as total_units_requested,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
        COUNT(CASE WHEN status = 'fulfilled' THEN 1 END) as fulfilled_requests
      FROM blood_requests
    `);

    // Get requests by urgency
    const [urgencyStats] = await pool.execute(`
      SELECT 
        urgency,
        COUNT(*) as count,
        SUM(units_requested) as total_units
      FROM blood_requests 
      GROUP BY urgency
      ORDER BY urgency
    `);

    // Get requests by blood group
    const [bloodGroupStats] = await pool.execute(`
      SELECT 
        blood_group,
        COUNT(*) as count,
        SUM(units_requested) as total_units
      FROM blood_requests 
      GROUP BY blood_group
      ORDER BY blood_group
    `);

    const [requiredstats] = await pool.execute(`
      SELECT 
        blood_group,
        units_requested,
        urgency,
        requested_at
      FROM blood_requests
      WHERE status = 'pending'
      `)

    // console.log(requierdstats);

    res.json({
      success: true,
      data: {
        overall: stats[0],
        byUrgency: urgencyStats,
        byBloodGroup: bloodGroupStats,
        requiredStats: requiredstats
      }
    });
  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllRequests,
  getRequestById,
  getRequestsByPatient,
  getRequestsByStatus,
  createRequest,
  updateRequestStatus,
  updateRequest,
  deleteRequest,
  getPendingRequests,
  getRequestStats
};
