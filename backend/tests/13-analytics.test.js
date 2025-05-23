const request = require('supertest');
const app = require('../src/server');

describe('Analytics API', () => {
    it('should get financial metrics as sales manager', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'sales.manager@test.com',
            password: 'Test@1234'
        });

        const res = await agent
            .get('/api/analytics/metrics')
            .query({ 
                startDate: '2025-01-01',
                endDate: '2025-12-31'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('totalRevenue');
        expect(res.body).toHaveProperty('totalOrders');
        expect(res.body).toHaveProperty('averageOrderValue');
    });

    it('should get chart data as sales manager', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'sales.manager@test.com',
            password: 'Test@1234'
        });

        const res = await agent
            .get('/api/analytics/chart-data')
            .query({
                startDate: '2025-01-01',
                endDate: '2025-12-31'
            });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data[0]).toHaveProperty('date');
        expect(res.body.data[0]).toHaveProperty('revenue');
    });

    it('should get inventory metrics as product manager', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'product.manager@test.com',
            password: 'Test@1234'
        });

        const res = await agent.get('/api/analytics/inventory');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('lowStockProducts');
        expect(res.body).toHaveProperty('outOfStockProducts');
        expect(res.body).toHaveProperty('totalProducts');
    });

    it('should deny analytics access for non-managers', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });

        const res = await agent.get('/api/analytics/metrics');
        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('error', 'Access denied. Only managers can view analytics.');
    });

    it('should validate date format for analytics queries', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'sales.manager@test.com',
            password: 'Test@1234'
        });

        const res = await agent
            .get('/api/analytics/metrics')
            .query({ 
                startDate: 'invalid-date',
                endDate: '2025-12-31'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Invalid date format. Use YYYY-MM-DD format');
    });
});
