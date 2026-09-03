const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const addressRoutes = require('./routes/addressRoutes');
const couponRoutes = require('./routes/couponRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const path = require('path');
const app = express();

// Serve static images (both /images and /public/images)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { checkSupabaseConnection, isSupabaseConfigured } = require('./config/supabase');

// Health Check
app.get('/api/health', async (req, res) => {
  const supabaseHealth = await checkSupabaseConnection();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Alakar Auto Parts API (Pudukkottai)',
    store: {
      name: 'Alakar Auto Parts',
      owner: 'Surendar',
      phone: '8526613000',
      address: 'West Main Street, Old GH road, Near murugan kovil, Pudukkottai',
    },
    supabase: {
      configured: isSupabaseConfigured(),
      ...supabaseHealth,
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
