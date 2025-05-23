const pool = require('../../src/db/pool');
const argon2 = require('argon2');
const { TEST_USERS } = require('../helpers/testUtils');

async function seedTestData() {
    // Create test users with different roles
    await createTestUsers();
    
    // Create test categories
    await createTestCategories();
    
    // Create test products
    await createTestProducts();
    
    // Create test orders and reviews
    await createTestOrdersAndReviews();
}

async function createTestUsers() {
    const users = [
        {
            username: "testadmin",
            email: TEST_USERS.ADMIN.email,
            password: TEST_USERS.ADMIN.password,
            role_id: 0 // Admin
        },
        {
            username: "testproductmanager",
            email: TEST_USERS.PRODUCT_MANAGER.email,
            password: TEST_USERS.PRODUCT_MANAGER.password,
            role_id: 2 // Product Manager
        },
        {
            username: "testsalesmanager",
            email: TEST_USERS.SALES_MANAGER.email,
            password: TEST_USERS.SALES_MANAGER.password,
            role_id: 3 // Sales Manager
        },
        {
            username: "testcustomer",
            email: TEST_USERS.CUSTOMER.email,
            password: TEST_USERS.CUSTOMER.password,
            role_id: 1 // Customer
        }
    ];

    for (const user of users) {
        const hashedPassword = await argon2.hash(user.password);
        await pool.query(`
            INSERT INTO users (username, email, hashed_password, role_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO UPDATE SET
                username = EXCLUDED.username,
                hashed_password = EXCLUDED.hashed_password,
                role_id = EXCLUDED.role_id
        `, [user.username, user.email, hashedPassword, user.role_id]);
    }
}

async function createTestCategories() {
    const categories = ['Electronics', 'Wearables', 'Smart Home'];
    
    for (const category of categories) {
        await pool.query(`
            INSERT INTO categories (name)
            VALUES ($1)
            ON CONFLICT (name) DO NOTHING
        `, [category]);
    }
}

async function createTestProducts() {
    // Test products will be created here
    const products = [
        {
            name: "Test Product 1",
            description: "Test Description 1",
            price: 199.99,
            category: "Electronics",
            in_stock: 10,
            discount: 0
        },
        {
            name: "Test Product 2",
            description: "Test Description 2",
            price: 299.99,
            category: "Wearables",
            in_stock: 5,
            discount: 10
        }
    ];

    for (const product of products) {
        await pool.query(`
            INSERT INTO products (name, description, price, category, in_stock, discount)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (name) DO UPDATE SET
                description = EXCLUDED.description,
                price = EXCLUDED.price,
                category = EXCLUDED.category,
                in_stock = EXCLUDED.in_stock,
                discount = EXCLUDED.discount
        `, [product.name, product.description, product.price, product.category, product.in_stock, product.discount]);
    }
}

async function createTestOrdersAndReviews() {
    // Get test customer id
    const { rows: [customer] } = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [TEST_USERS.CUSTOMER.email]
    );

    // Get test product id
    const { rows: [product] } = await pool.query(
        'SELECT product_id FROM products WHERE name = $1',
        ['Test Product 1']
    );

    if (customer && product) {
        // Create test order
        const { rows: [order] } = await pool.query(`
            INSERT INTO orders (user_id, order_total_price, order_status)
            VALUES ($1, $2, $3)
            RETURNING order_id
        `, [customer.id, 199.99, 3]); // Status 3 = Delivered

        // Create product_of_order entry
        await pool.query(`
            INSERT INTO products_of_order (order_id, product_id, price_when_buy, discount_when_buy, product_order_count)
            VALUES ($1, $2, $3, $4, $5)
        `, [order.order_id, product.product_id, 199.99, 0, 1]);

        // Create test review
        await pool.query(`
            INSERT INTO reviews (product_id, user_id, rating, title, comment, status)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [product.product_id, customer.id, 5, 'Test Review', 'Great product!', 'APPROVED']);
    }
}

module.exports = seedTestData;
