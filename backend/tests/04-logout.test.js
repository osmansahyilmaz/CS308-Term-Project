const request = require('supertest');
const app = require('../src/server');

describe('Logout API', () => {
    // Generate a unique ID for both username and email
    const uniqueId = Date.now();
    const testUser = {
        username: `testUser_${uniqueId}`,
        email: `testUser_${uniqueId}@example.com`,
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
        // Using a fresh request (not the persistent agent)
        const res = await request(app).post('/auth/logout');
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Not authenticated');
    });

    // Test: Logout with an active session
    it('should logout successfully and clear the session cookie', async () => {
        // 2️⃣ Log in with the registered user
        const loginRes = await agent
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body).toHaveProperty('message', 'Login successful');

        // Optional: Verify session persistence by fetching the profile
        const profileRes = await agent.get('/auth/profile');
        expect(profileRes.statusCode).toBe(200);
        expect(profileRes.body).toHaveProperty('user');
        expect(profileRes.body.user).toHaveProperty('email', testUser.email);

        // 3️⃣ Logout using the same agent that holds the session
        const logoutRes = await agent.post('/auth/logout');
        expect(logoutRes.statusCode).toBe(200);
        expect(logoutRes.body).toHaveProperty('message', 'Logout successful');

        // 4️⃣ Validate that the session cookie is cleared
        const cookies = logoutRes.headers['set-cookie'];
        expect(cookies).toBeDefined();
        const clearedCookie = cookies.find(cookie => cookie.startsWith('connect.sid='));
        expect(clearedCookie).toMatch(/connect\.sid=;/);
    });
});