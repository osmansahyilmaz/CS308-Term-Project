const request = require('supertest');
const app = require('../src/server');

describe('Wishlist API', () => {
    beforeEach(async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });
    });

    it('should add item to wishlist', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });

        const res = await agent
            .post('/api/wishlist/add')
            .send({ productId: 1 });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Product added to wishlist');
    });

    it('should remove item from wishlist', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });

        const res = await agent.delete('/api/wishlist/remove/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Product removed from wishlist');
    });

    it('should get user wishlist', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });

        const res = await agent.get('/api/wishlist');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should deny wishlist access for unauthenticated users', async () => {
        const res = await request(app).get('/api/wishlist');
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Not authenticated');
    });
});
