const request = require('supertest');
const app = require('../src/server');

describe('Address API', () => {
    it('should add a new address', async () => {
        const res = await request(app)
            .post('/api/addresses')
            .send({
                address_title: 'Home',
                address_city: 'Istanbul',
                address_district: 'Kadikoy',
                address_neighbourhood: 'Moda',
                address_building_number: '12',
                address_post_code: 34710,
                address_contact_phone: '5551234567',
                address_contact_name: 'John',
                address_contact_surname: 'Doe',
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Address added successfully');
    });

    it('should fetch all addresses for a user', async () => {
        const res = await request(app).get('/api/addresses');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('addresses');
    });

    it('should update an address', async () => {
        const res = await request(app)
            .put('/api/addresses/1')
            .send({ address_title: 'Updated Home' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Address updated successfully');
    });

    it('should delete an address', async () => {
        const res = await request(app).delete('/api/addresses/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Address deleted successfully');
    });
});