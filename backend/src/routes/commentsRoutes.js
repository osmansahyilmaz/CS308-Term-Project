const express = require('express');
const commentsController = require('../controllers/commentsController');

const router = express.Router();

// create, get, update, delete ...
router.post('/comments', commentsController.createComment);
router.get('/comments', commentsController.getAllComments);
router.get('/comments/:id', commentsController.getCommentById);
router.put('/comments/:id', commentsController.updateComment);
router.delete('/comments/:id', commentsController.deleteComment);

// 🆕 Approve endpoint
router.put('/comments/:id/approve', commentsController.approveComment);

module.exports = router;
