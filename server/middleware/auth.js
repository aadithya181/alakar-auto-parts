const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_torqspares_jwt_key_98327498234';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }

    // Attach fresh user info from DB or fallback to token payload
    const dbUser = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(user.id);
    req.user = dbUser || {
      id: user.id,
      name: user.name || (user.role === 'admin' ? 'Surendar (Admin)' : 'Customer'),
      email: user.email,
      phone: user.phone || '',
      role: user.role || (user.email && user.email.includes('admin') ? 'admin' : 'customer')
    };
    next();
  });
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) {
      const dbUser = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(user.id);
      req.user = dbUser || null;
    } else {
      req.user = null;
    }
    next();
  });
}

module.exports = { authenticateToken, optionalAuth, JWT_SECRET };
