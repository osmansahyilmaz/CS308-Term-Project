const request = require('supertest');
const app = require('../src/server');

describe('Comments API', () => {
    const mockComment = {
        comment_text: "This is a test comment"
    };

    beforeEach(async () => {
        // Clear mocks and reset state before each test
    });

    describe('POST /api/comments', () => {
        it('should create a new comment when authenticated', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({
                email: 'customer@test.com',
                password: 'Test@1234'
            });

            const res = await agent
                .post('/api/comments')
                .send(mockComment);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message', 'Comment added successfully');
        });

        it('should deny comment creation for unauthenticated users', async () => {
            const res = await request(app)
                .post('/api/comments')
                .send(mockComment);

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Not authenticated');
        });
    });

    describe('GET /api/comments', () => {
        it('should get all comments', async () => {
            const res = await request(app).get('/api/comments');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should get specific comment by id', async () => {
            const res = await request(app).get('/api/comments/1');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('comment_id');
            expect(res.body).toHaveProperty('comment_text');
            expect(res.body).toHaveProperty('user_id');
        });
    });

    describe('PUT /api/comments/:id', () => {
        it('should update user\'s own comment', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({
                email: 'customer@test.com',
                password: 'Test@1234'
            });

            const res = await agent
                .put('/api/comments/1')
                .send({
                    comment_text: "Updated comment text"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Comment updated successfully');
        });

        it('should deny update of other user\'s comments', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({
                email: 'customer@test.com',
                password: 'Test@1234'
            });

            const res = await agent
                .put('/api/comments/999') // Comment belonging to another user
                .send({
                    comment_text: "Trying to update someone else's comment"
                });

            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('error', 'You can only update your own comments');
        });
    });

    describe('DELETE /api/comments/:id', () => {
        it('should delete user\'s own comment', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({
                email: 'customer@test.com',
                password: 'Test@1234'
            });

            const res = await agent.delete('/api/comments/1');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Comment deleted successfully');
        });

        it('should allow admin to delete any comment', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({
                email: 'admin@admin.com',
                password: 'admin'
            });

            const res = await agent.delete('/api/comments/1');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Comment deleted successfully');
        });

        it('should deny deletion of other user\'s comments', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({
                email: 'customer@test.com',
                password: 'Test@1234'
            });

            const res = await agent.delete('/api/comments/999'); // Comment belonging to another user
            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('error', 'You can only delete your own comments');
        });
    });

    describe('Admin Routes', () => {
        it('should allow admin to get all comments', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({
                email: 'admin@admin.com',
                password: 'admin'
            });

            const res = await agent.get('/api/comments/admin/all');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should deny access to admin routes for non-admins', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({
                email: 'customer@test.com',
                password: 'Test@1234'
            });

            const res = await agent.get('/api/comments/admin/all');
            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('error', 'Access denied. Admin only.');
        });
    });
});
