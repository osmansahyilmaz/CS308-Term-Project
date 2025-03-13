const argon2 = require('argon2');

describe('Password Hashing & Verification', () => {
    
    let plainPassword = "Test@1234";
    let hashedPassword;

    // ✅ Test: Hashing a password
    it('should hash a password successfully', async () => {
        hashedPassword = await argon2.hash(plainPassword);

        expect(hashedPassword).toBeDefined();
        expect(hashedPassword).not.toBe(plainPassword);  // Hash should be different from the plain password
    });

    // ✅ Test: Hashing should produce different outputs for the same password
    it('should generate different hashes for the same password (due to salting)', async () => {
        const hash1 = await argon2.hash(plainPassword);
        const hash2 = await argon2.hash(plainPassword);

        expect(hash1).not.toBe(hash2);  // Each hash should be unique
    });

    // ✅ Test: Verifying a password
    it('should verify a correct password against its hash', async () => {
        const isMatch = await argon2.verify(hashedPassword, plainPassword);

        expect(isMatch).toBe(true);
    });

    // ❌ Test: Verifying an incorrect password
    it('should fail to verify an incorrect password', async () => {
        const isMatch = await argon2.verify(hashedPassword, "WrongPassword123");

        expect(isMatch).toBe(false);
    });

});
