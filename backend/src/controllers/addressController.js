const pool = require('../db/pool');

// Add a new address
const addAddress = async (req, res) => {
    const userId = req.session.user?.id;
    const {
        address_title,
        address_city,
        address_district,
        address_neighbourhood,
        address_main_street,
        address_street,
        address_building_number,
        address_floor,
        address_apartment_number,
        address_post_code,
        address_contact_phone,
        address_contact_name,
        address_contact_surname,
    } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const query = `
            INSERT INTO addresses (
                user_id, address_title, address_city, address_district, address_neighbourhood,
                address_main_street, address_street, address_building_number, address_floor,
                address_apartment_number, address_post_code, address_contact_phone,
                address_contact_name, address_contact_surname
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *;
        `;
        const values = [
            userId, address_title, address_city, address_district, address_neighbourhood,
            address_main_street, address_street, address_building_number, address_floor,
            address_apartment_number, address_post_code, address_contact_phone,
            address_contact_name, address_contact_surname,
        ];
        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Address added successfully', address: result.rows[0] });
    } catch (err) {
        console.error('Error adding address:', err);
        res.status(500).json({ error: 'Failed to add address' });
    }
};

// Update an existing address
const updateAddress = async (req, res) => {
    const userId = req.session.user?.id;
    const { id } = req.params;
    const {
        address_title,
        address_city,
        address_district,
        address_neighbourhood,
        address_main_street,
        address_street,
        address_building_number,
        address_floor,
        address_apartment_number,
        address_post_code,
        address_contact_phone,
        address_contact_name,
        address_contact_surname,
    } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const query = `
            UPDATE addresses
            SET address_title = $1, address_city = $2, address_district = $3, address_neighbourhood = $4,
                address_main_street = $5, address_street = $6, address_building_number = $7,
                address_floor = $8, address_apartment_number = $9, address_post_code = $10,
                address_contact_phone = $11, address_contact_name = $12, address_contact_surname = $13
            WHERE address_id = $14 AND user_id = $15
            RETURNING *;
        `;
        const values = [
            address_title, address_city, address_district, address_neighbourhood,
            address_main_street, address_street, address_building_number, address_floor,
            address_apartment_number, address_post_code, address_contact_phone,
            address_contact_name, address_contact_surname, id, userId,
        ];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Address not found or not authorized' });
        }

        res.status(200).json({ message: 'Address updated successfully', address: result.rows[0] });
    } catch (err) {
        console.error('Error updating address:', err);
        res.status(500).json({ error: 'Failed to update address' });
    }
};

// Delete an address
const deleteAddress = async (req, res) => {
    const userId = req.session.user?.id;
    const { id } = req.params;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const query = `
            DELETE FROM addresses
            WHERE address_id = $1 AND user_id = $2
            RETURNING *;
        `;
        const result = await pool.query(query, [id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Address not found or not authorized' });
        }

        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (err) {
        console.error('Error deleting address:', err);
        res.status(500).json({ error: 'Failed to delete address' });
    }
};

// Get all addresses for a user
const getAllAddresses = async (req, res) => {
    const userId = req.session.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const query = `
            SELECT * FROM addresses
            WHERE user_id = $1
            ORDER BY address_created_at DESC;
        `;
        const result = await pool.query(query, [userId]);
        res.status(200).json({ addresses: result.rows });
    } catch (err) {
        console.error('Error fetching addresses:', err);
        res.status(500).json({ error: 'Failed to fetch addresses' });
    }
};

module.exports = {
    addAddress,
    updateAddress,
    deleteAddress,
    getAllAddresses,
};