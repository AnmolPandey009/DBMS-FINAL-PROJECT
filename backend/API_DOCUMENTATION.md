# Blood Bank Management System - API Documentation

## 🔐 Authentication Endpoints

### User Signup
**POST** `/api/users/signup`

Register a new user account (public endpoint).

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "staff"  // Optional: defaults to 'staff'
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "staff",
      "full_name": "John Doe",
      "phone": "+1234567890",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### User Login
**POST** `/api/users/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "username": "johndoe",  // or email
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "staff",
      "full_name": "John Doe",
      "phone": "+1234567890",
      "is_active": true,
      "last_login": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 👥 User Management

### Get All Users (Admin Only)
**GET** `/api/users?page=1&limit=10&role=staff&search=john`

**Headers:** `Authorization: Bearer <token>`

### Get User by ID
**GET** `/api/users/:id`

**Headers:** `Authorization: Bearer <token>`

### Create User (Admin Only)
**POST** `/api/users`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "staff",
  "full_name": "New User",
  "phone": "+1234567890"
}
```

### Update User (Admin Only)
**PUT** `/api/users/:id`

**Headers:** `Authorization: Bearer <token>`

### Change Password
**PUT** `/api/users/:id/change-password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Delete User (Admin Only)
**DELETE** `/api/users/:id`

**Headers:** `Authorization: Bearer <token>`

## 🩸 Donor Management

### Get All Donors
**GET** `/api/donors?page=1&limit=10&blood_group=A+&search=john`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `blood_group` - Filter by blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- `search` - Search in name, phone, or email

### Get Donor by ID
**GET** `/api/donors/:id`

### Create Donor
**POST** `/api/donors`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "blood_group": "A+",
  "age": 25,
  "gender": "Male",
  "address": "123 Main St, City, State"
}
```

### Update Donor
**PUT** `/api/donors/:id`

**Headers:** `Authorization: Bearer <token>`

### Delete Donor
**DELETE** `/api/donors/:id`

**Headers:** `Authorization: Bearer <token>`

### Get Donor Statistics
**GET** `/api/donors/stats`

## 🏥 Patient Management

### Get All Patients
**GET** `/api/patients?page=1&limit=10&blood_group=A+&status=Pending&search=john`

**Query Parameters:**
- `page`, `limit` - Pagination
- `blood_group` - Filter by blood group
- `status` - Filter by status (Pending, Approved, Rejected, Fulfilled)
- `search` - Search in name, phone, or email

### Get Patient by ID
**GET** `/api/patients/:id`

### Create Patient
**POST** `/api/patients`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "blood_group": "B+",
  "age": 30,
  "gender": "Female",
  "hospital_id": 1,
  "units_needed": 2,
  "urgency": "High"
}
```

### Update Patient
**PUT** `/api/patients/:id`

**Headers:** `Authorization: Bearer <token>`

### Delete Patient
**DELETE** `/api/patients/:id`

**Headers:** `Authorization: Bearer <token>`

### Get Patient Statistics
**GET** `/api/patients/stats`

## 🩸 Blood Inventory Management

### Get All Blood Inventory
**GET** `/api/blood-inventory?page=1&limit=10&blood_group=A+&status=Available`

**Query Parameters:**
- `page`, `limit` - Pagination
- `blood_group` - Filter by blood group
- `status` - Filter by status (Available, Reserved, Expired, Used)

### Get Blood Inventory by ID
**GET** `/api/blood-inventory/:id`

### Create Blood Inventory Entry
**POST** `/api/blood-inventory`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "blood_group": "A+",
  "units_available": 5,
  "expiry_date": "2024-02-15",
  "donation_id": 1,
  "status": "Available"
}
```

### Update Blood Inventory
**PUT** `/api/blood-inventory/:id`

**Headers:** `Authorization: Bearer <token>`

### Delete Blood Inventory
**DELETE** `/api/blood-inventory/:id`

**Headers:** `Authorization: Bearer <token>`

### Get Blood Inventory Statistics
**GET** `/api/blood-inventory/stats`

### Get Expiring Blood
**GET** `/api/blood-inventory/expiring?days=7`

## 🩸 Blood Donation Management

### Get All Blood Donations
**GET** `/api/blood-donations?page=1&limit=10&donor_id=1&blood_group=A+&status=Completed`

### Get Blood Donation by ID
**GET** `/api/blood-donations/:id`

### Record Blood Donation
**POST** `/api/blood-donations`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "donor_id": 1,
  "blood_group": "A+",
  "units": 1,
  "donate_date": "2024-01-01",
  "donation_type": "Whole Blood",
  "status": "Completed",
  "notes": "Successful donation"
}
```

### Update Blood Donation
**PUT** `/api/blood-donations/:id`

**Headers:** `Authorization: Bearer <token>`

### Delete Blood Donation
**DELETE** `/api/blood-donations/:id`

**Headers:** `Authorization: Bearer <token>`

### Get Blood Donation Statistics
**GET** `/api/blood-donations/stats`

## 🩸 Blood Request Management

### Get All Blood Requests
**GET** `/api/blood-requests?page=1&limit=10&patient_id=1&blood_group=A+&status=Pending`

### Get Blood Request by ID
**GET** `/api/blood-requests/:id`

### Create Blood Request
**POST** `/api/blood-requests`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "patient_id": 1,
  "blood_group": "A+",
  "units": 2,
  "urgency": "High",
  "required_by": "2024-01-15",
  "notes": "Emergency surgery"
}
```

