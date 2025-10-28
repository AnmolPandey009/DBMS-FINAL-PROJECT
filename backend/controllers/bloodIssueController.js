const { pool } = require('../config/database');

// Get all blood issues with pagination and filters
const getAllBloodIssues = async (req, res) => {
  try {
    const { page = 1, limit = 10, patient_id, issued_by, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT bi.issue_id, bi.patient_id, bi.inventory_id, bi.component_id, bi.units,
             bi.issue_date, bi.issued_by, bi.status, bi.notes, bi.created_at,
             p.name as patient_name, p.phone as patient_phone,
             u.full_name as issued_by_name,
             inv.blood_group as inventory_blood_group,
             comp.type as component_type, comp.blood_group as component_blood_group
      FROM blood_issues bi
      LEFT JOIN patients p ON bi.patient_id = p.patient_id
      LEFT JOIN users u ON bi.issued_by = u.user_id
      LEFT JOIN blood_inventory inv ON bi.inventory_id = inv.inventory_id
      LEFT JOIN blood_components comp ON bi.component_id = comp.component_id
      WHERE 1=1
    `;
    const queryParams = [];
    
    if (patient_id) {
      query += ' AND bi.patient_id = ?';
      queryParams.push(patient_id);
    }
    
    if (issued_by) {
      query += ' AND bi.issued_by = ?';
      queryParams.push(issued_by);
    }
    
    if (status) {
      query += ' AND bi.status = ?';
      queryParams.push(status);
    }
    
    query += ' ORDER BY bi.issue_date DESC, bi.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [issues] = await pool.execute(query, queryParams);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM blood_issues bi WHERE 1=1';
    const countParams = [];
    
    if (patient_id) {
      countQuery += ' AND bi.patient_id = ?';
      countParams.push(patient_id);
    }
    
    if (issued_by) {
      countQuery += ' AND bi.issued_by = ?';
      countParams.push(issued_by);
    }
    
    if (status) {
      countQuery += ' AND bi.status = ?';
      countParams.push(status);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blood issues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood issues',
      error: error.message
    });
  }
};

// Get blood issue by ID
const getBloodIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [issues] = await pool.execute(`
      SELECT bi.*, p.name as patient_name, p.phone as patient_phone, p.email as patient_email,
             u.full_name as issued_by_name, u.username as issued_by_username,
             inv.blood_group as inventory_blood_group, inv.units_available as inventory_units,
             comp.type as component_type, comp.blood_group as component_blood_group
      FROM blood_issues bi
      LEFT JOIN patients p ON bi.patient_id = p.patient_id
      LEFT JOIN users u ON bi.issued_by = u.user_id
      LEFT JOIN blood_inventory inv ON bi.inventory_id = inv.inventory_id
      LEFT JOIN blood_components comp ON bi.component_id = comp.component_id
      WHERE bi.issue_id = ?
    `, [id]);
    
    if (issues.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood issue not found'
      });
    }
    
    res.json({
      success: true,
      data: issues[0]
    });
  } catch (error) {
    console.error('Error fetching blood issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood issue',
      error: error.message
    });
  }
};

// Create new blood issue
const createBloodIssue = async (req, res) => {
  try {
    const {
      patient_id, inventory_id, component_id, units, issued_by, notes
    } = req.body;
    
    // Validate that either inventory_id or component_id is provided, but not both
    if (!inventory_id && !component_id) {
      return res.status(400).json({
        success: false,
        message: 'Either inventory_id or component_id must be provided'
      });
    }
    
    if (inventory_id && component_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot provide both inventory_id and component_id'
      });
    }
    
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
    
    // Check if user exists
    const [users] = await pool.execute(
      'SELECT user_id, full_name FROM users WHERE user_id = ?',
      [issued_by]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check inventory availability if using inventory
    if (inventory_id) {
      const [inventory] = await pool.execute(
        'SELECT units_available, status FROM blood_inventory WHERE inventory_id = ?',
        [inventory_id]
      );
      
      if (inventory.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Blood inventory not found'
        });
      }
      
      if (inventory[0].status !== 'Available') {
        return res.status(400).json({
          success: false,
          message: 'Blood inventory is not available'
        });
      }
      
      if (inventory[0].units_available < units) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient blood units available'
        });
      }
    }
    
    // Check component availability if using component
    if (component_id) {
      const [components] = await pool.execute(
        'SELECT units, status FROM blood_components WHERE component_id = ?',
        [component_id]
      );
      
      if (components.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Blood component not found'
        });
      }
      
      if (components[0].status !== 'Available') {
        return res.status(400).json({
          success: false,
          message: 'Blood component is not available'
        });
      }
      
      if (components[0].units < units) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient component units available'
        });
      }
    }
    
    const [result] = await pool.execute(
      `INSERT INTO blood_issues (patient_id, inventory_id, component_id, units, issued_by, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, inventory_id, component_id, units, issued_by, notes]
    );
    
    // Update inventory or component status
    if (inventory_id) {
      await pool.execute(
        'UPDATE blood_inventory SET units_available = units_available - ?, status = CASE WHEN units_available - ? <= 0 THEN "Used" ELSE "Available" END WHERE inventory_id = ?',
        [units, units, inventory_id]
      );
    }
    
    if (component_id) {
      await pool.execute(
        'UPDATE blood_components SET units = units - ?, status = CASE WHEN units - ? <= 0 THEN "Used" ELSE "Available" END WHERE component_id = ?',
        [units, units, component_id]
      );
    }
    
    const [newIssue] = await pool.execute(
      'SELECT * FROM blood_issues WHERE issue_id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Blood issue created successfully',
      data: newIssue[0]
    });
  } catch (error) {
    console.error('Error creating blood issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blood issue',
      error: error.message
    });
  }
};

