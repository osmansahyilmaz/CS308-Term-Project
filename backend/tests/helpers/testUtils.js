const request = require('supertest');

/**
 * Test user credentials for different roles
 */
const TEST_USERS = {
    ADMIN: {
        email: 'admin@admin.com',
        password: 'admin'
    },
    PRODUCT_MANAGER: {
        email: 'product.manager@test.com',
        password: 'Test@1234'
    },
    SALES_MANAGER: {
        email: 'sales.manager@test.com',
        password: 'Test@1234'
    },
    CUSTOMER: {
        email: 'customer@test.com',
        password: 'Test@1234'
    }
};

/**
 * Helper to login as a specific user type
 * @param {object} app - Express app instance
 * @param {string} userType - One of: 'ADMIN', 'PRODUCT_MANAGER', 'SALES_MANAGER', 'CUSTOMER'
 * @returns {object} Supertest agent with active session
 */
async function loginAs(app, userType) {
    const agent = request.agent(app);
    const credentials = TEST_USERS[userType];
    
    if (!credentials) {
        throw new Error(`Invalid user type: ${userType}`);
    }

    await agent
        .post('/auth/login')
        .send(credentials);

    return agent;
}

/**
 * Mock product data for testing
 */
const MOCK_PRODUCT = {
    name: "Test Product",
    description: "Test Description",
    price: 199.99,
    category: "Electronics",
    in_stock: 10,
    discount: 0,
    image: "https://example.com/image.jpg",
    images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    colors: ["Black", "White"],
    features: ["Feature 1", "Feature 2"],
    specifications: {
        "Weight": "250g",
        "Dimensions": "10x10x10 cm"
    }
};

/**
 * Mock order data for testing
 */
const MOCK_ORDER = {
    products: [
        {
            productId: 1,
            quantity: 2,
            priceWhenBuy: 199.99,
            discountWhenBuy: 15
        }
    ],
    shippingAddress: {
        address_id: 1
    },
    paymentMethod: 'credit_card',
    cardDetails: {
        number: '4111111111111111',
        expiry: '12/25',
        cvv: '123',
        name: 'John Doe'
    }
};

module.exports = {
    TEST_USERS,
    loginAs,
    MOCK_PRODUCT,
    MOCK_ORDER
};
