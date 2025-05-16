// backend/src/controllers/categoriesController.js
const pool = require('../db/pool');

exports.addCategory = async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid category name' });
  }
  // NOTE: we're not persisting to a dedicated table yet.
  return res.status(201).json({ message: 'Category added', category: name });
};

exports.getCategories = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT category
         FROM products
        WHERE category IS NOT NULL;`
    );
    const categories = rows.map(r => r.category);
    return res.json({ categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
};

// Delete a category (stub—not removing anything from DB)
exports.deleteCategory = (req, res) => {
  const { name } = req.params;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid category name' });
  }
  return res.json({ message: `Category '${name}' deleted` });
};