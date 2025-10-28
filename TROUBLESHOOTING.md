# Blood Bank System - Troubleshooting Guide

## 🚨 "Failed to Fetch" Error Solutions

### **Step 1: Check Backend Server Status**

1. **Open a new terminal/command prompt**
2. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

3. **Install dependencies (if not done):**
   ```bash
   npm install
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

5. **Verify server is running:**
   - You should see: `🚀 Blood Bank API server running on port 5000`
   - Open browser and go to: `http://localhost:5000/health`
   - Should show: `{"success":true,"message":"Blood Bank API is running"}`

### **Step 2: Database Setup**

1. **Make sure MySQL is running**
2. **Create database:**
   ```sql
   CREATE DATABASE blood_bank_db;
   ```

3. **Run database setup:**
   ```bash
   cd backend
   node setup-database.js
   ```

### **Step 3: Check Configuration**

1. **Verify `config.env` file:**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=@Abhishek2005@
   DB_NAME=blood_bank_db
   DB_PORT=3306
   PORT=5000
   JWT_SECRET=Abhishek
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5174
   ```

### **Step 4: Test API Endpoints**

1. **Test health endpoint:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Test signup endpoint:**
   ```bash
   curl -X POST http://localhost:5000/api/users/signup \
     -H "Content-Type: application/json" \
     -d '{"username":"test","email":"test@example.com","password":"password123","full_name":"Test User"}'
   ```

### **Step 5: Frontend Configuration**

1. **Check if frontend is running:**
   ```bash
   cd "Frontend_Project/Blood Bank"
   npm run dev
   ```

2. **Open browser console (F12) and check for errors**

3. **Verify API calls in Network tab**

## 🔧 Common Issues & Solutions

### **Issue 1: "Failed to fetch" Error**
**Cause:** Backend server not running
**Solution:** Start backend server with `npm run dev`

### **Issue 2: "Database connection failed"**
**Cause:** MySQL not running or wrong credentials
**Solution:** 
- Start MySQL service
- Check `config.env` credentials
- Run `node setup-database.js`

### **Issue 3: "CORS error"**
**Cause:** Frontend URL not allowed
**Solution:** Check `FRONTEND_URL` in `config.env`

### **Issue 4: "Port already in use"**
**Cause:** Another service using port 5000
**Solution:** 
- Kill process: `netstat -ano | findstr :5000`
- Or change port in `config.env`

### **Issue 5: "Validation failed"**
**Cause:** Invalid form data
**Solution:** Check form validation rules in backend

## 🚀 Quick Start Commands

### **Backend Setup:**
```bash
cd backend
npm install
node setup-database.js
npm run dev
```

### **Frontend Setup:**
```bash
cd "Frontend_Project/Blood Bank"
npm install
npm run dev
```

### **Test Everything:**
1. Backend: `http://localhost:5000/health`
2. Frontend: `http://localhost:5174`
3. Signup: `http://localhost:5174/signup`

## 📋 Verification Checklist

- [ ] MySQL is running
- [ ] Backend server is running on port 5000
- [ ] Database `blood_bank_db` exists
- [ ] All tables are created
- [ ] Frontend is running on port 5174
- [ ] No CORS errors in browser console
- [ ] API calls are successful in Network tab

## 🆘 Still Having Issues?

1. **Check browser console for errors**
2. **Check backend terminal for errors**
3. **Verify all ports are free**
4. **Check firewall settings**
5. **Try different browsers**

## 📞 Debug Information

When reporting issues, include:
- Operating System
- Node.js version
- MySQL version
- Browser console errors
- Backend terminal output
- Network tab errors
