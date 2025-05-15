// backend/src/routes/categoriesRoutes.js
const express = require('express');
const {
  addCategory,
  getCategories,
  deleteCategory
} = require('../controllers/categoriesController');

const router = express.Router();

router.post('/',          addCategory);
router.get('/',           getCategories);
router.delete('/:name',   deleteCategory);

module.exports = router;
