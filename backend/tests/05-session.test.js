const request = require('supertest');
const app = require('../src/server');

describe('Session Persistence', () => {
    it('should persist session data across multiple requests for a logged in user', async () => {
        const agent = request.agent(app);

        // Simulate login: ensure your login route sets req.session.user
        const loginRes = await agent
            .post('/auth/login')
            .send({ email: 'test@example.com', password: 'Test@1234' });
        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body).toHaveProperty('message', 'Login successful');

        // Make a subsequent request to verify session persistence. For example, retrieve profile.
        const profileRes = await agent.get('/auth/profile');
        expect(profileRes.statusCode).toBe(200);
        expect(profileRes.body).toHaveProperty('user');
        expect(profileRes.body.user).toHaveProperty('email', 'test@example.com');

        // Optionally, simulate another action using the same agent and expect session data to be maintained.
    });
});