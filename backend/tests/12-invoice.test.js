const request = require('supertest');
const app = require('../src/server');

describe('Invoice API', () => {
    beforeEach(async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });
    });

    it('should get all invoices as sales manager', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'sales.manager@test.com',
            password: 'Test@1234'
        });

        const res = await agent.get('/api/invoices');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get specific invoice by id', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });

        const res = await agent.get('/api/invoices/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('invoice_id');
        expect(res.body).toHaveProperty('invoice_pdf_url');
    });

    it('should get invoice by order id', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });

        const res = await agent.get('/api/invoices/order/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('invoice_id');
        expect(res.body).toHaveProperty('invoice_pdf_url');
    });

    it('should deny invoice access for other users invoices', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });

        const res = await agent.get('/api/invoices/999'); // Invoice belonging to another user
        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('error', 'Access denied. You can only view your own invoices.');
    });

    it('should send invoice email', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });

        const res = await agent.post('/api/invoices/1/send-email');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Invoice sent successfully');
    });
});
