const { pool } = require('../config/database');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT u.*, 
             d.first_name, d.last_name, d.blood_group,
             p.first_name as patient_first_name, p.last_name as patient_last_name, p.blood_group as patient_blood_group,
             h.hospital_name, h.is_approved
      FROM users u
      LEFT JOIN donors d ON u.id = d.user_id
      LEFT JOIN patients p ON u.id = p.user_id
      LEFT JOIN hospitals h ON u.id = h.user_id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get pending hospitals
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

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get user statistics
    const [userStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'donor' THEN 1 END) as total_donors,
        COUNT(CASE WHEN role = 'patient' THEN 1 END) as total_patients,
        COUNT(CASE WHEN role = 'hospital' THEN 1 END) as total_hospitals,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users
      FROM users
    `);

    // Get donation statistics
    const [donationStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_donations,
        SUM(units_donated) as total_units_donated,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_donations,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_donations,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_donations
      FROM blood_donations
    `);

    // Get request statistics
    const [requestStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(units_requested) as total_units_requested,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
        COUNT(CASE WHEN status = 'fulfilled' THEN 1 END) as fulfilled_requests
      FROM blood_requests
    `);

    // Get inventory statistics
    const [inventoryStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_inventory_entries,
        SUM(units_available) as total_units_available,
        SUM(units_used) as total_units_used,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_entries,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_entries,
        COUNT(CASE WHEN status = 'used' THEN 1 END) as used_entries
      FROM blood_inventory
    `);

    // Get issue statistics
    const [issueStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_issues,
        SUM(units_issued) as total_units_issued,
        COUNT(DISTINCT request_id) as unique_requests_fulfilled
      FROM blood_issues
    `);

    // Get recent activity (last 7 days)
    const [recentActivity] = await pool.execute(`
      SELECT 
        'donation' as type,
        COUNT(*) as count,
        'Blood donations' as description
      FROM blood_donations 
      WHERE donation_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 
        'request' as type,
        COUNT(*) as count,
        'Blood requests' as description
      FROM blood_requests 
      WHERE requested_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 
        'issue' as type,
        COUNT(*) as count,
        'Blood issues' as description
      FROM blood_issues 
      WHERE issue_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `);

    res.json({
      success: true,
      data: {
        users: userStats[0],
        donations: donationStats[0],
        requests: requestStats[0],
        inventory: inventoryStats[0],
        issues: issueStats[0],
        recentActivity: recentActivity
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Deactivate user
const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, is_active FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (users[0].is_active === false) {
      return res.status(400).json({
        success: false,
        message: 'User is already deactivated'
      });
    }

    // Deactivate user
    await pool.execute(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Activate user
const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, is_active FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (users[0].is_active === true) {
      return res.status(400).json({
        success: false,
        message: 'User is already activated'
      });
    }

    // Activate user
    await pool.execute(
      'UPDATE users SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get system logs
const getSystemLogs = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    // Get recent donations
    const [donations] = await pool.execute(`
      SELECT 
        'donation' as type,
        bd.id,
        bd.donation_date as date,
        d.first_name,
        d.last_name,
        bd.blood_group,
        bd.units_donated as units,
        bd.status,
        h.hospital_name
      FROM blood_donations bd
      JOIN donors d ON bd.donor_id = d.id
      JOIN hospitals h ON bd.hospital_id = h.id
      ORDER BY bd.donation_date DESC
      LIMIT ?
      OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    // Get recent requests
    const [requests] = await pool.execute(`
      SELECT 
        'request' as type,
        br.id,
        br.requested_at as date,
        p.first_name,
        p.last_name,
        br.blood_group,
        br.units_requested as units,
        br.status,
        h.hospital_name
      FROM blood_requests br
      JOIN patients p ON br.patient_id = p.id
      JOIN hospitals h ON br.hospital_id = h.id
      ORDER BY br.requested_at DESC
      LIMIT ?
      OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    // Get recent issues
    const [issues] = await pool.execute(`
      SELECT 
        'issue' as type,
        bi.id,
        bi.issue_date as date,
        p.first_name,
        p.last_name,
        bi.blood_group,
        bi.units_issued as units,
        'issued' as status,
        h.hospital_name
      FROM blood_issues bi
      JOIN blood_requests br ON bi.request_id = br.id
      JOIN patients p ON br.patient_id = p.id
      JOIN hospitals h ON bi.hospital_id = h.id
      ORDER BY bi.issue_date DESC
      LIMIT ?
      OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    // Combine and sort all activities
    const allActivities = [...donations, ...requests, ...issues]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: allActivities
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get blood group statistics
const getBloodGroupStats = async (req, res) => {
  try {
    // Get donations by blood group
    const [donationStats] = await pool.execute(`
      SELECT 
        blood_group,
        COUNT(*) as donation_count,
        SUM(units_donated) as total_units_donated
      FROM blood_donations 
      WHERE status = 'approved'
      GROUP BY blood_group
      ORDER BY blood_group
    `);

    // Get requests by blood group
    const [requestStats] = await pool.execute(`
      SELECT 
        blood_group,
        COUNT(*) as request_count,
        SUM(units_requested) as total_units_requested
      FROM blood_requests 
      GROUP BY blood_group
      ORDER BY blood_group
    `);

    // Get inventory by blood group
    const [inventoryStats] = await pool.execute(`
      SELECT 
        blood_group,
        SUM(units_available) as total_units_available,
        SUM(units_used) as total_units_used
      FROM blood_inventory 
      GROUP BY blood_group
      ORDER BY blood_group
    `);

    res.json({
      success: true,
      data: {
        donations: donationStats,
        requests: requestStats,
        inventory: inventoryStats
      }
    });
  } catch (error) {
    console.error('Get blood group stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllUsers,
  getPendingHospitals,
  getDashboardStats,
  deactivateUser,
  activateUser,
  getSystemLogs,
  getBloodGroupStats
};
