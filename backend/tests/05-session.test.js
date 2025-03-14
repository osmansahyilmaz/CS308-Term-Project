const request = require('supertest');
const app = require('../src/server');

describe('Session Persistence', () => {
    const testUser = {
        username: 'testUser',
        email: 'test@example.com',
        password: 'Test@1234'
    };

    const agent = request.agent(app);

    beforeAll(async () => {
        // Register the test user before login
        await agent
            .post('/auth/register')
            .send(testUser)
            .expect(201);
    });

    it('should persist session data across multiple requests for a logged in user', async () => {
        // Simulate login: ensure your login route sets req.session.user
        const loginRes = await agent
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body).toHaveProperty('message', 'Login successful');

        // Make a subsequent request to verify session persistence. For example, retrieve profile.
        const profileRes = await agent.get('/auth/profile');
        expect(profileRes.statusCode).toBe(200);
        expect(profileRes.body).toHaveProperty('user');
        expect(profileRes.body.user).toHaveProperty('email', testUser.email);
    });
}); 