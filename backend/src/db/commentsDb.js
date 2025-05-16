// File: backend/src/db/commentsDb.js
const pool = require('./pool');

// Create a new comment
const createComment = async (userId, commentText) => {
    const query = `
        INSERT INTO comments (user_id, comment_text)
        VALUES ($1, $2)
        RETURNING comment_id, user_id, comment_text, is_approved, created_at;
    `;
    return pool.query(query, [userId, commentText]);
};


// Get ALL comments (regardless of approval) - optional
const getAllComments = async () => {
    const query = `SELECT * FROM comments ORDER BY comment_id DESC;`;
    return pool.query(query);
};

// Get ONLY approved comments
const getAllApprovedComments = async () => {
    const query = `
        SELECT * FROM comments
        WHERE is_approved = true
        ORDER BY comment_id DESC;
    `;
    return pool.query(query);
};

// Get a specific comment by ID
const getCommentById = async (commentId) => {
    const query = `SELECT * FROM comments WHERE comment_id = $1;`;
    return pool.query(query, [commentId]);
};

// Update a comment
const updateComment = async (commentId, newText) => {
    const query = `
        UPDATE comments
        SET comment_text = $1
        WHERE comment_id = $2
        RETURNING comment_id, user_id, comment_text, created_at;
    `;
    return pool.query(query, [newText, commentId]);
};

// Delete a comment
const deleteComment = async (commentId) => {
    const query = `DELETE FROM comments WHERE comment_id = $1;`;
    return pool.query(query, [commentId]);
};

// Approve a comment
const approveComment = async (commentId) => {
    const query = `
        UPDATE comments
        SET is_approved = true
        WHERE comment_id = $1
        RETURNING comment_id, user_id, comment_text, is_approved, created_at;
    `;
    return pool.query(query, [commentId]);
};

// Disapprove a comment
const disapproveComment = async (commentId) => {
    const query = `
        UPDATE comments
        SET is_approved = false
        WHERE comment_id = $1
        RETURNING comment_id, user_id, comment_text, is_approved, created_at;
    `;
    return pool.query(query, [commentId]);
};

module.exports = {
    createComment,
    getAllComments,
    getAllApprovedComments,
    getCommentById,
    updateComment,
    deleteComment,
    approveComment,
    disapproveComment
};
