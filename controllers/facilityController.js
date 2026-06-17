const pool = require('../config/db');

const listFacilities = async (req, res) => {
  const [facilities] = await pool.query('SELECT * FROM health_facilities ORDER BY district, name');
  res.json({ facilities });
};

module.exports = { listFacilities };
