const pool = require('../config/db');

const toDateOnly = (value) => {
  const date = new Date(value);
  return date.toISOString().slice(0, 10);
};

const addDays = (dateValue, days) => {
  const date = new Date(dateValue);
  date.setDate(date.getDate() + Number(days || 0));
  return toDateOnly(date);
};

const derivedStatus = (event) => {
  if (event.status === 'completed') return 'completed';
  const today = new Date(toDateOnly(new Date()));
  const due = new Date(toDateOnly(event.due_date));
  const inSevenDays = new Date(today);
  inSevenDays.setDate(inSevenDays.getDate() + 7);

  if (due < today) return 'missed';
  if (due <= inSevenDays) return 'upcoming';
  return 'pending';
};

const syncEventStatuses = async (childId, connection = pool) => {
  const [events] = await connection.query(
    `SELECT id, status, due_date
     FROM child_immunisations
     WHERE child_id = ? AND status <> 'completed'`,
    [childId]
  );

  await Promise.all(
    events.map((event) => {
      const status = derivedStatus(event);
      if (status === event.status) return null;
      return connection.query('UPDATE child_immunisations SET status = ? WHERE id = ?', [status, event.id]);
    })
  );
};

const ensureChildImmunisations = async (childId, connection = pool) => {
  const [children] = await connection.query('SELECT id, date_of_birth FROM children WHERE id = ? LIMIT 1', [childId]);
  if (!children.length) return;

  const [schedule] = await connection.query(
    'SELECT id, due_offset_days FROM immunisation_schedule WHERE is_active = 1 ORDER BY due_offset_days, dose_number, id'
  );

  await Promise.all(
    schedule.map((item) =>
      connection.query(
        `INSERT INTO child_immunisations (child_id, schedule_id, due_date, status)
         VALUES (?, ?, ?, 'pending')
         ON DUPLICATE KEY UPDATE
           due_date = IF(status = 'completed', due_date, VALUES(due_date)),
           status = IF(status = 'completed', status, 'pending')`,
        [childId, item.id, addDays(children[0].date_of_birth, item.due_offset_days)]
      )
    )
  );

  await syncEventStatuses(childId, connection);
};

module.exports = { addDays, derivedStatus, ensureChildImmunisations, syncEventStatuses };
