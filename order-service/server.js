const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Order Service: Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Order Model
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });
    req.user = user;
    next();
  });
};

// Routes
// Place a new order
app.post('/orders', authenticateToken, async (req, res) => {
  try {
    const { productId, productName, quantity, totalPrice } = req.body;
    
    if (!productId || !quantity || !totalPrice) {
      return res.status(400).json({ message: 'Missing order details' });
    }

    const order = new Order({
      userId: req.user.userId,
      username: req.user.username,
      productId,
      productName,
      quantity,
      totalPrice
    });

    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's orders
app.get('/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => res.send('Order Service is running'));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Order Service listening on port ${PORT}`));
