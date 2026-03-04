const fs = require('fs');
const crypto = require('crypto');

// The 3 user IDs provided by the user
const userIds = [
    "693afd51a682acc7b74279e2",
    "693afd89a682acc7b7427a16",
    "69a1d8d8a1abaeedd9ade1b8"
];

const categoryConfig = {
    "Mobiles": {
        "brands": ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi"],
        "types": {
            "Smartphone": "https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg",
            "Android Phone": "https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg",
            "iPhone Clone": "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg",
            "5G Mobile": "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg",
            "Flagship Phone": "https://images.pexels.com/photos/1447254/pexels-photo-1447254.jpeg"
        }
    },
    "Bikes": {
        "brands": ["Honda", "Yamaha", "Royal Enfield", "Bajaj", "TVS"],
        "types": {
            "Cruiser Bike": "https://images.pexels.com/photos/2626665/pexels-photo-2626665.jpeg",
            "Sports Bike": "https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg",
            "Electric Scooter": "https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg",
            "Mountain Bike": "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg",
            "Commuter Motorcycle": "https://images.pexels.com/photos/2393835/pexels-photo-2393835.jpeg"
        }
    },
    "Electronics & Appliances": {
        "brands": ["Sony", "LG", "Samsung", "Dell", "HP", "Canon", "Bose", "Panasonic"],
        "types": {
            "4K Smart TV": "https://images.pexels.com/photos/5202917/pexels-photo-5202917.jpeg",
            "Air Purifier": "https://images.pexels.com/photos/3861936/pexels-photo-3861936.jpeg",
            "Coffee Maker": "https://images.pexels.com/photos/2878709/pexels-photo-2878709.jpeg",
            "Robot Vacuum": "https://images.pexels.com/photos/844874/pexels-photo-844874.jpeg",
            "Microwave Oven": "https://images.pexels.com/photos/8142867/pexels-photo-8142867.jpeg",
            "Bluetooth Speaker": "https://images.pexels.com/photos/31683433/pexels-photo-31683433.jpeg",
            "Gaming Console": "https://images.pexels.com/photos/1365795/pexels-photo-1365795.jpeg",
            "Laptop": "https://images.pexels.com/photos/109371/pexels-photo-109371.jpeg",
            "Tablet": "https://images.pexels.com/photos/8533358/pexels-photo-8533358.jpeg"
        }
    },
    "Furniture": {
        "brands": ["IKEA", "Urban Ladder", "Sleepwell", "Godrej Interio"],
        "types": {
            "Ergonomic Chair": "https://images.pexels.com/photos/4930018/pexels-photo-4930018.jpeg",
            "Dining Table": "https://images.pexels.com/photos/931007/pexels-photo-931007.jpeg",
            "Sofa Set": "https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg",
            "Bookshelf": "https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg",
            "Coffee Table": "https://images.pexels.com/photos/2092058/pexels-photo-2092058.jpeg",
            "TV Stand": "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
            "Bed Frame": "https://images.pexels.com/photos/6585598/pexels-photo-6585598.jpeg"
        }
    },
    "Fashion": {
        "brands": ["Nike", "Adidas", "Zara", "H&M", "Levi's", "Puma", "Ray-Ban", "Casio"],
        "types": {
            "Leather Jacket": "https://images.pexels.com/photos/983497/pexels-photo-983497.jpeg",
            "Designer Sunglasses": "https://images.pexels.com/photos/249210/pexels-photo-249210.jpeg",
            "Sneakers": "https://images.pexels.com/photos/1476209/pexels-photo-1476209.jpeg",
            "Running Shoes": "https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg",
            "Winter Coat": "https://images.pexels.com/photos/253331/pexels-photo-253331.jpeg",
            "Formal Suit": "https://images.pexels.com/photos/372176/pexels-photo-372176.jpeg",
            "Luxury Watch": "https://images.pexels.com/photos/3829441/pexels-photo-3829441.jpeg"
        }
    },
    "Books, Sports & Hobbies": {
        "brands": ["Fender", "Gibson", "Wilson", "Spalding", "Nikon", "Canon", "Yamaha"],
        "types": {
            "Acoustic Guitar": "https://images.pexels.com/photos/1010519/pexels-photo-1010519.jpeg",
            "Yoga Mat": "https://images.pexels.com/photos/374101/pexels-photo-374101.jpeg",
            "Golf Club Set": "https://images.pexels.com/photos/1325617/pexels-photo-1325617.jpeg",
            "Fiction Novel Set": "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg",
            "Tennis Racket": "https://images.pexels.com/photos/5730335/pexels-photo-5730335.jpeg",
            "DSLR Camera": "https://images.pexels.com/photos/51383/pexels-photo-51383.jpeg"
        }
    },
    "Cars": {
        "brands": ["Toyota", "Honda", "Hyundai", "Tesla", "BMW", "Mercedes", "Audi", "Ford"],
        "types": {
            "Sedan": "https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg",
            "SUV": "https://images.pexels.com/photos/119435/pexels-photo-119435.jpeg",
            "Hatchback": "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg",
            "Electric Car": "https://images.pexels.com/photos/9800029/pexels-photo-9800029.jpeg",
            "Convertible": "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg"
        }
    },
    "Properties": {
        "brands": ["DLF", "Lodha", "Hiranandani", "Godrej Properties"],
        "types": {
            "1BHK Apartment": "https://images.pexels.com/photos/5417293/pexels-photo-5417293.jpeg",
            "Studio Flat": "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg",
            "Office Space": "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg",
            "Farmhouse": "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg"
        }
    },
    "Commercial Vehicles & Spares": {
        "brands": ["Tata Motors", "Ashok Leyland", "Mahindra", "Eicher", "BharatBenz"],
        "types": {
            "Cargo Truck": "https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg",
            "Tractor": "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg",
            "Spare Engine Parts": "https://images.pexels.com/photos/7565164/pexels-photo-7565164.jpeg",
            "Commercial Van": "https://images.pexels.com/photos/459422/pexels-photo-459422.jpeg"
        }
    },
    "Services": {
        "brands": ["Urban Company", "EcoClean", "ProFix", "TutorMe"],
        "types": {
            "Plumbing Service": "https://images.pexels.com/photos/709749/pexels-photo-709749.jpeg",
            "Graphic Design Setup": "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg",
            "House Cleaning": "https://images.pexels.com/photos/3616735/pexels-photo-3616735.jpeg",
            "Tutoring Package": "https://images.pexels.com/photos/6325984/pexels-photo-6325984.jpeg"
        }
    }
};

