const pool = require('../index'); // Burada '../index' ifadesi, db bağlantı dosyana göre değişebilir.

const createPasswordsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS passwords (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('Passwords table created successfully.');
  } catch (err) {
    console.error('Error creating passwords table:', err);
  } finally {
    pool.end();
  }
};

createPasswordsTable();
