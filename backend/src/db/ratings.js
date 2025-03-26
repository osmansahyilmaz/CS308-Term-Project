// File: backend/src/db/ratings.js

const pool = require('./pool');

// Create a new rating
const createRating = async (userId, ratingValue) => {
    const query = `
        INSERT INTO ratings (user_id, rating_value)
        VALUES ($1, $2)
        RETURNING rating_id, user_id, rating_value, created_at;
    `;
    return pool.query(query, [userId, ratingValue]);
};

// Get all ratings
const getAllRatings = async () => {
    const query = `SELECT * FROM ratings ORDER BY rating_id DESC;`;
    return pool.query(query);
};

// Get a specific rating by ID
const getRatingById = async (ratingId) => {
    const query = `SELECT * FROM ratings WHERE rating_id = $1;`;
    return pool.query(query, [ratingId]);
};

// Update a rating
const updateRating = async (ratingId, newRating) => {
    const query = `
        UPDATE ratings
        SET rating_value = $1
        WHERE rating_id = $2
        RETURNING rating_id, user_id, rating_value, created_at;
    `;
    return pool.query(query, [newRating, ratingId]);
};

// Delete a rating
const deleteRating = async (ratingId) => {
    const query = `DELETE FROM ratings WHERE rating_id = $1;`;
    return pool.query(query, [ratingId]);
};

module.exports = {
    createRating,
    getAllRatings,
    getRatingById,
    updateRating,
    deleteRating
};