const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { generateSecret, verifyTOTP } = require('../services/totp');

const publicUserFields = (user) => ({
  id: user.id,
  full_name: user.full_name,
  phone: user.phone,
  email: user.email,
  role: user.role,
  status: user.status,
  preferred_reminder_method: user.preferred_reminder_method || 'in_app',
  two_factor_enabled: !!user.two_factor_enabled,
  created_at: user.created_at,
  updated_at: user.updated_at
});

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'change-this-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

const register = async (req, res) => {
  const { full_name, phone, email, password, preferred_reminder_method, role } = req.body;

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
    const userRole = (role === 'health_worker' || role === 'caregiver') ? role : 'caregiver';

    const [result] = await pool.query(
      `INSERT INTO users (full_name, phone, email, password, role, status, preferred_reminder_method)
       VALUES (?, ?, ?, ?, ?, 'active', ?)`,
      [full_name, phone, email, hash, userRole, preferred_reminder_method || 'in_app']
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

    // Intercept login if 2FA is enabled
    if (user.two_factor_enabled) {
      return res.json({ two_factor_required: true, userId: user.id });
    }

    res.json({ user: publicUserFields(user), token: signToken(user) });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const login2FA = async (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) {
    return res.status(400).json({ message: 'User ID and verification code are required' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = users[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.two_factor_enabled || !user.two_factor_secret) {
      return res.status(400).json({ message: 'Two-factor authentication is not enabled for this user' });
    }

    const verified = verifyTOTP(code, user.two_factor_secret);
    if (!verified) {
      return res.status(401).json({ message: 'Invalid 2FA code' });
    }

    res.json({ user: publicUserFields(user), token: signToken(user) });
  } catch (error) {
    res.status(500).json({ message: '2FA verification failed', error: error.message });
  }
};

const setup2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await pool.query('SELECT email FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = users[0];

    const secret = generateSecret();
    await pool.query('UPDATE users SET two_factor_temp_secret = ? WHERE id = ?', [secret, userId]);

    const otpauthUrl = `otpauth://totp/ImmuniTrack:${user.email}?secret=${secret}&issuer=ImmuniTrack`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;

    res.json({
      secret,
      qrCodeUrl
    });
  } catch (error) {
    res.status(500).json({ message: '2FA setup failed', error: error.message });
  }
};

const verify2FA = async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: 'Verification code is required' });
  }

  try {
    const userId = req.user.id;
    const [users] = await pool.query('SELECT two_factor_temp_secret FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = users[0];

    if (!user || !user.two_factor_temp_secret) {
      return res.status(400).json({ message: '2FA setup was not initiated' });
    }

    const verified = verifyTOTP(code, user.two_factor_temp_secret);
    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
    }

    await pool.query(
      'UPDATE users SET two_factor_secret = two_factor_temp_secret, two_factor_temp_secret = NULL, two_factor_enabled = 1 WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Two-factor authentication enabled successfully' });
  } catch (error) {
    res.status(500).json({ message: '2FA verification failed', error: error.message });
  }
};

const disable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query(
      'UPDATE users SET two_factor_secret = NULL, two_factor_temp_secret = NULL, two_factor_enabled = 0 WHERE id = ?',
      [userId]
    );
    res.json({ message: 'Two-factor authentication disabled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Disabling 2FA failed', error: error.message });
  }
};

const me = async (req, res) => {
  res.json({ user: publicUserFields(req.user) });
};

module.exports = { register, login, me, login2FA, setup2FA, verify2FA, disable2FA };
