require('dotenv').config();
const pool = require('./src/db/pool');
const argon2 = require('argon2');

const seedUsers = async () => {
  const users = [
    {
      username: "admin",
      email: "admin@admin.com",
      password: "admin", // Plain text; will be hashed
      role_id: 0 // Admin
    },
    {
      username: "johndoe",
      email: "johndoe@example.com",
      password: "password123",
      role_id: 1
    },
    {
      username: "janedoe",
      email: "janedoe@example.com",
      password: "password123",
      role_id: 1
    }
  ];
  const insertedUsers = [];
  for (const user of users) {
    const hashedPassword = await argon2.hash(user.password);
    const query = `
      INSERT INTO users (username, email, hashed_password, role_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username, email, role_id, created_at;
    `;
    const values = [user.username, user.email, hashedPassword, user.role_id];
    let result = await pool.query(query, values);
    // If no row inserted, get the existing user
    if (result.rows.length === 0) {
      const selectQuery = 'SELECT id, username, email, role_id, created_at FROM users WHERE username = $1';
      result = await pool.query(selectQuery, [user.username]);
    }
    console.log(`User record for "${result.rows[0].username}" available with ID: ${result.rows[0].id}`);
    insertedUsers.push(result.rows[0]);
  }
  return insertedUsers;
};

const seedProducts = async () => {
  const products = [
    {
      name: "Premium Wireless Headphones",
      description: "Experience crystal-clear sound with our premium wireless headphones. Perfect for music lovers and professionals alike.",
      price: 199.99,
      category: "Electronics",
      in_stock: 13,
      discount: 15,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1165&q=80",
        "https://images.unsplash.com/photo-1563627806368-2294c38c9506?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
      ],
      colors: ["Black", "White", "Blue"],
      features: [
        "Active Noise Cancellation",
        "Bluetooth 5.0 connectivity",
        "40-hour battery life",
        "Hi-Res Audio certified",
        "Built-in microphone for calls",
        "Foldable design for easy storage"
      ],
      specifications: {
        "Driver Size": "40mm",
        "Frequency Response": "20Hz - 40kHz",
        "Impedance": "32 Ohm",
        "Sensitivity": "105dB/mW",
        "Battery Capacity": "600mAh",
        "Charging Time": "2 hours",
        "Weight": "250g"
      }
    },
    {
      name: "Smart Fitness Watch",
      description: "Track your health and fitness goals with our advanced smart watch. Features heart rate monitoring, sleep tracking, and more.",
      price: 149.99,
      category: "Wearables",
      in_stock: 0,
      discount: 0,
      image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1888&q=80",
      images: [
        "https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1888&q=80",
        "https://images.unsplash.com/photo-1617043786394-ae546df13d68?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1527&q=80"
      ],
      colors: ["Black", "Silver", "Rose Gold"],
      features: [
        "Heart rate monitoring",
        "Sleep tracking",
        "Water resistant up to 50m",
        "GPS tracking",
        "7-day battery life",
        "Customizable watch faces"
      ],
      specifications: {
        "Display": "1.4 inch AMOLED",
        "Resolution": "454 x 454 pixels",
        "Battery": "420mAh",
        "Sensors": "Heart rate, Accelerometer, Gyroscope, GPS",
        "Water Resistance": "5 ATM",
        "Connectivity": "Bluetooth 5.0, WiFi",
        "Weight": "32g"
      }
    },
    {
      name: "Portable Bluetooth Speaker",
      description: "Take your music anywhere with this waterproof, portable Bluetooth speaker. Features 24-hour battery life and powerful bass.",
      price: 79.99,
      category: "Electronics",
      in_stock: 2,
      discount: 10,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      images: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        "https://images.unsplash.com/photo-1563330232-57114bb0823c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        "https://images.unsplash.com/photo-1589003077984-894e133f8525?ixlib=rb-4.0.3&auto=format&fit=crop&w=1527&q=80"
      ],
      colors: ["Black", "Blue", "Red", "Green"],
      features: [
        "IPX7 waterproof rating",
        "24-hour battery life",
        "Bluetooth 5.0 connectivity",
        "Built-in microphone for calls",
        "Stereo pairing capability",
        "USB-C charging"
      ],
      specifications: {
        "Speaker Output": "20W",
        "Frequency Response": "60Hz - 20kHz",
        "Battery Capacity": "5000mAh",
        "Charging Time": "3 hours",
        "Bluetooth Range": "30 meters",
        "Dimensions": "180 x 80 x 70 mm",
        "Weight": "540g"
      }
    }
  ];

  const insertedProducts = [];
  for (const product of products) {
    const query = `
      INSERT INTO products 
        (name, description, price, category, in_stock, discount, image, images, colors, features, specifications)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING product_id;
    `;
    const values = [
      product.name,
      product.description,
      product.price,
      product.category,
      product.in_stock,
      product.discount,
      product.image,
      product.images,
      product.colors,
      product.features,
      product.specifications
    ];
    const result = await pool.query(query, values);
    console.log(`Inserted product with ID: ${result.rows[0].product_id}`);
    insertedProducts.push({ ...product, product_id: result.rows[0].product_id });
  }
  return insertedProducts;
};

