const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🚀 Setting up Blood Bank Database...');
    
    // Connect to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Create database
    const dbName = process.env.DB_NAME || 'blood_bank_db';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' created/verified`);
    
    // Use the database
    await connection.execute(`USE ${dbName}`);
    console.log(`✅ Using database '${dbName}'`);
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.warn(`⚠️  Warning: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Database schema executed successfully');
    
    // Verify tables were created
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Created ${tables.length} tables:`, tables.map(t => Object.values(t)[0]));
    
    // Check if admin user exists
    const [adminUsers] = await connection.execute(
      'SELECT id, email FROM users WHERE role = "admin"'
    );
    
    if (adminUsers.length === 0) {
      console.log('⚠️  No admin user found. Please create one manually.');
    } else {
      console.log('✅ Admin user found:', adminUsers[0].email);
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('📋 Next steps:');
    console.log('1. Update your .env file with correct database credentials');
    console.log('2. Start the server with: npm run dev');
    console.log('3. Test the API at: http://localhost:5000/health');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
