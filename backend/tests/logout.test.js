const request = require('supertest');
const app = require('../src/server');

describe('Logout API', () => {
    const testUser = {
        username: 'testUser',
        email: 'test@example.com',
        password: 'Test@1234'
    };

    let agent;

    beforeAll(async () => {
        agent = request.agent(app);

        // 1️⃣ Register the test user
        await agent
            .post('/auth/register')
            .send(testUser)
            .expect(201);
    });

    // Test: Logout without an active session
    it('should return 401 when logging out without an active session', async () => {
        const res = await request(app).post('/auth/logout');
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Not authenticated');
    });

    // Test: Logout with an active session
    it('should logout successfully and clear the session cookie', async () => {
        // 2️⃣ Log in with the registered user
        await agent
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(200)
            .then((response) => {
                expect(response.body).toHaveProperty('message', 'Login successful');
            });

        // 3️⃣ Logout using the same agent that holds the session
        const res = await agent.post('/auth/logout');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Logout successful');

        // 4️⃣ Validate that the session cookie is cleared
        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();
        const clearedCookie = cookies.find(cookie => cookie.startsWith('connect.sid='));
        expect(clearedCookie).toMatch(/connect\.sid=;/);
    });
});
