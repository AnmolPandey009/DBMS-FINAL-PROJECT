const { pool } = require('../config/database');

// Get all blood donations with pagination and filters
const getAllBloodDonations = async (req, res) => {
  try {
    const { page = 1, limit = 10, donor_id, blood_group, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT bd.donation_id, bd.donor_id, bd.blood_group, bd.units, bd.donate_date,
             bd.donation_type, bd.status, bd.notes, bd.created_at,
             d.name as donor_name, d.phone as donor_phone
      FROM blood_donations bd
      LEFT JOIN donors d ON bd.donor_id = d.donor_id
      WHERE 1=1
    `;
    const queryParams = [];
    
    if (donor_id) {
      query += ' AND bd.donor_id = ?';
      queryParams.push(donor_id);
    }
    
    if (blood_group) {
      query += ' AND bd.blood_group = ?';
      queryParams.push(blood_group);
    }
    
    if (status) {
      query += ' AND bd.status = ?';
      queryParams.push(status);
    }
    
    query += ' ORDER BY bd.donate_date DESC, bd.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [donations] = await pool.execute(query, queryParams);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM blood_donations bd WHERE 1=1';
    const countParams = [];
    
    if (donor_id) {
      countQuery += ' AND bd.donor_id = ?';
      countParams.push(donor_id);
    }
    
    if (blood_group) {
      countQuery += ' AND bd.blood_group = ?';
      countParams.push(blood_group);
    }
    
    if (status) {
      countQuery += ' AND bd.status = ?';
      countParams.push(status);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blood donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood donations',
      error: error.message
    });
  }
};

// Get blood donation by ID
const getBloodDonationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [donations] = await pool.execute(`
      SELECT bd.*, d.name as donor_name, d.phone as donor_phone, d.email as donor_email
      FROM blood_donations bd
      LEFT JOIN donors d ON bd.donor_id = d.donor_id
      WHERE bd.donation_id = ?
    `, [id]);
    
    if (donations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood donation not found'
      });
    }
    
    res.json({
      success: true,
      data: donations[0]
    });
  } catch (error) {
    console.error('Error fetching blood donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood donation',
      error: error.message
    });
  }
};

// Create new blood donation
const createBloodDonation = async (req, res) => {
  try {
    const {
      donor_id, blood_group, units, donate_date, donation_type, status, notes
    } = req.body;
    
    // Check if donor exists
    const [donors] = await pool.execute(
      'SELECT donor_id, name, is_eligible FROM donors WHERE donor_id = ?',
      [donor_id]
    );
    
    if (donors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }
    
    if (!donors[0].is_eligible) {
      return res.status(400).json({
        success: false,
        message: 'Donor is not eligible to donate blood'
      });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO blood_donations (donor_id, blood_group, units, donate_date, donation_type, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [donor_id, blood_group, units, donate_date, donation_type || 'Whole Blood', status || 'Completed', notes]
    );
    
    // Update donor's last donation date
    await pool.execute(
      'UPDATE donors SET last_donate = ? WHERE donor_id = ?',
      [donate_date, donor_id]
    );
    
    // Create blood inventory entry
    const expiryDate = new Date(donate_date);
    expiryDate.setDate(expiryDate.getDate() + 42); // Blood expires in 42 days
    
    await pool.execute(
      `INSERT INTO blood_inventory (blood_group, units_available, expiry_date, donation_id, status) 
       VALUES (?, ?, ?, ?, 'Available')`,
      [blood_group, units, expiryDate.toISOString().split('T')[0], result.insertId]
    );
    
    const [newDonation] = await pool.execute(
      'SELECT * FROM blood_donations WHERE donation_id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Blood donation recorded successfully',
      data: newDonation[0]
    });
  } catch (error) {
    console.error('Error creating blood donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blood donation',
      error: error.message
    });
  }
};

// Update blood donation
const updateBloodDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      donor_id, blood_group, units, donate_date, donation_type, status, notes
    } = req.body;
    
    // Check if donation exists
    const [existingDonations] = await pool.execute(
      'SELECT donation_id FROM blood_donations WHERE donation_id = ?',
      [id]
    );
    
    if (existingDonations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood donation not found'
      });
    }
    
    await pool.execute(
      `UPDATE blood_donations SET donor_id = ?, blood_group = ?, units = ?, 
       donate_date = ?, donation_type = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE donation_id = ?`,
      [donor_id, blood_group, units, donate_date, donation_type, status, notes, id]
    );
    
    const [updatedDonation] = await pool.execute(
      'SELECT * FROM blood_donations WHERE donation_id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Blood donation updated successfully',
      data: updatedDonation[0]
    });
  } catch (error) {
    console.error('Error updating blood donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blood donation',
      error: error.message
    });
  }
};

// Delete blood donation
const deleteBloodDonation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if donation exists
    const [existingDonations] = await pool.execute(
      'SELECT donation_id FROM blood_donations WHERE donation_id = ?',
      [id]
    );
    
    if (existingDonations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood donation not found'
      });
    }
    
    // Check if donation has been used in inventory
    const [inventory] = await pool.execute(
      'SELECT inventory_id FROM blood_inventory WHERE donation_id = ?',
      [id]
    );
    
    if (inventory.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete blood donation that has been added to inventory'
      });
    }
    
    await pool.execute('DELETE FROM blood_donations WHERE donation_id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Blood donation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blood donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blood donation',
      error: error.message
    });
  }
};

// Get blood donation statistics
const getBloodDonationStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_donations,
        SUM(units) as total_units_donated,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_donations,
        blood_group,
        COUNT(*) as count_by_group,
        SUM(units) as units_by_group
      FROM blood_donations 
      GROUP BY blood_group
      ORDER BY count_by_group DESC
    `);
    
    // Get monthly statistics
    const [monthlyStats] = await pool.execute(`
      SELECT 
        DATE_FORMAT(donate_date, '%Y-%m') as month,
        COUNT(*) as donations_count,
        SUM(units) as units_donated
      FROM blood_donations 
      WHERE donate_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(donate_date, '%Y-%m')
      ORDER BY month DESC
    `);
    
    res.json({
      success: true,
      data: {
        by_blood_group: stats,
        monthly: monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching blood donation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood donation statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllBloodDonations,
  getBloodDonationById,
  createBloodDonation,
  updateBloodDonation,
  deleteBloodDonation,
  getBloodDonationStats
};
