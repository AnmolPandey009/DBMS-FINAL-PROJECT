const { pool } = require('../config/database');

// Get all blood inventory with pagination and filters
const getAllBloodInventory = async (req, res) => {
  try {
    const { page = 1, limit = 10, blood_group, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT bi.inventory_id, bi.blood_group, bi.units_available, bi.expiry_date,
             bi.donation_id, bi.status, bi.created_at,
             bd.donate_date, d.name as donor_name
      FROM blood_inventory bi
      LEFT JOIN blood_donations bd ON bi.donation_id = bd.donation_id
      LEFT JOIN donors d ON bd.donor_id = d.donor_id
      WHERE 1=1
    `;
    const queryParams = [];
    
    if (blood_group) {
      query += ' AND bi.blood_group = ?';
      queryParams.push(blood_group);
    }
    
    if (status) {
      query += ' AND bi.status = ?';
      queryParams.push(status);
    }
    
    query += ' ORDER BY bi.expiry_date ASC, bi.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [inventory] = await pool.execute(query, queryParams);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM blood_inventory bi WHERE 1=1';
    const countParams = [];
    
    if (blood_group) {
      countQuery += ' AND bi.blood_group = ?';
      countParams.push(blood_group);
    }
    
    if (status) {
      countQuery += ' AND bi.status = ?';
      countParams.push(status);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: inventory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blood inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood inventory',
      error: error.message
    });
  }
};

// Get blood inventory by ID
const getBloodInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [inventory] = await pool.execute(`
      SELECT bi.*, bd.donate_date, d.name as donor_name, d.phone as donor_phone
      FROM blood_inventory bi
      LEFT JOIN blood_donations bd ON bi.donation_id = bd.donation_id
      LEFT JOIN donors d ON bd.donor_id = d.donor_id
      WHERE bi.inventory_id = ?
    `, [id]);
    
    if (inventory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood inventory not found'
      });
    }
    
    res.json({
      success: true,
      data: inventory[0]
    });
  } catch (error) {
    console.error('Error fetching blood inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood inventory',
      error: error.message
    });
  }
};

// Create new blood inventory entry
const createBloodInventory = async (req, res) => {
  try {
    const {
      blood_group, units_available, expiry_date, donation_id, status
    } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO blood_inventory (blood_group, units_available, expiry_date, donation_id, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [blood_group, units_available, expiry_date, donation_id, status || 'Available']
    );
    
    const [newInventory] = await pool.execute(
      'SELECT * FROM blood_inventory WHERE inventory_id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Blood inventory created successfully',
      data: newInventory[0]
    });
  } catch (error) {
    console.error('Error creating blood inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blood inventory',
      error: error.message
    });
  }
};

// Update blood inventory
const updateBloodInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      blood_group, units_available, expiry_date, donation_id, status
    } = req.body;
    
    // Check if inventory exists
    const [existingInventory] = await pool.execute(
      'SELECT inventory_id FROM blood_inventory WHERE inventory_id = ?',
      [id]
    );
    
    if (existingInventory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood inventory not found'
      });
    }
    
    await pool.execute(
      `UPDATE blood_inventory SET blood_group = ?, units_available = ?, 
       expiry_date = ?, donation_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE inventory_id = ?`,
      [blood_group, units_available, expiry_date, donation_id, status, id]
    );
    
    const [updatedInventory] = await pool.execute(
      'SELECT * FROM blood_inventory WHERE inventory_id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Blood inventory updated successfully',
      data: updatedInventory[0]
    });
  } catch (error) {
    console.error('Error updating blood inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blood inventory',
      error: error.message
    });
  }
};

// Delete blood inventory
const deleteBloodInventory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if inventory exists
    const [existingInventory] = await pool.execute(
      'SELECT inventory_id FROM blood_inventory WHERE inventory_id = ?',
      [id]
    );
    
    if (existingInventory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood inventory not found'
      });
    }
    
    // Check if inventory has been used in blood issues
    const [issues] = await pool.execute(
      'SELECT issue_id FROM blood_issues WHERE inventory_id = ?',
      [id]
    );
    
    if (issues.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete blood inventory that has been used'
      });
    }
    
    await pool.execute('DELETE FROM blood_inventory WHERE inventory_id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Blood inventory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blood inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blood inventory',
      error: error.message
    });
  }
};

// Get blood inventory statistics
const getBloodInventoryStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        blood_group,
        SUM(units_available) as total_units,
        COUNT(*) as total_entries,
        COUNT(CASE WHEN status = 'Available' THEN 1 END) as available_entries,
        COUNT(CASE WHEN status = 'Reserved' THEN 1 END) as reserved_entries,
        COUNT(CASE WHEN status = 'Used' THEN 1 END) as used_entries,
        COUNT(CASE WHEN status = 'Expired' THEN 1 END) as expired_entries,
        COUNT(CASE WHEN expiry_date < CURDATE() THEN 1 END) as expired_count
      FROM blood_inventory 
      GROUP BY blood_group
      ORDER BY total_units DESC
    `);
    
    // Get overall statistics
    const [overallStats] = await pool.execute(`
      SELECT 
        SUM(units_available) as total_units_available,
        COUNT(*) as total_entries,
        COUNT(CASE WHEN status = 'Available' THEN 1 END) as available_entries,
        COUNT(CASE WHEN expiry_date < CURDATE() THEN 1 END) as expired_entries
      FROM blood_inventory
    `);
    
    res.json({
      success: true,
      data: {
        by_blood_group: stats,
        overall: overallStats[0]
      }
    });
  } catch (error) {
    console.error('Error fetching blood inventory stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood inventory statistics',
      error: error.message
    });
  }
};

// Get expiring blood inventory
const getExpiringBloodInventory = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const [expiring] = await pool.execute(`
      SELECT bi.*, bd.donate_date, d.name as donor_name
      FROM blood_inventory bi
      LEFT JOIN blood_donations bd ON bi.donation_id = bd.donation_id
      LEFT JOIN donors d ON bd.donor_id = d.donor_id
      WHERE bi.status = 'Available' 
        AND bi.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY bi.expiry_date ASC
    `, [parseInt(days)]);
    
    res.json({
      success: true,
      data: expiring
    });
  } catch (error) {
    console.error('Error fetching expiring blood inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring blood inventory',
      error: error.message
    });
  }
};

module.exports = {
  getAllBloodInventory,
  getBloodInventoryById,
  createBloodInventory,
  updateBloodInventory,
  deleteBloodInventory,
  getBloodInventoryStats,
  getExpiringBloodInventory
};
