const fs = require('fs');
const crypto = require('crypto');

// The 3 user IDs provided by the user
const userIds = [
    "693afd51a682acc7b74279e2",
    "693afd89a682acc7b7427a16",
    "69a1d8d8a1abaeedd9ade1b8"
];

const categories = [
    "Cars", "Properties", "Mobiles", "Bikes", "Electronics & Appliances",
    "Commercial Vehicles & Spares", "Furniture", "Fashion", "Books, Sports & Hobbies", "Services"
];

// Seed adjectives and nouns to generate diverse product titles
const adjectives = ["Premium", "Vintage", "Modern", "Refurbished", "Like-New", "Sleek", "Durable", "High-Performance", "Eco-Friendly", "Compact", "Heavy-Duty", "Portable", "Antique"];
const productTypes = {
    "Mobiles": ["Smartphone", "Android Phone", "iPhone Clone", "5G Mobile", "Flagship Phone"],
    "Bikes": ["Cruiser Bike", "Sports Bike", "Electric Scooter", "Mountain Bike", "Commuter Motorcycle"],
    "Electronics & Appliances": ["4K Smart TV", "Air Purifier", "Coffee Maker", "Robot Vacuum", "Microwave Oven", "Bluetooth Speaker", "Gaming Console", "Laptop", "Tablet"],
    "Furniture": ["Ergonomic Chair", "Dining Table", "Sofa Set", "Bookshelf", "Coffee Table", "TV Stand", "Bed Frame"],
    "Fashion": ["Leather Jacket", "Designer Sunglasses", "Sneakers", "Running Shoes", "Winter Coat", "Formal Suit", "Luxury Watch"],
    "Books, Sports & Hobbies": ["Acoustic Guitar", "Yoga Mat", "Golf Club Set", "Fiction Novel Set", "Tennis Racket", "DSLR Camera"],
    "Cars": ["Sedan", "SUV", "Hatchback", "Electric Car", "Convertible"],
    "Properties": ["1BHK Apartment", "Studio Flat", "Office Space", "Farmhouse"],
    "Services": ["Plumbing Service", "Graphic Design Setup", "House Cleaning", "Tutoring Package"],
    "Commercial Vehicles & Spares": ["Cargo Truck", "Tractor", "Spare Engine Parts", "Commercial Van"]
};

const brands = ["Apple", "Samsung", "Sony", "LG", "Dell", "HP", "Nike", "Adidas", "Toyota", "Honda", "IKEA", "Yamaha", "Bose", "Canon"];

const categoryImages = {
    "Cars": [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1503376713600-0196ce218151?auto=format&fit=crop&q=80&w=800"
    ],
    "Properties": [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"
    ],
    "Mobiles": [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&q=80&w=800"
    ],
    "Bikes": [
        "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800"
    ],
    "Electronics & Appliances": [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1526406915894-7bc5cc8bc00a?auto=format&fit=crop&q=80&w=800"
    ],
    "Commercial Vehicles & Spares": [
        "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1586191559205-0aa34aa6b1b6?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1595167098255-b44c207d727b?auto=format&fit=crop&q=80&w=800"
    ],
    "Furniture": [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800"
    ],
    "Fashion": [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800"
    ],
    "Books, Sports & Hobbies": [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800"
    ],
    "Services": [
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80&w=800"
    ]
};

const generatedProducts = [];
const generatedOrders = [];

// Generate random Hex ObjectId if we need mock IDs for products
const generateObjectId = () => crypto.randomBytes(12).toString("hex");

