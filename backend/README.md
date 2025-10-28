# Blood Bank Management System - Backend API

A comprehensive Node.js/Express backend API for managing blood bank operations including donor registration, blood donations, inventory management, and blood requests.

## 🚀 Features

- **User Management**: Registration and authentication for donors, patients, hospitals, and admins
- **Blood Donation Workflow**: Complete donation process from registration to approval
- **Inventory Management**: Real-time blood inventory tracking with expiry dates
- **Blood Request System**: Patient blood requests with approval workflow
- **Blood Issue Tracking**: Record blood transactions and update inventory
- **Admin Dashboard**: Comprehensive statistics and system management
- **Role-based Access Control**: Secure API endpoints based on user roles

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Blood_Bank_3/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=blood_bank_db
   DB_PORT=3306
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Database Setup**
   ```bash
   # Create database and run schema
   mysql -u root -p < database/schema.sql
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🗄️ Database Schema

The system uses the following main tables:

- **users**: Base user authentication
- **donors**: Donor profile information
- **patients**: Patient profile information
- **hospitals**: Hospital registration and approval
- **blood_donations**: Blood donation records
- **blood_inventory**: Blood stock management
- **blood_requests**: Patient blood requests
- **blood_issues**: Blood transaction records

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Donors
- `GET /api/donors` - Get all donors
- `GET /api/donors/profile` - Get donor profile
- `POST /api/donors` - Create donor profile
- `PUT /api/donors/:id` - Update donor profile
- `GET /api/donors/blood/:bloodGroup` - Get donors by blood group

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/profile` - Get patient profile
- `POST /api/patients` - Create patient profile
- `PUT /api/patients/:id` - Update patient profile

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/profile` - Get hospital profile
- `POST /api/hospitals` - Create hospital profile
- `PUT /api/hospitals/:id/approve` - Approve hospital (admin only)

### Blood Donations
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Record blood donation
- `PUT /api/donations/:id/status` - Update donation status
- `GET /api/donations/hospital/pending` - Get pending donations

### Blood Inventory
- `GET /api/inventory` - Get all inventory
- `GET /api/inventory/available` - Get available blood
- `POST /api/inventory` - Add blood to inventory
- `GET /api/inventory/:bloodGroup` - Get blood by group

### Blood Requests
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create blood request
- `PUT /api/requests/:id/status` - Update request status
- `GET /api/requests/hospital/pending` - Get pending requests

### Blood Issues
- `GET /api/issues` - Get all issues
- `POST /api/issues` - Record blood issue
- `GET /api/issues/hospital/issues` - Get hospital issues

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/dashboard-stats` - Get dashboard statistics
- `GET /api/admin/pending-hospitals` - Get pending hospitals
- `PUT /api/admin/deactivate-user/:id` - Deactivate user

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🎯 User Roles

- **donor**: Can register as donor, view donation history
- **patient**: Can register as patient, create blood requests
- **hospital**: Can manage donations, inventory, and approve requests
- **admin**: Can manage all users and view system statistics

## 📊 Workflow

### Blood Donation Flow
1. Donor registers → Creates user and donor records
2. Donor donates blood → Creates blood_donation record (pending)
3. Hospital approves → Updates donation status to approved
4. System updates inventory → Adds blood to blood_inventory

### Blood Request Flow
1. Patient requests blood → Creates blood_request record (pending)
2. Hospital approves → Updates request status to approved
3. Blood issued → Creates blood_issue record
4. Inventory updated → Decrements blood_inventory units

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation with Joi
- SQL injection protection with parameterized queries

## 🧪 Testing

```bash
# Run tests
npm test

# Test specific endpoint
curl -X GET http://localhost:5000/health
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_USER` | Database username | root |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | blood_bank_db |
| `DB_PORT` | Database port | 3306 |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | JWT expiration | 7d |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `FRONTEND_URL` | Frontend URL | http://localhost:5173 |

## 🚀 Deployment

1. **Production Environment Setup**
   ```bash
   NODE_ENV=production npm start
   ```

2. **Docker Deployment** (Optional)
   ```bash
   docker build -t blood-bank-api .
   docker run -p 5000:5000 blood-bank-api
   ```

## 📈 Monitoring

- Health check endpoint: `GET /health`
- Database connection monitoring
- Error logging and handling
- Request rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the database schema

---

**Note**: Make sure to update the database credentials and JWT secret in production environment.
