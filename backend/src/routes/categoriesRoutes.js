// backend/src/routes/categoriesRoutes.js
const express = require('express');
const router = express.Router();
const { addCategory, getCategories } = require('../controllers/categoriesController');

router.post('/', addCategory);
router.get('/', getCategories);

module.exports = router;
