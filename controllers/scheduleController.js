const pool = require('../config/db');

const listSchedule = async (req, res) => {
  const [schedule] = await pool.query(
    'SELECT * FROM immunisation_schedule ORDER BY due_offset_days, dose_number, vaccine_name'
  );
  res.json({ schedule });
};

const createScheduleItem = async (req, res) => {
  const { vaccine_name, description, recommended_age_label, due_offset_days, dose_number, is_required } = req.body;
  if (!vaccine_name || !recommended_age_label || due_offset_days === undefined) {
    return res.status(400).json({ message: 'Vaccine name, recommended age, and due offset days are required' });
  }

  const [result] = await pool.query(
    `INSERT INTO immunisation_schedule
     (vaccine_name, description, recommended_age_label, due_offset_days, dose_number, is_required, is_active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [
      vaccine_name,
      description || null,
      recommended_age_label,
      Number(due_offset_days),
      dose_number || 1,
      is_required === false ? 0 : 1
    ]
  );
  res.status(201).json({ message: 'Schedule item added', id: result.insertId });
};

const updateScheduleItem = async (req, res) => {
  const { vaccine_name, description, recommended_age_label, due_offset_days, dose_number, is_required } = req.body;
  if (!vaccine_name || !recommended_age_label || due_offset_days === undefined) {
    return res.status(400).json({ message: 'Vaccine name, recommended age, and due offset days are required' });
  }

  await pool.query(
    `UPDATE immunisation_schedule
     SET vaccine_name = ?, description = ?, recommended_age_label = ?, due_offset_days = ?, dose_number = ?, is_required = ?
     WHERE id = ?`,
    [
      vaccine_name,
      description || null,
      recommended_age_label,
      Number(due_offset_days),
      dose_number || 1,
      is_required === false ? 0 : 1,
      req.params.id
    ]
  );
  res.json({ message: 'Schedule item updated' });
};

const updateStatus = async (req, res) => {
  await pool.query('UPDATE immunisation_schedule SET is_active = ? WHERE id = ?', [req.body.is_active ? 1 : 0, req.params.id]);
  res.json({ message: 'Schedule status updated' });
};

const deleteScheduleItem = async (req, res) => {
  await pool.query('DELETE FROM immunisation_schedule WHERE id = ?', [req.params.id]);
  res.json({ message: 'Schedule item deleted' });
};

module.exports = { listSchedule, createScheduleItem, updateScheduleItem, updateStatus, deleteScheduleItem };