const adjectives = ["Premium", "Vintage", "Modern", "Refurbished", "Like-New", "Sleek", "Durable", "High-Performance", "Eco-Friendly", "Compact", "Heavy-Duty", "Portable", "Antique"];
const categories = Object.keys(categoryConfig);

const generatedProducts = [];
const generatedOrders = [];

const generateObjectId = () => crypto.randomBytes(12).toString("hex");

// 1. Generate 200 products
console.log("Generating 200 products...");
for (let i = 0; i < 200; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const config = categoryConfig[cat];
    const types = Object.keys(config.types);
    const type = types[Math.floor(Math.random() * types.length)];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const brand = config.brands[Math.floor(Math.random() * config.brands.length)];

    const title = `${adj} ${type}`;
    const baseUrl = config.types[type];
    const imgUrl = `${baseUrl}?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1`;

    let price = Math.floor(Math.random() * 45000) + 500;
    if (cat === "Cars" || cat === "Properties" || cat === "Commercial Vehicles & Spares") {
        price = price * 20;
    }

    const randomDaysAgo = Math.floor(Math.random() * 300);
    const createdAt = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000);
    const randomSellerId = userIds[Math.floor(Math.random() * userIds.length)];
    const productId = generateObjectId();

    generatedProducts.push({
        "_id": { "$oid": productId },
        "userId": { "$oid": randomSellerId },
        "productTitle": title,
        "productCategory": cat,
        "productDescription": `Experience excellence with this ${title}. A perfect sustainable choice in the ${cat} category. Features premium build quality and reliable performance from ${brand}.`,
        "price": price,
        "quantity": Math.floor(Math.random() * 10) + 1,
        "condition": ["New", "Used", "Refurbished"][Math.floor(Math.random() * 3)],
        "brand": brand,
        "imageUrl": imgUrl,
        "imageUrls": [imgUrl],
        "imageDetails": [{
            "url": imgUrl,
            "publicId": `seed_${i}`,
            "isPrimary": true
        }],
        "soldCount": Math.floor(Math.random() * 20),
        "tags": [cat.toLowerCase().split(' ')[0], brand.toLowerCase(), "quality", "ecofinds"],
        "location": {
            "lat": 19.076 + (Math.random() * 0.1 - 0.05),
            "lng": 72.8777 + (Math.random() * 0.1 - 0.05),
            "address": "Mumbai, Maharashtra"
        },
        "deliveryAvailable": true,
        "deliveryFee": price > 10000 ? 0 : 150,
        "isActive": true,
        "viewCount": Math.floor(Math.random() * 2000) + 50,
        "createdAt": { "$date": createdAt.toISOString() },
        "updatedAt": { "$date": new Date().toISOString() },
        "__v": 0
    });
}

// 2. Generate ~120 orders
console.log("Generating 120 orders...");
for (let i = 0; i < 120; i++) {
    const product = generatedProducts[Math.floor(Math.random() * generatedProducts.length)];
    const buyerId = userIds.filter(id => id !== product.userId.$oid)[Math.floor(Math.random() * 2)];

    const orderQty = Math.floor(Math.random() * 2) + 1;
    const priceAtTime = product.price;
    const totalPrice = (priceAtTime * orderQty) + product.deliveryFee;

    const productDate = new Date(product.createdAt.$date).getTime();
    const now = Date.now();
    const orderDate = new Date(productDate + Math.random() * (now - productDate));

    const status = Math.random() > 0.4 ? "completed" : ["pending", "processing", "shipped", "cancelled"][Math.floor(Math.random() * 4)];

    const orderPayload = {
        "_id": { "$oid": generateObjectId() },
        "buyerId": { "$oid": buyerId },
        "sellerId": product.userId,
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

// Write to files
const productFiles = ['seed_products_70.json', 'seed_products.json', 'seed_products_extended.json'];
const orderFiles = ['seed_orders_70.json', 'seed_orders.json'];

productFiles.forEach(file => {
    fs.writeFileSync(file, JSON.stringify(generatedProducts, null, 2));
    console.log(`Saved ${generatedProducts.length} products to ${file}`);
});

orderFiles.forEach(file => {
    fs.writeFileSync(file, JSON.stringify(generatedOrders, null, 2));
    console.log(`Saved ${generatedOrders.length} orders to ${file}`);
});