### Update Blood Request
**PUT** `/api/blood-requests/:id`

**Headers:** `Authorization: Bearer <token>`

### Update Blood Request Status
**PUT** `/api/blood-requests/:id/status`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "Approved"  // Pending, Approved, Rejected, Fulfilled, Cancelled
}
```

### Delete Blood Request
**DELETE** `/api/blood-requests/:id`

**Headers:** `Authorization: Bearer <token>`

### Get Blood Request Statistics
**GET** `/api/blood-requests/stats`

## 🏥 Hospital Management

### Get All Hospitals
**GET** `/api/hospitals?page=1&limit=10&city=Mumbai&state=Maharashtra&search=general`

### Get Hospital by ID
**GET** `/api/hospitals/:id`

### Create Hospital
**POST** `/api/hospitals`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "City General Hospital",
  "address": "123 Main Street, Mumbai",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "phone": "022-12345678",
  "email": "info@citygeneral.com",
  "contact_person": "Dr. John Smith"
}
```

### Update Hospital
**PUT** `/api/hospitals/:id`

**Headers:** `Authorization: Bearer <token>`

### Delete Hospital
**DELETE** `/api/hospitals/:id`

**Headers:** `Authorization: Bearer <token>`

### Get Hospital Statistics
**GET** `/api/hospitals/stats`

### Get Hospitals by Location
**GET** `/api/hospitals/location?city=Mumbai&state=Maharashtra`

## 🩸 Blood Component Management

### Get All Blood Components
**GET** `/api/blood-components?page=1&limit=10&type=Red Blood Cells&blood_group=A+&status=Available`

### Get Blood Component by ID
**GET** `/api/blood-components/:id`

### Create Blood Component
**POST** `/api/blood-components`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "Red Blood Cells",
  "blood_group": "A+",
  "units": 2,
  "expiry_date": "2024-02-15",
  "donation_id": 1,
  "status": "Available"
}
```

### Update Blood Component
**PUT** `/api/blood-components/:id`

**Headers:** `Authorization: Bearer <token>`

### Delete Blood Component
**DELETE** `/api/blood-components/:id`

**Headers:** `Authorization: Bearer <token>`

### Get Blood Component Statistics
**GET** `/api/blood-components/stats`

### Get Expiring Blood Components
**GET** `/api/blood-components/expiring?days=7`

## 🩸 Blood Issue Management

### Get All Blood Issues
**GET** `/api/blood-issues?page=1&limit=10&patient_id=1&issued_by=1&status=Issued`

### Get Blood Issue by ID
**GET** `/api/blood-issues/:id`

### Create Blood Issue
**POST** `/api/blood-issues`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "patient_id": 1,
  "inventory_id": 1,  // OR component_id: 1 (not both)
  "units": 2,
  "issued_by": 1,
  "notes": "Issued for emergency surgery"
}
```

### Update Blood Issue
**PUT** `/api/blood-issues/:id`

**Headers:** `Authorization: Bearer <token>`

### Delete Blood Issue
**DELETE** `/api/blood-issues/:id`

**Headers:** `Authorization: Bearer <token>`

### Get Blood Issue Statistics
**GET** `/api/blood-issues/stats`

## 🔒 Authentication & Authorization

### JWT Token Usage
Include the JWT token in the Authorization header for protected endpoints:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **admin**: Full access to all operations
- **staff**: Can manage donors, patients, donations, requests
- **doctor**: Can manage patients and blood requests
- **nurse**: Limited access to patient information

### Token Expiration
Tokens expire after 7 days by default (configurable in `config.env`).

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🚀 Getting Started

1. **Start the server:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Test the API:**
   ```bash
   # Health check
   curl http://localhost:5000/health
   
   # Signup
   curl -X POST http://localhost:5000/api/users/signup \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"password123","full_name":"Test User"}'
   
   # Login
   curl -X POST http://localhost:5000/api/users/login \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"password123"}'
   ```

3. **Use the token for protected endpoints:**
   ```bash
   curl -H "Authorization: Bearer <your-token>" http://localhost:5000/api/donors
   ```

## 🔧 Configuration

Update `config.env` with your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blood_bank_db
DB_PORT=3306
PORT=5000
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5174
```

## 📝 Notes

- All timestamps are in ISO 8601 format
- Blood groups are validated against: A+, A-, B+, B-, AB+, AB-, O+, O-
- Gender options: Male, Female, Other
- User roles: admin, staff, doctor, nurse
- All endpoints support pagination with `page` and `limit` parameters
- Search functionality is available on most list endpoints
- Statistics endpoints provide aggregated data for analytics
