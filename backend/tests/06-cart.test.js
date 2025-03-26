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

    it('should decrease product quantity by 1 if quantity > 1', async () => {
        const res = await request(app)
            .post('/api/cart/remove')
            .send({ productId: 1 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Product quantity decreased by 1');
    });

    it('should remove product from cart if quantity is 1', async () => {
        const res = await request(app)
            .post('/api/cart/remove')
            .send({ productId: 1 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Product removed from cart');
    });

    it('should remove all quantities of a product from the cart', async () => {
        const res = await request(app)
            .post('/api/cart/remove-all')
            .send({ productId: 1 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'All quantities of the product removed from cart');
    });

    it('should clear the cart', async () => {
        const res = await request(app).delete('/api/cart/clear');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Cart cleared');
    });

    it('should merge session-based cart with user-based cart after login', async () => {
        const res = await request(app)
            .post('/api/cart/merge')
            .send();
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Cart merged successfully');
    });
});