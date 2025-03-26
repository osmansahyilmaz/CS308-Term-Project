// File: backend/src/routes/ratingsRoutes.js

const express = require('express');
const ratingsController = require('../controllers/ratingsController');

const router = express.Router();

router.post('/ratings', ratingsController.createRating);
router.get('/ratings', ratingsController.getAllRatings);
router.get('/ratings/:id', ratingsController.getRatingById);
router.put('/ratings/:id', ratingsController.updateRating);
router.delete('/ratings/:id', ratingsController.deleteRating);

module.exports = router;
