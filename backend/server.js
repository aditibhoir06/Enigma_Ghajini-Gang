import app from './src/app.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 SachivJi Backend Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 API URL: http://localhost:${PORT}/api
💾 Database: SQLite (${process.env.DATABASE_PATH || './database/sachivji.db'})

Available endpoints:
• Health Check: GET /api/health
• User Signup: POST /api/auth/signup
• User Login: POST /api/auth/login
• User Profile: GET /api/auth/me
• User Logout: POST /api/auth/logout
  `);
});