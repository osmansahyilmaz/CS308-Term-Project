const request = require('supertest');
const app = require('../src/server');

describe('Cart API', () => {
    it('should fetch the cart', async () => {
        const res = await request(app).get('/api/cart');
        expect(res.statusCode).toBe(200);
    });

    it('should add a product to the cart', async () => {
        const res = await request(app)
            .post('/api/cart/add')
            .send({ productId: 1, quantity: 2 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Product added to cart');
    });

    it('should remove a product from the cart', async () => {
        const res = await request(app)
            .post('/api/cart/remove')
            .send({ productId: 1 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Product removed from cart');
    });

    it('should clear the cart', async () => {
        const res = await request(app).delete('/api/cart/clear');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Cart cleared');
    });
});