const pool = require('../config/db');

async function migrate() {
  try {
    console.log('Running 2FA database migration...');
    
    // Check if columns already exist
    const [columns] = await pool.query('SHOW COLUMNS FROM users');
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('two_factor_secret')) {
      await pool.query('ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255) NULL');
      console.log('Added two_factor_secret column.');
    } else {
      console.log('two_factor_secret column already exists.');
    }
    
    if (!columnNames.includes('two_factor_temp_secret')) {
      await pool.query('ALTER TABLE users ADD COLUMN two_factor_temp_secret VARCHAR(255) NULL');
      console.log('Added two_factor_temp_secret column.');
    } else {
      console.log('two_factor_temp_secret column already exists.');
    }

    if (!columnNames.includes('two_factor_enabled')) {
      await pool.query('ALTER TABLE users ADD COLUMN two_factor_enabled TINYINT(1) DEFAULT 0');
      console.log('Added two_factor_enabled column.');
    } else {
      console.log('two_factor_enabled column already exists.');
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
