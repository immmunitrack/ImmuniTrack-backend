const pool = require('../config/db');
const { canAccessChild } = require('./childController');
const { ensureChildImmunisations, syncEventStatuses } = require('../services/immunisationCalculator');
const { generateReminders } = require('../services/reminderService');

const eventSelect = `
  SELECT ci.*, s.vaccine_name, s.description, s.recommended_age_label, s.dose_number, s.is_required,
         c.full_name AS child_name, hf.name AS health_facility_name
  FROM child_immunisations ci
  JOIN immunisation_schedule s ON s.id = ci.schedule_id
  JOIN children c ON c.id = ci.child_id
  LEFT JOIN health_facilities hf ON hf.id = ci.health_facility_id
`;

const getChildImmunisations = async (req, res) => {
  const childId = req.params.childId;
  if (!(await canAccessChild(req.user, childId))) {
    return res.status(404).json({ message: 'Child not found' });
  }
  await ensureChildImmunisations(childId);
  await generateReminders(req.user.role === 'caregiver' ? req.user.id : null);
  const [events] = await pool.query(`${eventSelect} WHERE ci.child_id = $1 ORDER BY ci.due_date, s.dose_number`, [childId]);
  res.json({ immunisations: events });
};

const completeImmunisation = async (req, res) => {
  const [rows] = await pool.query('SELECT child_id FROM child_immunisations WHERE id = $1 LIMIT 1', [req.params.id]);
  if (!rows.length || !(await canAccessChild(req.user, rows[0].child_id))) {
    return res.status(404).json({ message: 'Immunisation not found' });
  }

  const { date_received, health_facility_id, notes } = req.body;
  await pool.query(
    `UPDATE child_immunisations
     SET status = 'completed', date_received = $1, health_facility_id = $2, notes = $3
     WHERE id = $4`,
    [date_received || new Date(), health_facility_id || null, notes || null, req.params.id]
  );
  res.json({ message: 'Immunisation marked as completed' });
};

const markMissed = async (req, res) => {
  const [rows] = await pool.query('SELECT child_id FROM child_immunisations WHERE id = $1 LIMIT 1', [req.params.id]);
  if (!rows.length || !(await canAccessChild(req.user, rows[0].child_id))) {
    return res.status(404).json({ message: 'Immunisation not found' });
  }
  await pool.query("UPDATE child_immunisations SET status = 'missed', notes = $1 WHERE id = $2", [
    req.body.notes || null,
    req.params.id
  ]);
  await generateReminders(req.user.role === 'caregiver' ? req.user.id : null);
  res.json({ message: 'Immunisation marked as missed' });
};

const getByStatus = async (req, res, status) => {
  const caregiverClause = req.user.role === 'caregiver' ? 'AND c.caregiver_id = $2' : '';
  const params = req.user.role === 'caregiver' ? [req.user.id] : [];
  if (req.user.role === 'caregiver') {
    const [children] = await pool.query('SELECT id FROM children WHERE caregiver_id = $1', [req.user.id]);
    await Promise.all(children.map((child) => syncEventStatuses(child.id)));
  }
  const [events] = await pool.query(
    `${eventSelect}
     WHERE ci.status = $1 ${caregiverClause}
     ORDER BY ci.due_date ASC`,
    [status, ...params]
  );
  res.json({ immunisations: events });
};

module.exports = {
  getChildImmunisations,
  completeImmunisation,
  markMissed,
  upcoming: (req, res) => getByStatus(req, res, 'upcoming'),
  missed: (req, res) => getByStatus(req, res, 'missed')
};
