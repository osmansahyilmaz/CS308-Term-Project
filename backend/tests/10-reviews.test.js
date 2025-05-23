const request = require('supertest');
const app = require('../src/server');
const reviewsDb = require('../src/db/reviewsDb');

jest.mock('../src/db/reviewsDb');

describe('Reviews API', () => {
    const mockReview = {
        productId: 1,
        rating: 4,
        title: "Great product",
        comment: "Really happy with this purchase!"
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/reviews', () => {
        it('should create a new review for a purchased product', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({
                email: 'customer@test.com',
                password: 'Test@1234'
            });

            reviewsDb.checkUserCanReviewProduct.mockResolvedValue(true);
            reviewsDb.checkUserReviewedProduct.mockResolvedValue(false);
            reviewsDb.createReview.mockResolvedValue({ 
                ...mockReview, 
                review_id: 1, 
                status: 'PENDING' 
            });

            const res = await agent
                .post('/api/reviews')
                .send(mockReview);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message', 'Review added successfully. It will be visible after approval.');
        });

        it('should deny review for non-purchased product', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({
                email: 'customer@test.com',
                password: 'Test@1234'
            });

            reviewsDb.checkUserCanReviewProduct.mockResolvedValue(false);

            const res = await agent
                .post('/api/reviews')
                .send(mockReview);

            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('error', 'You can only review products you have purchased and received');
        });
    });

    describe('GET /api/reviews', () => {
        it('should get approved reviews for a product', async () => {
            reviewsDb.getReviewsByProductId.mockResolvedValue([{
                ...mockReview,
                review_id: 1,
                status: 'APPROVED',
                username: 'testuser'
            }]);

            const res = await request(app).get('/api/reviews/product/1');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.reviews)).toBe(true);
        });

        it('should get product rating', async () => {
            reviewsDb.calculateProductRating.mockResolvedValue({
                avgRating: 4.5,
                totalReviews: 10
            });

            const res = await request(app).get('/api/reviews/rating/1');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('avgRating');
            expect(res.body).toHaveProperty('totalReviews');
        });
    });

    describe('PUT /api/reviews', () => {
        it('should approve review as product manager', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({
                email: 'product.manager@test.com',
                password: 'Test@1234'
            });

            reviewsDb.approveReview.mockResolvedValue({
                ...mockReview,
                review_id: 1,
                status: 'APPROVED'
            });

            const res = await agent.put('/api/reviews/1/approve');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Review approved successfully');
        });

        it('should deny review approval for non-product managers', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({
                email: 'customer@test.com',
                password: 'Test@1234'
            });

            const res = await agent.put('/api/reviews/1/approve');
            expect(res.statusCode).toBe(403);
        });
    });

    describe('DELETE /api/reviews', () => {
        it('should allow users to delete their own reviews', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({
                email: 'customer@test.com',
                password: 'Test@1234'
            });

            reviewsDb.deleteReview.mockResolvedValue({ affected: 1 });

            const res = await agent.delete('/api/reviews/1');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Review deleted successfully');
        });
    });
});
