// File: backend/src/controllers/commentsController.js

const commentsDb = require('../db/commentsDb');

const createComment = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userId = req.session.user.id;
        const { comment_text } = req.body;
        if (!comment_text) {
            return res.status(400).json({ error: 'Comment text is required' });
        }
        const result = await commentsDb.createComment(userId, comment_text);
        res.status(201).json({ message: 'Comment created successfully', comment: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create comment', details: err.message });
    }
};

const getAllComments = async (req, res) => {
    try {
        // Sadece approved yorumları döndürmek için
        const result = await commentsDb.getAllApprovedComments();
        res.status(200).json({ comments: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch comments', details: err.message });
    }
};

const getCommentById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await commentsDb.getCommentById(id);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.status(200).json({ comment: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch comment', details: err.message });
    }
};

const updateComment = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { id } = req.params;
        const { comment_text } = req.body;
        if (!comment_text) {
            return res.status(400).json({ error: 'Comment text is required' });
        }
        const result = await commentsDb.updateComment(id, comment_text);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.status(200).json({ message: 'Comment updated successfully', comment: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update comment', details: err.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { id } = req.params;
        const existing = await commentsDb.getCommentById(id);
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        await commentsDb.deleteComment(id);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete comment', details: err.message });
    }
};

const approveComment = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        // Sadece Product Manager (role_id = 2) yorumları onaylayabilsin
        if (req.session.user.role_id !== 2) {
            return res.status(403).json({ error: 'Forbidden: Only Product Manager can approve comments' });
        }
        const { id } = req.params;
        const existing = await commentsDb.getCommentById(id);
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        const result = await commentsDb.approveComment(id);
        res.status(200).json({ message: 'Comment approved', comment: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to approve comment', details: err.message });
    }
};

module.exports = {
    createComment,
    getAllComments,
    getCommentById,
    updateComment,
    deleteComment,
    approveComment
};
