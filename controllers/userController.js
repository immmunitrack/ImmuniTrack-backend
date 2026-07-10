const pool = require('../config/db');

const listUsers = async (req, res) => {
  const [users] = await pool.query(
    `SELECT id, full_name, phone, email, role, status, preferred_reminder_method, created_at
     FROM users
     ORDER BY created_at DESC`
  );
  res.json({ users });
};

const updateMe = async (req, res) => {
  const { full_name, phone, preferred_reminder_method } = req.body;
  if (!full_name || !phone) {
    return res.status(400).json({ message: 'Full name and phone are required' });
  }
  await pool.query(
    'UPDATE users SET full_name = $1, phone = $2, preferred_reminder_method = $3 WHERE id = $4',
    [full_name, phone, preferred_reminder_method || 'in_app', req.user.id]
  );
  res.json({ message: 'Profile updated' });
};

module.exports = { listUsers, updateMe };
