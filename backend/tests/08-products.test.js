const request = require('supertest');
const app = require('../src/server');
const productsDb = require('../src/db/products');

jest.mock('../src/db/products');

describe('Products API', () => {
    const mockProduct = {
        name: "Test Product",
        description: "Test Description",
        price: 199.99,
        category: "Electronics",
        in_stock: 10,
        discount: 0,
        image: "https://example.com/image.jpg",
        images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
        colors: ["Black", "White"],
        features: ["Feature 1", "Feature 2"],
        specifications: {
            "Weight": "250g",
            "Dimensions": "10x10x10 cm"
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/products', () => {
        it('should fetch all products', async () => {
            productsDb.getAllProducts.mockResolvedValue([mockProduct]);

            const res = await request(app).get('/api/products');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.products)).toBe(true);
        });

        it('should fetch product by id', async () => {
            productsDb.getProductById.mockResolvedValue(mockProduct);

            const res = await request(app).get('/api/products/1');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('name', mockProduct.name);
        });
    });

    describe('POST /api/products', () => {
        it('should create a new product as product manager', async () => {
            const agent = request.agent(app);
            await loginAsProductManager(agent);

            productsDb.createProduct.mockResolvedValue({ ...mockProduct, product_id: 1 });

            const res = await agent
                .post('/api/products')
                .send(mockProduct);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message', 'Product created successfully. Awaiting price set by sales manager.');
        });

        it('should deny product creation for non-product managers', async () => {
            const agent = request.agent(app);
            await loginAsCustomer(agent);

            const res = await agent
                .post('/api/products')
                .send(mockProduct);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('PUT /api/products/:id', () => {
        it('should update product stock as product manager', async () => {
            const agent = request.agent(app);
            await loginAsProductManager(agent);

            productsDb.updateProductStock.mockResolvedValue({ ...mockProduct, in_stock: 20 });

            const res = await agent
                .put('/api/products/1/stock')
                .send({ in_stock: 20 });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Product stock updated successfully');
        });

        it('should update product price as sales manager', async () => {
            const agent = request.agent(app);
            await loginAsSalesManager(agent);

            productsDb.updateProductPrice.mockResolvedValue({ ...mockProduct, price: 179.99 });

            const res = await agent
                .put('/api/products/1/price')
                .send({ price: 179.99 });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Product price updated successfully');
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should delete product as product manager', async () => {
            const agent = request.agent(app);
            await loginAsProductManager(agent);

            productsDb.deleteProduct.mockResolvedValue({ affected: 1 });

            const res = await agent.delete('/api/products/1');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Product deleted successfully');
        });

        it('should deny product deletion for non-product managers', async () => {
            const agent = request.agent(app);
            await loginAsCustomer(agent);

            const res = await agent.delete('/api/products/1');
            expect(res.statusCode).toBe(403);
        });
    });
});

// Helper functions to simulate different user roles
async function loginAsProductManager(agent) {
    await agent.post('/auth/login').send({
        email: 'product.manager@test.com',
        password: 'Test@1234'
    });
}

async function loginAsSalesManager(agent) {
    await agent.post('/auth/login').send({
        email: 'sales.manager@test.com',
        password: 'Test@1234'
    });
}

async function loginAsCustomer(agent) {
    await agent.post('/auth/login').send({
        email: 'customer@test.com',
        password: 'Test@1234'
    });
}
