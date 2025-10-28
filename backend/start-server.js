const { testConnection, initializeDatabase } = require('./config/database');

async function startServer() {
  console.log('🚀 Starting Blood Bank Backend Server...');
  
  try {
    // Test database connection
    console.log('📊 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Database connection failed!');
      console.error('Please check your MySQL service and credentials in config.env');
      process.exit(1);
    }
    
    console.log('✅ Database connected successfully');
    
    // Initialize database
    console.log('🗄️ Initializing database...');
    const dbInitialized = await initializeDatabase();
    
    if (!dbInitialized) {
      console.error('❌ Database initialization failed!');
      process.exit(1);
    }
    
    console.log('✅ Database initialized successfully');
    
    // Start the server
    console.log('🌐 Starting Express server...');
    require('./server.js');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Please check your configuration and try again.');
    process.exit(1);
  }
}

startServer();
