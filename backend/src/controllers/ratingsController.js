// File: backend/src/controllers/ratingsController.js

const ratingsDb = require('../db/ratings');

const createRating = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userId = req.session.user.id;
        const { rating } = req.body; // rating_value -> rating

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating value must be between 1 and 5' });
        }

        const result = await ratingsDb.createRating(userId, rating);
        res.status(201).json({ message: 'Rating submitted', rating: result.rows[0] });

    } catch (err) {
        res.status(500).json({ error: 'Failed to create rating', details: err.message });
    }
};

const getAllRatings = async (req, res) => {
    try {
        const result = await ratingsDb.getAllRatings();
        res.status(200).json({ ratings: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch ratings', details: err.message });
    }
};

const getRatingById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ratingsDb.getRatingById(id);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rating not found' });
        }
        res.status(200).json({ rating: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch rating', details: err.message });
    }
};

const updateRating = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { id } = req.params;
        const { rating } = req.body; // rating_value -> rating

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating value must be between 1 and 5' });
        }

        const result = await ratingsDb.updateRating(id, rating);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rating not found' });
        }
        res.status(200).json({ message: 'Rating updated', rating: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update rating', details: err.message });
    }
};

const deleteRating = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { id } = req.params;
        const existing = await ratingsDb.getRatingById(id);
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Rating not found' });
        }

        await ratingsDb.deleteRating(id);
        res.status(200).json({ message: 'Rating deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete rating', details: err.message });
    }
};

module.exports = {
    createRating,
    getAllRatings,
    getRatingById,
    updateRating,
    deleteRating
};
