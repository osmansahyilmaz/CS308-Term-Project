const request = require('supertest');
const app = require('../src/server');  // Import the Express server
const usersDb = require('../src/db/users');  // Mock database functions

jest.mock('../src/db/users'); // Mock the database interactions

describe('User Login API', () => {

    // ✅ Test: Successful login
    it('should login successfully with correct credentials', async () => {
        usersDb.getUserByEmail.mockResolvedValue({
            rows: [{ id: 1, username: "testuser", email: "test@example.com", hashed_password: await require('argon2').hash("Test@1234") }]
        });

        const res = await request(app)
            .post('/auth/login')
            .send({ email: "test@example.com", password: "Test@1234" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Login successful');
    });

    // ❌ Test: Missing fields
    it('should return error if email or password is missing', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: "test@example.com" }); // Password missing

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Email and password are required');
    });

    // ❌ Test: Invalid email format
    it('should return error for invalid email format', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: "invalidemail", password: "Test@1234" });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Invalid email format');
    });

    // ❌ Test: Non-existing user
    it('should return error if email is not registered', async () => {
        usersDb.getUserByEmail.mockResolvedValue({ rows: [] }); // Simulating no user found

        const res = await request(app)
            .post('/auth/login')
            .send({ email: "notfound@example.com", password: "Test@1234" });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    // ❌ Test: Incorrect password
    it('should return error if password is incorrect', async () => {
        usersDb.getUserByEmail.mockResolvedValue({
            rows: [{ id: 1, username: "testuser", email: "test@example.com", hashed_password: await require('argon2').hash("CorrectPass@1234") }]
        });

        const res = await request(app)
            .post('/auth/login')
            .send({ email: "test@example.com", password: "WrongPass@1234" });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

});
