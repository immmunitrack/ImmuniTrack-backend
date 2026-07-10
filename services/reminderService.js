const pool = require('../config/db');

const dateOnly = (value) => new Date(value).toISOString().slice(0, 10);

const addDays = (value, days) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return dateOnly(date);
};

const buildReminder = (event, type) => {
  const due = dateOnly(event.due_date);
  if (type === 'seven_day') {
    return {
      reminder_date: addDays(due, -7),
      message: `${event.child_name} is due for ${event.vaccine_name} on ${due}.`
    };
  }
  if (type === 'one_day') {
    return {
      reminder_date: addDays(due, -1),
      message: `${event.child_name} is due for ${event.vaccine_name} tomorrow, ${due}.`
    };
  }
  return {
    reminder_date: dateOnly(new Date()),
    message: `${event.child_name} missed ${event.vaccine_name}, due on ${due}. Please contact your health facility.`
  };
};

const generateReminders = async (caregiverId = null) => {
  const params = [];
  let caregiverClause = '';
  if (caregiverId) {
    caregiverClause = 'AND c.caregiver_id = $1';
    params.push(caregiverId);
  }

  const [events] = await pool.query(
    `SELECT ci.id AS child_immunisation_id, ci.child_id, ci.due_date, ci.status,
            c.caregiver_id, c.full_name AS child_name, s.vaccine_name
     FROM child_immunisations ci
     JOIN children c ON c.id = ci.child_id
     JOIN immunisation_schedule s ON s.id = ci.schedule_id
     WHERE ci.status <> 'completed' ${caregiverClause}`,
    params
  );

  const today = dateOnly(new Date());
  let created = 0;

  for (const event of events) {
    const due = dateOnly(event.due_date);
    const types = [];
    if (addDays(due, -7) <= today) types.push('seven_day');
    if (addDays(due, -1) <= today) types.push('one_day');
    if (due < today) types.push('overdue');

    for (const type of types) {
      const reminder = buildReminder(event, type);
      const [result] = await pool.query(
        `INSERT INTO reminders
          (child_id, caregiver_id, child_immunisation_id, reminder_type, message, reminder_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'unread')
         ON CONFLICT (child_immunisation_id, reminder_type) DO NOTHING`,
        [
          event.child_id,
          event.caregiver_id,
          event.child_immunisation_id,
          type,
          reminder.message,
          reminder.reminder_date
        ]
      );
      created += result.affectedRows;
    }
  }

  return { created };
};

module.exports = { generateReminders };
