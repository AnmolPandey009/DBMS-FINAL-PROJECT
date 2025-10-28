const Joi = require('joi');

// User registration validation
const validateUserRegistration = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('donor', 'patient', 'hospital', 'Donor', 'Patient', 'Hospital').required(),
    name: Joi.string().min(2).max(100).optional(),
    age: Joi.number().min(1).max(120).optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other', 'male', 'female', 'other').optional(),
    blood_group: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
    contact: Joi.string().min(10).max(20).optional(),
    address: Joi.string().min(5).max(500).optional(),
    city: Joi.string().min(2).max(100).optional(),
    state: Joi.string().min(2).max(100).optional(),
    pincode: Joi.string().min(6).max(10).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  // Normalize role to lowercase
  if (req.body.role) {
    req.body.role = req.body.role.toLowerCase();
  }
  
  // Normalize gender to lowercase
  if (req.body.gender) {
    req.body.gender = req.body.gender.toLowerCase();
  }
  
  next();
};

// Login validation
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Donor registration validation
const validateDonorRegistration = (req, res, next) => {
  const schema = Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    date_of_birth: Joi.date().max('now').required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    blood_group: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(20).required(),
    address: Joi.string().min(10).max(500).required(),
    emergency_contact: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(20).optional(),
    medical_history: Joi.string().max(1000).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Patient registration validation
const validatePatientRegistration = (req, res, next) => {
  const schema = Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    date_of_birth: Joi.date().max('now').required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    blood_group: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(20).required(),
    address: Joi.string().min(10).max(500).required(),
    emergency_contact: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(20).optional(),
    medical_history: Joi.string().max(1000).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Hospital registration validation
const validateHospitalRegistration = (req, res, next) => {
  const schema = Joi.object({
    hospital_name: Joi.string().min(2).max(100).required(),
    license_number: Joi.string().min(5).max(50).required(),
    address: Joi.string().min(10).max(500).required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(20).required(),
    email: Joi.string().email().optional(),
    contact_person: Joi.string().min(2).max(100).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Blood donation validation
const validateBloodDonation = (req, res, next) => {
  const schema = Joi.object({
    donor_id: Joi.number().integer().positive().required(),
    donation_date: Joi.date().max('now').required(),
    blood_group: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
    units_donated: Joi.number().positive().max(2).required(),
    hemoglobin_level: Joi.number().positive().max(20).optional(),
    blood_pressure: Joi.string().max(20).optional(),
    temperature: Joi.number().min(35).max(42).optional(),
    notes: Joi.string().max(500).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Blood request validation
const validateBloodRequest = (req, res, next) => {
  const schema = Joi.object({
    // patient_id: Joi.number().integer().positive().required(),
    blood_group: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
    units_requested: Joi.number().positive().max(10).required(),
    urgency: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
    reason: Joi.string().min(10).max(500).required(),
    doctor_name: Joi.string().min(2).max(100).optional(),
    doctor_contact: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(20).optional(),
    notes: Joi.string().max(500).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Blood issue validation
const validateBloodIssue = (req, res, next) => {
  const schema = Joi.object({
    request_id: Joi.number().integer().positive().required(),
    blood_group: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
    units_issued: Joi.number().positive().max(10).required(),
    issued_to: Joi.string().min(2).max(100).required(),
    issued_by: Joi.string().min(2).max(100).required(),
    notes: Joi.string().max(500).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateUserRegistration,
  validateLogin,
  validateDonorRegistration,
  validatePatientRegistration,
  validateHospitalRegistration,
  validateBloodDonation,
  validateBloodRequest,
  validateBloodIssue
};
