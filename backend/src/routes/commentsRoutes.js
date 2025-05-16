const express = require('express');
const commentsController = require('../controllers/commentsController');

const router = express.Router();

// create, get, update, delete ...
router.post('/comments', commentsController.createComment);
router.get('/comments', commentsController.getAllComments);
router.get('/comments/:id', commentsController.getCommentById);
router.put('/comments/:id', commentsController.updateComment);
router.delete('/comments/:id', commentsController.deleteComment);

// Admin routes for managing comments
router.get('/comments/admin/all', commentsController.getAllCommentsAdmin);
router.put('/comments/:id/approve', commentsController.approveComment);
router.put('/comments/:id/disapprove', commentsController.disapproveComment);

module.exports = router;