const seedReviews = async (products, users) => {
  const reviews = [
    {
      productIndex: 0,
      userIndex: 1,
      rating: 5,
      title: "Amazing sound quality!",
      comment: "I love these headphones! The noise cancellation is top-notch."
    },
    {
      productIndex: 0,
      userIndex: 2,
      rating: 4,
      title: "Great but pricey",
      comment: "The headphones sound fantastic, but they could be a little more comfortable."
    },
    {
      productIndex: 1,
      userIndex: 1,
      rating: 4,
      title: "Good fitness companion",
      comment: "Tracks my workouts well, and battery lasts long enough."
    },
    {
      productIndex: 2,
      userIndex: 2,
      rating: 5,
      title: "Perfect for outdoor parties",
      comment: "Loud, clear, and the battery lasts forever!"
    }
  ];

  for (const rev of reviews) {
    const product_id = products[rev.productIndex].product_id;
    const user_id = users[rev.userIndex].id;
    const query = `
      INSERT INTO reviews 
        (product_id, user_id, rating, title, comment)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING review_id;
    `;
    const values = [product_id, user_id, rev.rating, rev.title, rev.comment];
    const result = await pool.query(query, values);
    console.log(`Inserted review with ID: ${result.rows[0].review_id} for product ID: ${product_id}`);
  }
};

const seedRatings = async (users) => {
  const ratings = [
    { userIndex: 1, rating: 5 },
    { userIndex: 2, rating: 4 }
  ];
  for (const rate of ratings) {
    const user_id = users[rate.userIndex].id;
    const query = `
      INSERT INTO ratings (user_id, rating_value)
      VALUES ($1, $2)
      RETURNING rating_id;
    `;
    const values = [user_id, rate.rating];
    const result = await pool.query(query, values);
    console.log(`Inserted rating with ID: ${result.rows[0].rating_id} by user ID: ${user_id}`);
  }
};

const seedComments = async (users) => {
  const comments = [
    { userIndex: 1, comment: "I really enjoy using this app. Great experience!" },
    { userIndex: 2, comment: "Customer service could be improved, but overall it's good." }
  ];
  for (const com of comments) {
    const user_id = users[com.userIndex].id;
    const query = `
      INSERT INTO comments (user_id, comment_text)
      VALUES ($1, $2)
      RETURNING comment_id;
    `;
    const values = [user_id, com.comment];
    const result = await pool.query(query, values);
    console.log(`Inserted comment with ID: ${result.rows[0].comment_id} by user ID: ${user_id}`);
  }
};

const seedCart = async (products, users) => {
  const dummySessionId = "dummy-session-1234";
  
  // Insert a dummy session record if it doesn't exist to satisfy the foreign key constraint.
  const sessionQuery = `
    INSERT INTO session (sid, sess, expire)
    VALUES ($1, $2, NOW() + INTERVAL '1 day')
    ON CONFLICT (sid) DO NOTHING;
  `;
  await pool.query(sessionQuery, [dummySessionId, JSON.stringify({})]);
  
  const cartItems = [
    { userIndex: 1, productIndex: 0, quantity: 2 },
    { userIndex: 2, productIndex: 2, quantity: 1 }
  ];
  
  for (const item of cartItems) {
    const user_id = users[item.userIndex].id;
    const product_id = products[item.productIndex].product_id;
    const query = `
      INSERT INTO cart (user_id, session_id, product_id, quantity)
      VALUES ($1, $2, $3, $4)
      RETURNING cart_id;
    `;
    const values = [user_id, dummySessionId, product_id, item.quantity];
    const result = await pool.query(query, values);
    console.log(`Inserted cart entry with ID: ${result.rows[0].cart_id} for user ID: ${user_id}`);
  }
};

const seedAll = async () => {
  try {
    console.log("Seeding data...");
    const users = await seedUsers();
    const products = await seedProducts();
    await seedReviews(products, users);
    await seedRatings(users);
    await seedComments(users);
    await seedCart(products, users);
    console.log("✅ Seeding completed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seedAll();