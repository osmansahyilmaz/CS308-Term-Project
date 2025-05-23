const request = require('supertest');
const app = require('../src/server');

describe('Categories API', () => {
    beforeEach(async () => {
        // Login as product manager for each test since they manage categories
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'product.manager@test.com',
            password: 'Test@1234'
        });
    });

    it('should add a new category', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'product.manager@test.com',
            password: 'Test@1234'
        });

        const res = await agent
            .post('/api/categories')
            .send({ name: 'Smart Home' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Category added');
        expect(res.body).toHaveProperty('category', 'Smart Home');
    });

    it('should get all categories', async () => {
        const res = await request(app).get('/api/categories');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('categories');
        expect(Array.isArray(res.body.categories)).toBe(true);
    });

    it('should delete a category', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'product.manager@test.com',
            password: 'Test@1234'
        });

        const res = await agent.delete('/api/categories/Smart Home');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Category deleted successfully');
    });

    it('should deny category deletion for non-product managers', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });

        const res = await agent.delete('/api/categories/Smart Home');
        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('error', 'Access denied. Only Product Managers can delete categories.');
    });

    it('should handle duplicate category names', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'product.manager@test.com',
            password: 'Test@1234'
        });

        // Add first category
        await agent
            .post('/api/categories')
            .send({ name: 'Electronics' });

        // Try to add duplicate
        const res = await agent
            .post('/api/categories')
            .send({ name: 'Electronics' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Category already exists');
    });
});
