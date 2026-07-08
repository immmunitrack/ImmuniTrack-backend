const pool = require('../config/db');
const { ensureChildImmunisations } = require('../services/immunisationCalculator');
const { generateReminders } = require('../services/reminderService');

const canAccessChild = async (user, childId) => {
  if (user.role === 'admin' || user.role === 'health_worker') return true;
  const [rows] = await pool.query('SELECT id FROM children WHERE id = ? AND caregiver_id = ? LIMIT 1', [childId, user.id]);
  return rows.length > 0;
};

const selectChildren = `
  SELECT c.*, hf.name AS health_facility_name
  FROM children c
  LEFT JOIN health_facilities hf ON hf.id = c.health_facility_id
`;

const createChild = async (req, res) => {
  const {
    full_name,
    date_of_birth,
    gender,
    district,
    subcounty,
    health_facility_id,
    immunisation_card_number,
    birth_place
  } = req.body;

  if (!full_name || !date_of_birth || !gender || !district) {
    return res.status(400).json({ message: 'Full name, date of birth, gender, and district are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      `INSERT INTO children
       (caregiver_id, full_name, date_of_birth, gender, district, subcounty, health_facility_id, immunisation_card_number, birth_place)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        full_name,
        date_of_birth,
        gender,
        district,
        subcounty || null,
        health_facility_id || null,
        immunisation_card_number || null,
        birth_place || null
      ]
    );
    await ensureChildImmunisations(result.insertId, connection);
    await connection.commit();
    await generateReminders(req.user.id);
    res.status(201).json({ message: 'Child registered', id: result.insertId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Could not register child', error: error.message });
  } finally {
    connection.release();
  }
};

const myChildren = async (req, res) => {
  const [children] = await pool.query(`${selectChildren} WHERE c.caregiver_id = ? ORDER BY c.full_name`, [req.user.id]);
  res.json({ children });
};

const getChild = async (req, res) => {
  if (!(await canAccessChild(req.user, req.params.id))) {
    return res.status(404).json({ message: 'Child not found' });
  }
  const [children] = await pool.query(`${selectChildren} WHERE c.id = ? LIMIT 1`, [req.params.id]);
  res.json({ child: children[0] });
};

const updateChild = async (req, res) => {
  if (!(await canAccessChild(req.user, req.params.id))) {
    return res.status(404).json({ message: 'Child not found' });
  }

  const {
    full_name,
    date_of_birth,
    gender,
    district,
    subcounty,
    health_facility_id,
    immunisation_card_number,
    birth_place
  } = req.body;

  if (!full_name || !date_of_birth || !gender || !district) {
    return res.status(400).json({ message: 'Full name, date of birth, gender, and district are required' });
  }

  await pool.query(
    `UPDATE children
     SET full_name = ?, date_of_birth = ?, gender = ?, district = ?, subcounty = ?, health_facility_id = ?,
         immunisation_card_number = ?, birth_place = ?
     WHERE id = ?`,
    [
      full_name,
      date_of_birth,
      gender,
      district,
      subcounty || null,
      health_facility_id || null,
      immunisation_card_number || null,
      birth_place || null,
      req.params.id
    ]
  );
  await ensureChildImmunisations(req.params.id);
  res.json({ message: 'Child updated' });
};

const deleteChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    await child.deleteOne();

    res.status(200).json({ message: 'Child deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete child', error: error.message });
  }
};
module.exports = { createChild, myChildren, getChild, updateChild, deleteChild, canAccessChild };
