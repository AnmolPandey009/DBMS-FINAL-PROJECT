const { pool } = require('../config/database');

// Get all donations
const getAllDonations = async (req, res) => {
  try {
    const [donations] = await pool.execute(`
      SELECT bd.*, 
             d.first_name as donor_first_name, 
             d.last_name as donor_last_name,
             d.blood_group as donor_blood_group,
             h.hospital_name
      FROM blood_donations bd
      JOIN donors d ON bd.donor_id = d.id
      JOIN hospitals h ON bd.hospital_id = h.id
      ORDER BY bd.donation_date DESC
    `);

    res.json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get donation by ID
const getDonationById = async (req, res) => {
  try {
    const { donationId } = req.params;

    const [donations] = await pool.execute(`
      SELECT bd.*, 
             d.first_name as donor_first_name, 
             d.last_name as donor_last_name,
             d.blood_group as donor_blood_group,
             h.hospital_name
      FROM blood_donations bd
      JOIN donors d ON bd.donor_id = d.id
      JOIN hospitals h ON bd.hospital_id = h.id
      WHERE bd.id = ?
    `, [donationId]);

    if (donations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.json({
      success: true,
      data: donations[0]
    });
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get donations by donor
const getDonationsByDonor = async (req, res) => {
  try {
    const { donorId } = req.params;

    const [donations] = await pool.execute(`
      SELECT bd.*, h.hospital_name
      FROM blood_donations bd
      JOIN hospitals h ON bd.hospital_id = h.id
      WHERE bd.donor_id = ?
      ORDER BY bd.donation_date DESC
    `, [donorId]);

    res.json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('Get donations by donor error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create blood donation request (for donors)
const createDonationRequest = async (req, res) => {
  try {
    const donationData = req.body;
    const userId = req.user.id;

    // Get donor ID for current user
    const [donorData] = await pool.execute(
      'SELECT id FROM donors WHERE user_id = ?',
      [userId]
    );

    if (donorData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }

    const donorId = donorData[0].id;

    // Get all hospitals for the donor to choose from
    const [hospitals] = await pool.execute(
      'SELECT id FROM hospitals WHERE is_approved = true'
    );

    if (hospitals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No approved hospitals found'
      });
    }

    // For now, assign to the first available hospital
    // In a real system, you might want to let donors choose
    const hospitalId = hospitals[0].id;

    // Create donation request record
    const [result] = await pool.execute(`
      INSERT INTO blood_donations (
        donor_id, hospital_id, donation_date, blood_group, 
        units_donated, hemoglobin_level, blood_pressure, 
        temperature, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [
      donorId,
      hospitalId,
      donationData.donation_date,
      donationData.blood_group,
      donationData.units_donated,
      donationData.hemoglobin_level || null,
      donationData.blood_pressure || null,
      donationData.temperature || null,
      donationData.notes || null
    ]);

    const donationId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'Blood donation request submitted successfully',
      data: { id: donationId }
    });
  } catch (error) {
    console.error('Create donation request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create blood donation (for hospitals)
const createDonation = async (req, res) => {
  try {
    const donationData = req.body;
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

    // Create donation record
    const [result] = await pool.execute(`
      INSERT INTO blood_donations (
        donor_id, hospital_id, donation_date, blood_group, 
        units_donated, hemoglobin_level, blood_pressure, 
        temperature, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      donationData.donor_id,
      hospitalId,
      donationData.donation_date,
      donationData.blood_group,
      donationData.units_donated,
      donationData.hemoglobin_level || null,
      donationData.blood_pressure || null,
      donationData.temperature || null,
      donationData.notes || null
    ]);

    const donationId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'Blood donation recorded successfully',
      data: { id: donationId }
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update donation status
const updateDonationStatus = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Check if donation exists and belongs to current user's hospital
    const [donations] = await pool.execute(`
      SELECT bd.*, h.user_id as hospital_user_id
      FROM blood_donations bd
      JOIN hospitals h ON bd.hospital_id = h.id
      WHERE bd.id = ?
    `, [donationId]);

    if (donations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (donations[0].hospital_user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update donation status
    await pool.execute(
      'UPDATE blood_donations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, donationId]
    );

    res.json({
      success: true,
      message: 'Donation status updated successfully'
    });
  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update donation
const updateDonation = async (req, res) => {
  try {
    const { donationId } = req.params;
    const donationData = req.body;
    const userId = req.user.id;

    // Check if donation exists and belongs to current user's hospital
    const [donations] = await pool.execute(`
      SELECT bd.*, h.user_id as hospital_user_id
      FROM blood_donations bd
      JOIN hospitals h ON bd.hospital_id = h.id
      WHERE bd.id = ?
    `, [donationId]);

    if (donations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (donations[0].hospital_user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update donation
    const updateFields = [];
    const updateValues = [];

    Object.keys(donationData).forEach(key => {
      if (donationData[key] !== undefined && donationData[key] !== null) {
        updateFields.push(`${key} = ?`);
        updateValues.push(donationData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(donationId);

    await pool.execute(
      `UPDATE blood_donations SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Donation updated successfully'
    });
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get pending donations
const getPendingDonations = async (req, res) => {
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

    const [donations] = await pool.execute(`
      SELECT bd.*, 
             d.first_name as donor_first_name, 
             d.last_name as donor_last_name,
             d.blood_group as donor_blood_group
      FROM blood_donations bd
      JOIN donors d ON bd.donor_id = d.id
      WHERE bd.hospital_id = ? AND bd.status = 'pending'
      ORDER BY bd.donation_date DESC
    `, [hospitalId]);

    res.json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('Get pending donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get donation statistics
const getDonationStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_donations,
        SUM(units_donated) as total_units,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_donations,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_donations,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_donations
      FROM blood_donations
    `);

    // Get donations by blood group
    const [bloodGroupStats] = await pool.execute(`
      SELECT 
        blood_group,
        COUNT(*) as count,
        SUM(units_donated) as total_units
      FROM blood_donations 
      WHERE status = 'approved'
      GROUP BY blood_group
      ORDER BY blood_group
    `);

    res.json({
      success: true,
      data: {
        overall: stats[0],
        byBloodGroup: bloodGroupStats
      }
    });
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllDonations,
  getDonationById,
  getDonationsByDonor,
  createDonationRequest,
  createDonation,
  updateDonationStatus,
  updateDonation,
  getPendingDonations,
  getDonationStats
};
