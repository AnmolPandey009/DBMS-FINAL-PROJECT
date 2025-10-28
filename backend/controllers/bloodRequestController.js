const { pool } = require('../config/database');

// Get all blood requests with pagination and filters
const getAllBloodRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, patient_id, blood_group, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT br.request_id, br.patient_id, br.blood_group, br.units, br.urgency,
             br.status, br.request_date, br.required_by, br.notes, br.created_at,
             p.name as patient_name, p.phone as patient_phone, p.hospital_id,
             h.name as hospital_name
      FROM blood_requests br
      LEFT JOIN patients p ON br.patient_id = p.patient_id
      LEFT JOIN hospitals h ON p.hospital_id = h.hospital_id
      WHERE 1=1
    `;
    const queryParams = [];
    
    if (patient_id) {
      query += ' AND br.patient_id = ?';
      queryParams.push(patient_id);
    }
    
    if (blood_group) {
      query += ' AND br.blood_group = ?';
      queryParams.push(blood_group);
    }
    
    if (status) {
      query += ' AND br.status = ?';
      queryParams.push(status);
    }
    
    query += ' ORDER BY br.request_date DESC, br.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [requests] = await pool.execute(query, queryParams);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM blood_requests br WHERE 1=1';
    const countParams = [];
    
    if (patient_id) {
      countQuery += ' AND br.patient_id = ?';
      countParams.push(patient_id);
    }
    
    if (blood_group) {
      countQuery += ' AND br.blood_group = ?';
      countParams.push(blood_group);
    }
    
    if (status) {
      countQuery += ' AND br.status = ?';
      countParams.push(status);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blood requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood requests',
      error: error.message
    });
  }
};

// Get blood request by ID
const getBloodRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [requests] = await pool.execute(`
      SELECT br.*, p.name as patient_name, p.phone as patient_phone, p.email as patient_email,
             p.age as patient_age, p.gender as patient_gender, p.hospital_id,
             h.name as hospital_name, h.address as hospital_address
      FROM blood_requests br
      LEFT JOIN patients p ON br.patient_id = p.patient_id
      LEFT JOIN hospitals h ON p.hospital_id = h.hospital_id
      WHERE br.request_id = ?
    `, [id]);
    
    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }
    
    res.json({
      success: true,
      data: requests[0]
    });
  } catch (error) {
    console.error('Error fetching blood request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood request',
      error: error.message
    });
  }
};

// Create new blood request
const createBloodRequest = async (req, res) => {
  try {
    const {
      patient_id, blood_group, units, urgency, required_by, notes
    } = req.body;
    
    // Check if patient exists
    const [patients] = await pool.execute(
      'SELECT patient_id, name FROM patients WHERE patient_id = ?',
      [patient_id]
    );
    
    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO blood_requests (patient_id, blood_group, units, urgency, required_by, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, blood_group, units, urgency || 'Medium', required_by, notes]
    );
    
    const [newRequest] = await pool.execute(
      'SELECT * FROM blood_requests WHERE request_id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: newRequest[0]
    });
  } catch (error) {
    console.error('Error creating blood request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blood request',
      error: error.message
    });
  }
};

// Update blood request
const updateBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      patient_id, blood_group, units, urgency, status, required_by, notes
    } = req.body;
    
    // Check if request exists
    const [existingRequests] = await pool.execute(
      'SELECT request_id FROM blood_requests WHERE request_id = ?',
      [id]
    );
    
    if (existingRequests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }
    
    await pool.execute(
      `UPDATE blood_requests SET patient_id = ?, blood_group = ?, units = ?, 
       urgency = ?, status = ?, required_by = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE request_id = ?`,
      [patient_id, blood_group, units, urgency, status, required_by, notes, id]
    );
    
    const [updatedRequest] = await pool.execute(
      'SELECT * FROM blood_requests WHERE request_id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Blood request updated successfully',
      data: updatedRequest[0]
    });
  } catch (error) {
    console.error('Error updating blood request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blood request',
      error: error.message
    });
  }
};

// Delete blood request
const deleteBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if request exists
    const [existingRequests] = await pool.execute(
      'SELECT request_id FROM blood_requests WHERE request_id = ?',
      [id]
    );
    
    if (existingRequests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }
    
    // Check if request has been fulfilled
    const [requestStatus] = await pool.execute(
      'SELECT status FROM blood_requests WHERE request_id = ?',
      [id]
    );
    
    if (requestStatus[0].status === 'Fulfilled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete fulfilled blood request'
      });
    }
    
    await pool.execute('DELETE FROM blood_requests WHERE request_id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Blood request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blood request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blood request',
      error: error.message
    });
  }
};

// Update blood request status
const updateBloodRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Check if request exists
    const [existingRequests] = await pool.execute(
      'SELECT request_id, status FROM blood_requests WHERE request_id = ?',
      [id]
    );
    
    if (existingRequests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }
    
    await pool.execute(
      'UPDATE blood_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE request_id = ?',
      [status, id]
    );
    
    const [updatedRequest] = await pool.execute(
      'SELECT * FROM blood_requests WHERE request_id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Blood request status updated successfully',
      data: updatedRequest[0]
    });
  } catch (error) {
    console.error('Error updating blood request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blood request status',
      error: error.message
    });
  }
};

// Get blood request statistics
const getBloodRequestStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_requests,
        COUNT(CASE WHEN status = 'Fulfilled' THEN 1 END) as fulfilled_requests,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_requests,
        blood_group,
        COUNT(*) as count_by_group,
        SUM(units) as units_by_group
      FROM blood_requests 
      GROUP BY blood_group
      ORDER BY count_by_group DESC
    `);
    
    // Get urgency statistics
    const [urgencyStats] = await pool.execute(`
      SELECT 
        urgency,
        COUNT(*) as count,
        SUM(units) as total_units
      FROM blood_requests 
      WHERE status IN ('Pending', 'Approved')
      GROUP BY urgency
      ORDER BY 
        CASE urgency 
          WHEN 'Critical' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'Low' THEN 4 
        END
    `);
    
    res.json({
      success: true,
      data: {
        by_blood_group: stats,
        by_urgency: urgencyStats
      }
    });
  } catch (error) {
    console.error('Error fetching blood request stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood request statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllBloodRequests,
  getBloodRequestById,
  createBloodRequest,
  updateBloodRequest,
  deleteBloodRequest,
  updateBloodRequestStatus,
  getBloodRequestStats
};
