const { pool } = require('../config/database');

// Get all inventory 
const getAllInventory = async (req, res) => {
  try {
    const [inventory] = await pool.execute(`
      SELECT bi.*, h.hospital_name
      FROM blood_inventory bi
      JOIN hospitals h ON bi.hospital_id = h.id
      ORDER BY bi.blood_group, bi.created_at DESC
    `);

    const [inventory2] = await pool.execute(`
      SELECT * from blood_inventory  
      `)

    res.json({
      success: true,
      data: inventory2
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get available blood
const getAvailableBlood = async (req, res) => {
  try {
    const [inventory] = await pool.execute(`
      SELECT bi.*, h.hospital_name
      FROM blood_inventory bi
      JOIN hospitals h ON bi.hospital_id = h.id
      WHERE bi.status = 'available' AND bi.units_available > 0
      ORDER BY bi.blood_group, bi.expiry_date ASC
    `);

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Get available blood error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get blood by group
const getBloodByGroup = async (req, res) => {
  try {
    const { bloodGroup } = req.params;

    const [inventory] = await pool.execute(`
      SELECT bi.*, h.hospital_name
      FROM blood_inventory bi
      JOIN hospitals h ON bi.hospital_id = h.id
      WHERE bi.blood_group = ? AND bi.status = 'available' AND bi.units_available > 0
      ORDER BY bi.expiry_date ASC
    `, [bloodGroup]);

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Get blood by group error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add blood to inventory
const addBloodToInventory = async (req, res) => {
  try {
    const bloodData = req.body;
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

    // Normalize numeric values
    const unitsToAdd = Number(bloodData.units_available) || 0;

    // Upsert: add new row or increment existing units atomically
    await pool.execute(`
      INSERT INTO blood_inventory (hospital_id, blood_group, units_available, expiry_date, status)
      VALUES (?, ?, ?, ?, 'available')
      ON DUPLICATE KEY UPDATE
        units_available = units_available + VALUES(units_available),
        updated_at = CURRENT_TIMESTAMP
    `, [
      hospitalId,
      bloodData.blood_group,
      unitsToAdd,
      bloodData.expiry_date || null
    ]);

    res.status(201).json({
      success: true,
      message: 'Blood added to inventory successfully'
    });
  } catch (error) {
    console.error('Add blood to inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update inventory
const updateInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const inventoryData = req.body;
    const userId = req.user.id;

    // Check if inventory exists and belongs to current user's hospital
    const [inventory] = await pool.execute(`
      SELECT bi.*, h.user_id as hospital_user_id
      FROM blood_inventory bi
      JOIN hospitals h ON bi.hospital_id = h.id
      WHERE bi.id = ?
    `, [inventoryId]);

    if (inventory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }

    if (inventory[0].hospital_user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update inventory
    const updateFields = [];
    const updateValues = [];

    Object.keys(inventoryData).forEach(key => {
      if (inventoryData[key] !== undefined && inventoryData[key] !== null) {
        updateFields.push(`${key} = ?`);
        updateValues.push(inventoryData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(inventoryId);

    await pool.execute(
      `UPDATE blood_inventory SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Inventory updated successfully'
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get hospital inventory
const getHospitalInventory = async (req, res) => {
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

    const [inventory] = await pool.execute(`
      SELECT * FROM blood_inventory 
      WHERE hospital_id = ?
      ORDER BY blood_group, created_at DESC
    `, [hospitalId]);

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Get hospital inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get inventory statistics
const getInventoryStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_entries,
        SUM(units_available) as total_units_available,
        SUM(units_used) as total_units_used,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_entries,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_entries,
        COUNT(CASE WHEN status = 'used' THEN 1 END) as used_entries
      FROM blood_inventory
    `);

    // Get inventory by blood group
    const [bloodGroupStats] = await pool.execute(`
      SELECT 
        blood_group,
        SUM(units_available) as total_available,
        SUM(units_used) as total_used,
        COUNT(*) as entries_count
      FROM blood_inventory 
      GROUP BY blood_group
      ORDER BY blood_group
    `);

    // Get expiring blood (within 7 days)
    const [expiringBlood] = await pool.execute(`
      SELECT bi.*, h.hospital_name
      FROM blood_inventory bi
      JOIN hospitals h ON bi.hospital_id = h.id
      WHERE bi.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      AND bi.status = 'available'
      ORDER BY bi.expiry_date ASC
    `);

    res.json({
      success: true,
      data: {
        overall: stats[0],
        byBloodGroup: bloodGroupStats,
        expiringBlood: expiringBlood
      }
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check blood availability
const checkBloodAvailability = async (req, res) => {
  try {
    const { bloodGroup, units } = req.query;

    if (!bloodGroup || !units) {
      return res.status(400).json({
        success: false,
        message: 'Blood group and units are required'
      });
    }

    const [availability] = await pool.execute(`
      SELECT 
        h.hospital_name,
        bi.units_available,
        bi.expiry_date,
        bi.id as inventory_id
      FROM blood_inventory bi
      JOIN hospitals h ON bi.hospital_id = h.id
      WHERE bi.blood_group = ? 
      AND bi.status = 'available' 
      AND bi.units_available >= ?
      AND (bi.expiry_date IS NULL OR bi.expiry_date > CURDATE())
      ORDER BY bi.expiry_date ASC
    `, [bloodGroup, units]);

    res.json({
      success: true,
      data: availability,
      available: availability.length > 0
    });
  } catch (error) {
    console.error('Check blood availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllInventory,
  getAvailableBlood,
  getBloodByGroup,
  addBloodToInventory,
  updateInventory,
  getHospitalInventory,
  getInventoryStats,
  checkBloodAvailability
};

// Consume (use) blood units from inventory for the authenticated hospital
// Decrements units_available and increments units_used atomically
const consumeInventoryUnits = async (req, res) => {
  try {
    const { blood_group, units } = req.body;
    const userId = req.user.id;

    if (!blood_group || !units || Number(units) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'blood_group and positive units are required'
      });
    }

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

    // Update inventory atomically ensuring sufficient units are available
    const [updateResult] = await pool.execute(
      `UPDATE blood_inventory 
       SET units_available = units_available - ?,
           units_used = units_used + ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE hospital_id = ?
         AND blood_group = ?
         AND status = 'available'
         AND units_available >= ?`,
      [units, units, hospitalId, blood_group, units]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient units or inventory not found for specified blood group'
      });
    }

    return res.json({
      success: true,
      message: 'Inventory updated successfully'
    });
  } catch (error) {
    console.error('Consume inventory units error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports.consumeInventoryUnits = consumeInventoryUnits;
