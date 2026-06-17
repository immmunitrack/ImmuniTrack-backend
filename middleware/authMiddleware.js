const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// protect verifies the JWT, loads the current user, and attaches that user to req.user.
// Protected controllers can then trust req.user instead of accepting a user id from the client.
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    // Expected header format: Authorization: Bearer <token>
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    // Decode the token and then fetch a fresh user record.
    // This makes deactivated users lose access even if their old token has not expired yet.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await pool.query(
      'SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );

    if (!users.length) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Inactive users are blocked globally.
    if (users[0].status !== 'active') {
      return res.status(403).json({ message: 'User account is inactive' });
    }

    // Downstream middleware/controllers use this object for authorization and ownership checks.
    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { protect };
