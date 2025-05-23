const request = require('supertest');
const app = require('../src/server');

describe('Orders API', () => {
    const mockOrder = {
        products: [
            {
                productId: 1,
                quantity: 2,
                priceWhenBuy: 199.99,
                discountWhenBuy: 15
            }
        ],
        shippingAddress: {
            address_id: 1
        },
        paymentMethod: 'credit_card',
        cardDetails: {
            number: '4111111111111111',
            expiry: '12/25',
            cvv: '123',
            name: 'John Doe'
        }
    };

    beforeEach(async () => {
        // Login a test user before each test
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });
    });

    it('should create a new order', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });

        const res = await agent
            .post('/api/orders')
            .send(mockOrder);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('order_id');
        expect(res.body).toHaveProperty('message', 'Order created successfully');
    });

    it('should get user orders', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });

        const res = await agent.get('/api/orders');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.orders)).toBe(true);
    });

    it('should get order details by id', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });

        const res = await agent.get('/api/orders/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('order_id');
        expect(res.body).toHaveProperty('order_total_price');
        expect(res.body).toHaveProperty('order_status');
        expect(Array.isArray(res.body.products)).toBe(true);
    });

    it('should update order status as sales manager', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'sales.manager@test.com',
            password: 'Test@1234'
        });

        const res = await agent
            .put('/api/orders/1/status')
            .send({ status: 2 }); // 2 = In Transit

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Order status updated successfully');
    });

    it('should deny order status update for non-sales managers', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });

        const res = await agent
            .put('/api/orders/1/status')
            .send({ status: 2 });

        expect(res.statusCode).toBe(403);
    });

    it('should get order invoice', async () => {
        const agent = request.agent(app);
        await agent.post('/auth/login').send({
            email: 'customer@test.com',
            password: 'Test@1234'
        });

        const res = await agent.get('/api/orders/1/invoice');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('invoice_id');
        expect(res.body).toHaveProperty('invoice_pdf_url');
    });
});
