const request = require('supertest');
const app = require('../src/server');  // Import the Express server
const usersDb = require('../src/db/users');  // Mock database functions

jest.mock('../src/db/users'); // Mock the database interactions

describe('User Registration API', () => {
    
    // ✅ Test: Successful user registration
    it('should register a user successfully', async () => {
        usersDb.checkUserExists.mockResolvedValue({ rows: [] }); // User does not exist
        usersDb.createUser.mockResolvedValue({ 
            rows: [{ username: "testuser", email: "test@example.com", created_at: new Date() }] 
        });

        const res = await request(app)
            .post('/auth/register')
            .send({ username: "testuser", email: "test@example.com", password: "Test@1234" });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully');
        expect(res.body.user).toHaveProperty('username', 'testuser');
        expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    // ❌ Test: Missing required fields
    it('should return an error if required fields are missing', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ username: "", email: "test@example.com", password: "Test@1234" });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'All fields are required');
    });

    // ❌ Test: Invalid email format
    it('should return an error for invalid email format', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ username: "testuser", email: "invalidemail", password: "Test@1234" });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Invalid email format');
    });

    // ❌ Test: Weak password
    it('should return an error for weak password', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ username: "testuser", email: "test@example.com", password: "weak" });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number');
    });

    // ❌ Test: User already exists
    it('should return an error if user already exists', async () => {
        usersDb.checkUserExists.mockResolvedValue({ rows: [{ id: 1 }] }); // Simulating existing user

        const res = await request(app)
            .post('/auth/register')
            .send({ username: "testuser", email: "test@example.com", password: "Test@1234" });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Username or email already exists');
    });

});
