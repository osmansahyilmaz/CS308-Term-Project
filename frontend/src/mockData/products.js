// Mock product data for development and testing
// This file provides example product data that matches the expected API response structure

export const mockProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    description: "Experience crystal-clear sound with our premium wireless headphones. Perfect for music lovers and professionals alike.",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "Electronics",
    inStock: true,
    discount: 15, // percentage
    rating: 4.5,
    reviewCount: 128,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1165&q=80",
      "https://images.unsplash.com/photo-1563627806368-2294c38c9506?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
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
    },
    reviews: [
      {
        id: 101,
        user: "Alex Johnson",
        date: "May 15, 2023",
        rating: 5,
        title: "Best headphones I've ever owned!",
        comment: "I've been using these headphones for about a month now and I'm extremely impressed with the sound quality and comfort. The noise cancellation works perfectly for my commute and the battery life is exceptional."
      },
      {
        id: 102,
        user: "Samantha Lee",
        date: "April 28, 2023",
        rating: 4,
        title: "Great quality, minor comfort issues",
        comment: "The sound quality and features are amazing, but they get a bit uncomfortable after wearing them for more than 3 hours. Still, I would recommend them for the quality and battery life."
      },
      {
        id: 103,
        user: "Michael Rodriguez",
        date: "June 2, 2023",
        rating: 5,
        title: "Perfect for working from home",
        comment: "These headphones have been a lifesaver for my home office setup. The noise cancellation blocks out all distractions and the sound quality for calls is crystal clear. Highly recommend!"
      }
    ]
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    description: "Track your health and fitness goals with our advanced smart watch. Features heart rate monitoring, sleep tracking, and more.",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1888&q=80",
    category: "Wearables",
    inStock: true,
    discount: 0,
    rating: 4.2,
    reviewCount: 95,
    images: [
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1888&q=80",
      "https://images.unsplash.com/photo-1617043786394-ae546df13d68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1527&q=80"
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
    },
    reviews: [
      {
        id: 201,
        user: "Jennifer Smith",
        date: "June 10, 2023",
        rating: 5,
        title: "Amazing fitness companion!",
        comment: "This watch has everything I need to track my workouts and health. The battery life is impressive and the sleep tracking feature has helped me improve my sleep habits."
      },
      {
        id: 202,
        user: "David Chen",
        date: "May 22, 2023",
        rating: 4,
        title: "Great watch, app needs work",
        comment: "The watch itself is excellent - good build quality and accurate tracking. The companion app could use some improvements in terms of user interface and data presentation."
      }
    ]
  },
  {
    id: 3,
    name: "Portable Bluetooth Speaker",
    description: "Take your music anywhere with this waterproof, portable Bluetooth speaker. Features 24-hour battery life and powerful bass.",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "Electronics",
    inStock: true,
    discount: 10,
    rating: 4.7,
    reviewCount: 156,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1563330232-57114bb0823c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1589003077984-894e133f8525?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1527&q=80"
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
    },
    reviews: [
      {
        id: 301,
        user: "Robert Wilson",
        date: "July 5, 2023",
        rating: 5,
        title: "Perfect beach companion!",
        comment: "Took this speaker to the beach and it was perfect! The sound quality is excellent for its size and it survived getting splashed with water. The battery lasted the entire weekend on a single charge."
      },
      {
        id: 302,
        user: "Emily Johnson",
        date: "June 18, 2023",
        rating: 4,
        title: "Great sound, could be louder",
        comment: "I love the portability and sound quality of this speaker. My only complaint is that it could be a bit louder for outdoor use, but otherwise it's perfect for my needs."
      },
      {
        id: 303,
        user: "Thomas Brown",
        date: "July 10, 2023",
        rating: 5,
        title: "Incredible value for money",
        comment: "I've owned much more expensive speakers that don't sound nearly as good as this one. The bass is impressive for its size and the battery life is as advertised. Highly recommended!"
      }
    ]
  }
];

// Function to get all products
export const getAllProducts = () => {
  return mockProducts;
};

// Function to get a single product by ID
export const getProductById = (id) => {
  return mockProducts.find(product => product.id === parseInt(id)) || null;
};

// Function to get products by category
export const getProductsByCategory = (category) => {
  if (category === "All") {
    return mockProducts;
  }
  return mockProducts.filter(product => product.category === category);
};

// Function to get related products (products in the same category, excluding the current product)
export const getRelatedProducts = (productId, limit = 3) => {
  const currentProduct = getProductById(productId);
  if (!currentProduct) return [];
  
  return mockProducts
    .filter(product => product.category === currentProduct.category && product.id !== currentProduct.id)
    .slice(0, limit);
}; 