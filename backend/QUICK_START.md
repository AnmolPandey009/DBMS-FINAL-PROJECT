# 🚀 Blood Bank System - Quick Start Guide

## **Step 1: Create Database Manually**

1. **Open MySQL Command Line or MySQL Workbench**
2. **Run this command:**
   ```sql
   CREATE DATABASE blood_bank_db;
   ```

## **Step 2: Start Backend Server**

1. **Open Command Prompt/Terminal**
2. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

5. **You should see:**
   ```
   🚀 Blood Bank API server running on port 5000
   📊 Health check: http://localhost:5000/health
   ```

## **Step 3: Test Backend**

1. **Open browser and go to:** `http://localhost:5000/health`
2. **Should show:** `{"success":true,"message":"Blood Bank API is running"}`

## **Step 4: Start Frontend**

1. **Open another Command Prompt/Terminal**
2. **Navigate to frontend:**
   ```bash
   cd "Frontend_Project/Blood Bank"
   ```

3. **Start frontend:**
   ```bash
   npm run dev
   ```

4. **Open browser:** `http://localhost:5174`

## **Step 5: Test Signup**

1. **Go to:** `http://localhost:5174/signup`
2. **Fill the form with any role (staff, doctor, nurse)**
3. **Click "Create Account"**

## **🔧 If Still Getting "Failed to Fetch":**

### **Check 1: Backend Running?**
- Open: `http://localhost:5000/health`
- Should show JSON response

### **Check 2: Database Connection?**
- Make sure MySQL is running
- Database `blood_bank_db` exists

### **Check 3: Ports Free?**
- Port 5000 (backend)
- Port 5174 (frontend)

### **Check 4: Browser Console**
- Press F12
- Check Console tab for errors
- Check Network tab for failed requests

## **🆘 Common Solutions:**

1. **"Failed to fetch"** → Backend not running
2. **"Database connection failed"** → MySQL not running
3. **"CORS error"** → Check config.env
4. **"Port in use"** → Kill process using port 5000

## **📞 Need Help?**

1. Check browser console (F12)
2. Check backend terminal for errors
3. Verify all services are running
4. Try different browser