// 1. Generate 70 products
for (let i = 0; i < 70; i++) {
    // Pick random category
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const typeList = productTypes[cat];
    const type = typeList[Math.floor(Math.random() * typeList.length)];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];

    const title = `${adj} ${type}`;
    const brand = brands[Math.floor(Math.random() * brands.length)];

    // Base price between 500 and 100000
    let price = Math.floor(Math.random() * 95000) + 500;
    if (cat === "Cars" || cat === "Properties" || cat === "Commercial Vehicles & Spares") {
        price = price * 10; // Make them more expensive
    }

    // Select a relevant image based on category
    const catImages = categoryImages[cat];
    const imgUrl = catImages[Math.floor(Math.random() * catImages.length)];

    const conditions = ["New", "Used", "Refurbished"];
    const cond = conditions[Math.floor(Math.random() * conditions.length)];

    const randomDaysAgo = Math.floor(Math.random() * 300);
    const createdAt = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000);

    // Assign a random user as the seller
    const randomSellerId = userIds[Math.floor(Math.random() * userIds.length)];
    const productId = { "$oid": generateObjectId() };

    // Calculate random stock and sold
    const quantity = Math.floor(Math.random() * 8) + 1;
    const soldCount = Math.floor(Math.random() * 15);

    const product = {
        "_id": productId,
        "userId": { "$oid": randomSellerId },
        "productTitle": title,
        "productCategory": cat,
        "productDescription": `Great condition ${title}. Perfect for your needs. Carefully handled and ready to use. Features excellent build quality.`,
        "price": price,
        "quantity": quantity,
        "condition": cond,
        "brand": brand,
        "imageUrl": imgUrl,
        "imageUrls": [imgUrl],
        "imageDetails": [{
            "url": imgUrl,
            "publicId": `seed_${i}`,
            "isPrimary": true
        }],
        "soldCount": soldCount,
        "tags": [cat.toLowerCase().split(' ')[0], brand.toLowerCase(), "quality", "ecofinds"],
        "location": {
            "lat": 19.076 + (Math.random() * 0.1 - 0.05),
            "lng": 72.8777 + (Math.random() * 0.1 - 0.05),
            "address": "Mumbai, Maharashtra"
        },
        "deliveryAvailable": true,
        "deliveryFee": price > 10000 ? 0 : 150,
        "isActive": true,
        "viewCount": Math.floor(Math.random() * 1000) + 100,
        "createdAt": { "$date": createdAt.toISOString() },
        "updatedAt": { "$date": new Date().toISOString() },
        "__v": 0
    };

    generatedProducts.push(product);
}

// 2. Generate Orders for the 3 users
// Each user buys ~8-15 random products from the list to represent good activity
userIds.forEach(buyerId => {
    const numOrders = Math.floor(Math.random() * 8) + 8; // 8 to 15 orders per user

    for (let i = 0; i < numOrders; i++) {
        // Pick a random product
        const product = generatedProducts[Math.floor(Math.random() * generatedProducts.length)];
        const orderQty = Math.floor(Math.random() * 2) + 1;
        const priceAtTime = product.price;
        const totalPrice = (priceAtTime * orderQty) + product.deliveryFee;

        // Order date between product creation and now
        const productDate = new Date(product.createdAt.$date).getTime();
        const now = Date.now();
        const orderDate = new Date(productDate + Math.random() * (now - productDate));

        // Random status
        const statuses = ["pending", "processing", "shipped", "completed", "cancelled"];
        // Bias towards completed
        const status = Math.random() > 0.3 ? "completed" : statuses[Math.floor(Math.random() * statuses.length)];

        const sellerId = product.userId.$oid;
        const orderId = { "$oid": generateObjectId() };

        const orderPayload = {
            "_id": orderId,
            "buyerId": { "$oid": buyerId },
            "sellerId": { "$oid": sellerId },
            "userId": { "$oid": buyerId },
            "listingId": { "$oid": product._id.$oid },
            "itemName": product.productTitle,
            "quantity": orderQty,
            "unit": "pieces",
            "basePrice": priceAtTime * orderQty,
            "deliveryFee": product.deliveryFee,
            "totalPrice": totalPrice,
            "status": status,
            "deliveryType": "delivery",
            "orderType": "single-item",
            "paymentStatus": status === "cancelled" ? "failed" : "completed",
            "paymentMethod": "razorpay",
            "items": [
                {
                    "productId": { "$oid": product._id.$oid },
                    "quantity": orderQty,
                    "priceAtTime": priceAtTime,
                    "_id": { "$oid": generateObjectId() }
                }
            ],
            "shippingAddress": {
                "fullName": "Seeded Buyer",
                "phone": "9876543210",
                "street": "123 Main St",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pinCode": "400001",
                "country": "India"
            },
            "deliveryAddress": "123 Main St, Mumbai, Maharashtra 400001",
            "createdAt": { "$date": orderDate.toISOString() },
            "updatedAt": { "$date": orderDate.toISOString() },
            "__v": 0
        };

        if (status === "completed") {
            orderPayload.completedAt = { "$date": orderDate.toISOString() };
        }

        generatedOrders.push(orderPayload);
    }
});

// Write to files
fs.writeFileSync('seed_products_70.json', JSON.stringify(generatedProducts, null, 2));
console.log(`Successfully generated ${generatedProducts.length} products to seed_products_70.json.`);

fs.writeFileSync('seed_orders_70.json', JSON.stringify(generatedOrders, null, 2));
console.log(`Successfully generated ${generatedOrders.length} orders to seed_orders_70.json.`);