// Update blood issue
const updateBloodIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      patient_id, inventory_id, component_id, units, issued_by, status, notes
    } = req.body;
    
    // Check if issue exists
    const [existingIssues] = await pool.execute(
      'SELECT issue_id FROM blood_issues WHERE issue_id = ?',
      [id]
    );
    
    if (existingIssues.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood issue not found'
      });
    }
    
    await pool.execute(
      `UPDATE blood_issues SET patient_id = ?, inventory_id = ?, component_id = ?, 
       units = ?, issued_by = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE issue_id = ?`,
      [patient_id, inventory_id, component_id, units, issued_by, status, notes, id]
    );
    
    const [updatedIssue] = await pool.execute(
      'SELECT * FROM blood_issues WHERE issue_id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Blood issue updated successfully',
      data: updatedIssue[0]
    });
  } catch (error) {
    console.error('Error updating blood issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blood issue',
      error: error.message
    });
  }
};

// Delete blood issue
const deleteBloodIssue = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if issue exists
    const [existingIssues] = await pool.execute(
      'SELECT issue_id, status FROM blood_issues WHERE issue_id = ?',
      [id]
    );
    
    if (existingIssues.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood issue not found'
      });
    }
    
    if (existingIssues[0].status === 'Used') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete used blood issue'
      });
    }
    
    await pool.execute('DELETE FROM blood_issues WHERE issue_id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Blood issue deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blood issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blood issue',
      error: error.message
    });
  }
};

// Get blood issue statistics
const getBloodIssueStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_issues,
        SUM(units) as total_units_issued,
        COUNT(CASE WHEN status = 'Issued' THEN 1 END) as issued_count,
        COUNT(CASE WHEN status = 'Returned' THEN 1 END) as returned_count,
        COUNT(CASE WHEN status = 'Used' THEN 1 END) as used_count,
        DATE_FORMAT(issue_date, '%Y-%m') as month,
        COUNT(*) as issues_by_month,
        SUM(units) as units_by_month
      FROM blood_issues 
      WHERE issue_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(issue_date, '%Y-%m')
      ORDER BY month DESC
    `);
    
    // Get issues by user
    const [userStats] = await pool.execute(`
      SELECT 
        u.full_name as issued_by_name,
        COUNT(*) as total_issues,
        SUM(bi.units) as total_units_issued
      FROM blood_issues bi
      LEFT JOIN users u ON bi.issued_by = u.user_id
      GROUP BY bi.issued_by, u.full_name
      ORDER BY total_issues DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        monthly: stats,
        by_user: userStats
      }
    });
  } catch (error) {
    console.error('Error fetching blood issue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood issue statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllBloodIssues,
  getBloodIssueById,
  createBloodIssue,
  updateBloodIssue,
  deleteBloodIssue,
  getBloodIssueStats
};
