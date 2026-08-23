const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./app');

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Alakar Auto Parts API Server running on port ${PORT}`);
  console.log(`📍 West Main Street, Old GH road, Pudukkottai (Surendar - 8526613000)`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🚗 Connected directly to Supabase PostgreSQL`);
  console.log(`💳 Razorpay Checkout integration ready`);
  console.log(`=======================================================`);
});

// Direct Supabase Live Mode Active: 2026-08-23
module.exports = server;
