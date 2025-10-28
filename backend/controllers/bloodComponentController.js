const { pool } = require('../config/database');

// Get all blood components with pagination and filters
const getAllBloodComponents = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, blood_group, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT bc.component_id, bc.type, bc.blood_group, bc.units, bc.expiry_date,
             bc.donation_id, bc.status, bc.created_at,
             bd.donate_date, d.name as donor_name
      FROM blood_components bc
      LEFT JOIN blood_donations bd ON bc.donation_id = bd.donation_id
      LEFT JOIN donors d ON bd.donor_id = d.donor_id
      WHERE 1=1
    `;
    const queryParams = [];
    
    if (type) {
      query += ' AND bc.type = ?';
      queryParams.push(type);
    }
    
    if (blood_group) {
      query += ' AND bc.blood_group = ?';
      queryParams.push(blood_group);
    }
    
    if (status) {
      query += ' AND bc.status = ?';
      queryParams.push(status);
    }
    
    query += ' ORDER BY bc.expiry_date ASC, bc.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [components] = await pool.execute(query, queryParams);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM blood_components bc WHERE 1=1';
    const countParams = [];
    
    if (type) {
      countQuery += ' AND bc.type = ?';
      countParams.push(type);
    }
    
    if (blood_group) {
      countQuery += ' AND bc.blood_group = ?';
      countParams.push(blood_group);
    }
    
    if (status) {
      countQuery += ' AND bc.status = ?';
      countParams.push(status);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: components,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blood components:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood components',
      error: error.message
    });
  }
};

// Get blood component by ID
const getBloodComponentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [components] = await pool.execute(`
      SELECT bc.*, bd.donate_date, d.name as donor_name, d.phone as donor_phone
      FROM blood_components bc
      LEFT JOIN blood_donations bd ON bc.donation_id = bd.donation_id
      LEFT JOIN donors d ON bd.donor_id = d.donor_id
      WHERE bc.component_id = ?
    `, [id]);
    
    if (components.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood component not found'
      });
    }
    
    res.json({
      success: true,
      data: components[0]
    });
  } catch (error) {
    console.error('Error fetching blood component:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood component',
      error: error.message
    });
  }
};

// Create new blood component
const createBloodComponent = async (req, res) => {
  try {
    const {
      type, blood_group, units, expiry_date, donation_id, status
    } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO blood_components (type, blood_group, units, expiry_date, donation_id, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [type, blood_group, units, expiry_date, donation_id, status || 'Available']
    );
    
    const [newComponent] = await pool.execute(
      'SELECT * FROM blood_components WHERE component_id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Blood component created successfully',
      data: newComponent[0]
    });
  } catch (error) {
    console.error('Error creating blood component:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blood component',
      error: error.message
    });
  }
};

// Update blood component
const updateBloodComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type, blood_group, units, expiry_date, donation_id, status
    } = req.body;
    
    // Check if component exists
    const [existingComponents] = await pool.execute(
      'SELECT component_id FROM blood_components WHERE component_id = ?',
      [id]
    );
    
    if (existingComponents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood component not found'
      });
    }
    
    await pool.execute(
      `UPDATE blood_components SET type = ?, blood_group = ?, units = ?, 
       expiry_date = ?, donation_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE component_id = ?`,
      [type, blood_group, units, expiry_date, donation_id, status, id]
    );
    
    const [updatedComponent] = await pool.execute(
      'SELECT * FROM blood_components WHERE component_id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Blood component updated successfully',
      data: updatedComponent[0]
    });
  } catch (error) {
    console.error('Error updating blood component:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blood component',
      error: error.message
    });
  }
};

// Delete blood component
const deleteBloodComponent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if component exists
    const [existingComponents] = await pool.execute(
      'SELECT component_id FROM blood_components WHERE component_id = ?',
      [id]
    );
    
    if (existingComponents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood component not found'
      });
    }
    
    // Check if component has been used in blood issues
    const [issues] = await pool.execute(
      'SELECT issue_id FROM blood_issues WHERE component_id = ?',
      [id]
    );
    
    if (issues.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete blood component that has been used'
      });
    }
    
    await pool.execute('DELETE FROM blood_components WHERE component_id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Blood component deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blood component:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blood component',
      error: error.message
    });
  }
};

// Get blood component statistics
const getBloodComponentStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        type,
        blood_group,
        SUM(units) as total_units,
        COUNT(*) as total_entries,
        COUNT(CASE WHEN status = 'Available' THEN 1 END) as available_entries,
        COUNT(CASE WHEN status = 'Reserved' THEN 1 END) as reserved_entries,
        COUNT(CASE WHEN status = 'Used' THEN 1 END) as used_entries,
        COUNT(CASE WHEN status = 'Expired' THEN 1 END) as expired_entries,
        COUNT(CASE WHEN expiry_date < CURDATE() THEN 1 END) as expired_count
      FROM blood_components 
      GROUP BY type, blood_group
      ORDER BY type, blood_group
    `);
    
    // Get overall statistics
    const [overallStats] = await pool.execute(`
      SELECT 
        type,
        SUM(units) as total_units_by_type,
        COUNT(*) as total_entries_by_type
      FROM blood_components
      GROUP BY type
      ORDER BY total_units_by_type DESC
    `);
    
    res.json({
      success: true,
      data: {
        by_type_and_group: stats,
        by_type: overallStats
      }
    });
  } catch (error) {
    console.error('Error fetching blood component stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood component statistics',
      error: error.message
    });
  }
};

// Get expiring blood components
const getExpiringBloodComponents = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const [expiring] = await pool.execute(`
      SELECT bc.*, bd.donate_date, d.name as donor_name
      FROM blood_components bc
      LEFT JOIN blood_donations bd ON bc.donation_id = bd.donation_id
      LEFT JOIN donors d ON bd.donor_id = d.donor_id
      WHERE bc.status = 'Available' 
        AND bc.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY bc.expiry_date ASC
    `, [parseInt(days)]);
    
    res.json({
      success: true,
      data: expiring
    });
  } catch (error) {
    console.error('Error fetching expiring blood components:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring blood components',
      error: error.message
    });
  }
};

module.exports = {
  getAllBloodComponents,
  getBloodComponentById,
  createBloodComponent,
  updateBloodComponent,
  deleteBloodComponent,
  getBloodComponentStats,
  getExpiringBloodComponents
};
