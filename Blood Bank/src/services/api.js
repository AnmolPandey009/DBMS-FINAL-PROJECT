// API Service Layer for Blood Bank Management System
const API_BASE_URL = 'http://localhost:5000/api'

class ApiService {
  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // Authentication APIs
  async signup(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    return response.json()
  }

  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    return response.json()
  }

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Donor APIs
  async getAllDonors() {
    const response = await fetch(`${API_BASE_URL}/donors`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getDonorById(donorId) {
    const response = await fetch(`${API_BASE_URL}/donors/${donorId}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getDonorsByBloodGroup(bloodGroup) {
    const response = await fetch(`${API_BASE_URL}/donors/blood/${bloodGroup}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getDonorProfile() {
    const response = await fetch(`${API_BASE_URL}/donors/profile`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async updateDonor(donorId, donorData) {
    const response = await fetch(`${API_BASE_URL}/donors/${donorId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(donorData)
    })
    return response.json()
  }

  async createDonor(donorData) {
    const response = await fetch(`${API_BASE_URL}/donors`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(donorData)
    })
    return response.json()
  }

  async deleteDonor(donorId) {
    const response = await fetch(`${API_BASE_URL}/donors/${donorId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Patient APIs
  async getAllPatients() {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getPatientById(patientId) {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getPatientProfile() {
    const response = await fetch(`${API_BASE_URL}/patients/profile`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async updatePatient(patientId, patientData) {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(patientData)
    })
    return response.json()
  }

  async deletePatient(patientId) {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Hospital APIs
  async getAllHospitals() {
    const response = await fetch(`${API_BASE_URL}/hospitals`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getHospitalById(hospitalId) {
    const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getHospitalProfile() {
    const response = await fetch(`${API_BASE_URL}/hospitals/profile`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async updateHospital(hospitalId, hospitalData) {
    const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(hospitalData)
    })
    return response.json()
  }

  async approveHospital(hospitalId) {
    const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/approve`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async deleteHospital(hospitalId) {
    const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Blood Inventory APIs
  async getAllInventory() {
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getAvailableBlood() {
    const response = await fetch(`${API_BASE_URL}/inventory/available`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getBloodByGroup(bloodGroup) {
    const response = await fetch(`${API_BASE_URL}/inventory/${bloodGroup}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async addBloodToInventory(bloodData) {
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bloodData)
    })
    return response.json()
  }

  // Blood Request APIs
  async getAllRequests() {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getRequestById(requestId) {
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getRequestsByPatient(patientId) {
    const response = await fetch(`${API_BASE_URL}/requests/patient/${patientId}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getRequestsByStatus(status) {
    const response = await fetch(`${API_BASE_URL}/requests/status/${status}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async createRequest(requestData) {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestData)
    })
    return response.json()
  }

  async updateRequestStatus(requestId, status) {
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    })
    return response.json()
  }

  async deleteRequest(requestId) {
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Blood Donation APIs
  async getAllDonations() {
    const response = await fetch(`${API_BASE_URL}/donations`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getDonationById(donationId) {
    const response = await fetch(`${API_BASE_URL}/donations/${donationId}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getDonationsByDonor(donorId) {
    const response = await fetch(`${API_BASE_URL}/donations/donor/${donorId}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async createDonationRequest(donationData) {
    const response = await fetch(`${API_BASE_URL}/donations/request`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(donationData)
    })
    return response.json()
  }

  async createDonation(donationData) {
    const response = await fetch(`${API_BASE_URL}/donations`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(donationData)
    })
    return response.json()
  }

  async updateDonation(donationId, donationData) {
    const response = await fetch(`${API_BASE_URL}/donations/${donationId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(donationData)
    })
    return response.json()
  }

  // Blood Issue APIs
  async getAllIssues() {
    const response = await fetch(`${API_BASE_URL}/issues`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getIssueById(issueId) {
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getIssuesByRequest(requestId) {
    const response = await fetch(`${API_BASE_URL}/issues/request/${requestId}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getHospitalIssues() {
    const response = await fetch(`${API_BASE_URL}/issues/hospital/issues`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async createIssue(issueData) {
    const response = await fetch(`${API_BASE_URL}/issues`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(issueData)
    })
    return response.json()
  }

  // Admin APIs
  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getPendingHospitals() {
    const response = await fetch(`${API_BASE_URL}/admin/pending-hospitals`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async deactivateUser(userId) {
    const response = await fetch(`${API_BASE_URL}/admin/deactivate-user/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }
}

// Create and export a singleton instance
const apiService = new ApiService()
export default apiService
