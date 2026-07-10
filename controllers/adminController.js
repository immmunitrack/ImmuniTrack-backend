const pool = require('../config/db');

const stats = async (req, res) => {
  const [[children]] = await pool.query('SELECT COUNT(*) AS total FROM children');
  const [[missed]] = await pool.query("SELECT COUNT(*) AS total FROM child_immunisations WHERE status = 'missed'");
  const [[upcoming]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM child_immunisations
     WHERE status IN ('upcoming', 'pending') AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`
  );
  const [[completedMonth]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM child_immunisations
     WHERE status = 'completed'
       AND date_trunc('month', date_received) = date_trunc('month', CURRENT_DATE)`
  );
  const [[fullyImmunised]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM children c
     WHERE NOT EXISTS (
       SELECT 1 FROM child_immunisations ci
       JOIN immunisation_schedule s ON s.id = ci.schedule_id
       WHERE ci.child_id = c.id AND s.is_required = TRUE AND ci.status <> 'completed'
     )`
  );

  res.json({
    stats: {
      total_children: Number(children.total),
      fully_immunised: Number(fullyImmunised.total),
      missed_vaccines: Number(missed.total),
      upcoming_this_week: Number(upcoming.total),
      completed_this_month: Number(completedMonth.total)
    }
  });
};

const users = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, full_name, phone, email, role, status, preferred_reminder_method, created_at
     FROM users
     ORDER BY created_at DESC`
  );
  res.json({ users: rows });
};

const children = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.*, u.full_name AS caregiver_name, u.phone AS caregiver_phone, hf.name AS health_facility_name
     FROM children c
     JOIN users u ON u.id = c.caregiver_id
     LEFT JOIN health_facilities hf ON hf.id = c.health_facility_id
     ORDER BY c.created_at DESC`
  );
  res.json({ children: rows });
};

const dueThisWeek = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT ci.*, c.full_name AS child_name, c.district, u.full_name AS caregiver_name, u.phone AS caregiver_phone,
            s.vaccine_name, s.recommended_age_label
     FROM child_immunisations ci
     JOIN children c ON c.id = ci.child_id
     JOIN users u ON u.id = c.caregiver_id
     JOIN immunisation_schedule s ON s.id = ci.schedule_id
     WHERE ci.status <> 'completed' AND ci.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
     ORDER BY ci.due_date ASC`
  );
  res.json({ immunisations: rows });
};

const missedImmunisations = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT ci.*, c.full_name AS child_name, c.district, u.full_name AS caregiver_name, u.phone AS caregiver_phone,
            s.vaccine_name, s.recommended_age_label
     FROM child_immunisations ci
     JOIN children c ON c.id = ci.child_id
     JOIN users u ON u.id = c.caregiver_id
     JOIN immunisation_schedule s ON s.id = ci.schedule_id
     WHERE ci.status = 'missed'
     ORDER BY ci.due_date ASC`
  );
  res.json({ immunisations: rows });
};

module.exports = { stats, users, children, dueThisWeek, missedImmunisations };
