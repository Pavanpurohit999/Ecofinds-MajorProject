## TEAM LEAD : Pavan Purohit

## TEAM MEMBERS : 
### Pavan Purohit
### Nimisha Tamore
### Disha Raut

# EcoFinds - Sustainable Marketplace Platform

A modern e-commerce platform focused on sustainable shopping, circular economy, and eco-friendly product trading. Built for promoting reuse, refurbishment, and responsible consumption.

## 🌱 About EcoFinds

EcoFinds is a comprehensive marketplace platform that connects buyers and sellers of sustainable, second-hand, and eco-friendly products. Our mission is to reduce waste and promote circular economy principles through technology.

## 🌟 Features

### Core Marketplace Features
- **Product Listings** - List items with detailed descriptions, images, and condition ratings
- **Advanced Search & Filters** - Find products by category, condition, price range, and location
- **Real-time Orders** - Complete order management system with status tracking
- **Secure Payments** - Integrated Razorpay payment gateway for safe transactions
- **User Dashboard** - Comprehensive seller and buyer dashboards

### Sustainable Focus
- **Condition-based Ratings** - Products categorized as New, Used, or Refurbished
- **Local Discovery** - Location-based product discovery to reduce shipping impact
- **Product Lifecycle** - Track and promote product reuse and refurbishment
- **Eco-friendly Categories** - Specialized categories for sustainable products

### Technical Features
- **Responsive Design** - Seamless experience across desktop and mobile devices
- **Real-time Updates** - Live order status updates and notifications
- **Interactive Maps** - Mapbox integration for location selection and display
- **Image Management** - Cloudinary integration for optimized image storage
- **Advanced Authentication** - Secure JWT-based user authentication

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for modern, responsive styling
- **React Router** for client-side navigation
- **Heroicons** for consistent iconography
- **Mapbox GL JS** for interactive maps
- **Axios** for API communication

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for secure authentication
- **Multer** for file uploads
- **Cloudinary** for image storage and optimization
- **Razorpay** for payment processing

### Development Tools
- **ESLint** for code quality
- **Prettier** for code formatting
- **Vite** for fast build and development

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git
- Razorpay account (for payments)
- Cloudinary account (for image storage)
- Mapbox account (for maps)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/EcoFinds.git
cd EcoFinds
```

2. **Backend Setup**
```bash
cd Backend
npm install

# Create .env file with your configuration
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and API keys

# Start backend server
npm start
```

3. **Frontend Setup**
```bash
cd ../Frontend
npm install

# Create .env file with your configuration
cp .env.example .env
# Edit .env with your backend URL and API keys

# Start frontend development server
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/ecofinds
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
VITE_MAP_TOKEN=your-mapbox-access-token
```

## 📁 Project Structure

```
EcoFinds/
├── Backend/                    # Node.js API server
│   ├── src/
│   │   ├── controllers/       # API controllers
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── middlewares/      # Custom middlewares
│   │   ├── utils/            # Utility functions
│   │   └── config/           # Database and app config
│   ├── public/               # Static files
│   └── package.json
├── Frontend/                   # React user interface
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   └── landing/      # Landing page components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── context/         # React contexts
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
└── README.md
```

## 🎯 How It Works

### Product Listing Process
1. **Create Account** - Users register and verify their email
2. **Add Products** - List items with photos, descriptions, and condition details
3. **Set Location** - Use interactive maps to set pickup/delivery locations
4. **Publish** - Items go live on the marketplace

### Shopping Experience
1. **Browse Products** - Explore items by category, condition, and location
2. **Add to Cart** - Collect multiple items for purchase
3. **Secure Checkout** - Pay safely using Razorpay integration
4. **Order Tracking** - Monitor order status in real-time

### Order Management
1. **Order Placement** - Buyers place orders through the platform
2. **Seller Dashboard** - Sellers manage incoming orders
3. **Status Updates** - Real-time order status progression
4. **Completion** - Feedback and rating system for completed orders

## 🔧 Key Features Deep Dive

### Interactive Maps
- **Location Selection** - Mapbox integration for precise location picking
- **Address Geocoding** - Convert addresses to coordinates automatically
- **Visual Location Display** - Show product locations on interactive maps

### Payment System
- **Razorpay Integration** - Secure payment processing
- **Multiple Payment Methods** - Support for cards, UPI, wallets
- **Order Verification** - Automatic payment verification and order confirmation

### Image Management
- **Cloudinary Storage** - Optimized image storage and delivery
- **Multiple Images** - Support for multiple product images
- **Image Optimization** - Automatic compression and format optimization

### Real-time Updates
- **Order Status** - Live updates on order progression
- **Notification System** - Real-time notifications for important events
- **Dashboard Updates** - Live data refresh in user dashboards

## 📱 Responsive Design

EcoFinds is fully responsive and optimized for:
- **Desktop** - Full-featured experience with advanced filters
- **Tablet** - Touch-optimized interface with collapsible menus
- **Mobile** - Mobile-first design with optimized navigation

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Secure password storage with bcrypt
- **Input Validation** - Comprehensive input sanitization
- **File Upload Security** - Secure file handling and validation
- **Payment Security** - PCI-compliant payment processing

## 📊 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user
POST /api/auth/logout      # User logout
```

### Product Endpoints
```
GET    /api/products       # Get all products (with filters)
POST   /api/products       # Create new product
GET    /api/products/:id   # Get product by ID
PUT    /api/products/:id   # Update product
DELETE /api/products/:id   # Delete product
```

### Order Endpoints
```
POST /api/orders/place              # Place new order
GET  /api/orders/buyer/history      # Get buyer order history
GET  /api/orders/seller/orders      # Get seller orders
PATCH /api/orders/:id/status        # Update order status
```

### Payment Endpoints
```
POST /api/payment/create-order      # Create Razorpay order
POST /api/payment/verify           # Verify payment
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Write descriptive commit messages
- Include tests for new features
- Update documentation as needed
- Ensure responsive design compatibility

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd Frontend
npm run build

# Backend
cd Backend
npm run start
```




### Environment Setup
- Configure production environment variables
- Set up MongoDB cluster
- Configure Cloudinary for production
- Set up Razorpay production keys
- Configure domain and SSL certificates

## 📈 Future Roadmap

- [ ] **Mobile App** - React Native mobile application
- [ ] **Admin Dashboard** - Comprehensive admin panel
- [ ] **Analytics** - Advanced analytics and reporting
- [ ] **AI Recommendations** - Machine learning-based product recommendations
- [ ] **Social Features** - User profiles and social interactions
- [ ] **Multi-language** - Internationalization support
- [ ] **API Documentation** - Interactive API documentation with Swagger

## 🙏 Acknowledgments

- Built for sustainable commerce and circular economy
- Thanks to all contributors and testers
- Special thanks to the React, Node.js, and MongoDB communities
- Icons provided by Heroicons
- Maps powered by Mapbox
- Payments secured by Razorpay
- Images optimized by Cloudinary

---

⭐ **Star this repo if you found it helpful!**

**Made with 💚 for a sustainable future**
