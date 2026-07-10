const pool = require('../config/db');
const { generateReminders } = require('../services/reminderService');

const myReminders = async (req, res) => {
  await generateReminders(req.user.id);
  const [reminders] = await pool.query(
    `SELECT r.*, c.full_name AS child_name, s.vaccine_name, ci.due_date
     FROM reminders r
     JOIN children c ON c.id = r.child_id
     JOIN child_immunisations ci ON ci.id = r.child_immunisation_id
     JOIN immunisation_schedule s ON s.id = ci.schedule_id
     WHERE r.caregiver_id = $1
     ORDER BY (r.status = 'unread') DESC, r.reminder_date DESC`,
    [req.user.id]
  );
  res.json({ reminders });
};

const markRead = async (req, res) => {
  const params = req.user.role === 'caregiver' ? [req.params.id, req.user.id] : [req.params.id];
  const caregiverClause = req.user.role === 'caregiver' ? 'AND caregiver_id = $2' : '';
  await pool.query(`UPDATE reminders SET status = 'read' WHERE id = $1 ${caregiverClause}`, params);
  res.json({ message: 'Reminder marked as read' });
};

const generate = async (req, res) => {
  const result = await generateReminders(req.user.role === 'caregiver' ? req.user.id : null);
  res.json({ message: 'Reminders generated', ...result });
};

module.exports = { myReminders, markRead, generate };
