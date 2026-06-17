const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const publicUserFields = (user) => ({
  id: user.id,
  full_name: user.full_name,
  phone: user.phone,
  email: user.email,
  role: user.role,
  status: user.status,
  preferred_reminder_method: user.preferred_reminder_method || 'in_app',
  created_at: user.created_at,
  updated_at: user.updated_at
});

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'change-this-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

const register = async (req, res) => {
  const { full_name, phone, email, password, preferred_reminder_method } = req.body;

  if (!full_name || !phone || !email || !password) {
    return res.status(400).json({ message: 'Full name, phone, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1', [email, phone]);
    if (existing.length) {
      return res.status(409).json({ message: 'Email or phone is already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (full_name, phone, email, password, role, status, preferred_reminder_method)
       VALUES (?, ?, ?, ?, 'caregiver', 'active', ?)`,
      [full_name, phone, email, hash, preferred_reminder_method || 'in_app']
    );

    const [users] = await pool.query(
      `SELECT id, full_name, phone, email, role, status, preferred_reminder_method, created_at, updated_at
       FROM users
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({ user: publicUserFields(users[0]), token: signToken(users[0]) });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'User account is inactive' });
    }

    res.json({ user: publicUserFields(user), token: signToken(user) });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const me = async (req, res) => {
  res.json({ user: publicUserFields(req.user) });
};

module.exports = { register, login, me };
