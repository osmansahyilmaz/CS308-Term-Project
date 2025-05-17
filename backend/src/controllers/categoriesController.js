// backend/src/controllers/categoriesController.js
const pool = require('../db/pool');

exports.addCategory = async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid category name' });
  }
  try {
    await pool.query(
      `INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;`,
      [name]
    );
    return res.status(201).json({ message: 'Category added', category: name });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT name FROM categories ORDER BY name;`
    );
    const categories = rows.map(r => r.name);
    return res.json({ categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
};

exports.deleteCategory = async (req, res) => {
  const { name } = req.params;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid category name' });
  }
  try {
    await pool.query(`DELETE FROM categories WHERE name = $1;`, [name]);
    return res.json({ message: `Category '${name}' deleted` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
};