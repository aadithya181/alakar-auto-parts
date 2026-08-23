function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Administrative privileges required to access this resource.',
    });
  }
  next();
}

module.exports = { requireAdmin };
