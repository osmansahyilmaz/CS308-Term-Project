const request = require('supertest');
const app = require('../src/server');

describe('Logout API', () => {
    // Test: Logout without an active session
    it('should return 401 when logging out without an active session', async () => {
        const res = await request(app).post('/auth/logout');
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Not authenticated');
    });

    // Test: Logout with an active session
    it('should logout successfully and clear the session cookie', async () => {
        const agent = request.agent(app);

        // Simulate a login. Ensure your login route sets req.session.user upon success.
        await agent
            .post('/auth/login')
            .send({ email: 'test@example.com', password: 'Test@1234' })
            .then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('message', 'Login successful');
            });

        // Now logout using the same agent that holds the session data
        const res = await agent.post('/auth/logout');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Logout successful');

        // Validate that the session cookie is cleared
        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();
        const clearedCookie = cookies.find(cookie => cookie.startsWith('connect.sid='));
        expect(clearedCookie).toMatch(/connect\.sid=;/);
    });
});