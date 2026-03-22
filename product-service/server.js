const express = require('express');
const mongoose = require('mongoose');
const { createClient } = require('redis');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Product Service: Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Redis Connection
const redisClient = createClient({
  url: process.env.REDIS_URL
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().then(() => console.log('Product Service: Connected to Redis'));

// Product Model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 }
});
const Product = mongoose.model('Product', productSchema);

// Cache Middleware
const checkCache = async (req, res, next) => {
  try {
    const data = await redisClient.get('all_products');
    if (data) {
      console.log('Serving from Redis cache');
      return res.json(JSON.parse(data));
    }
    next();
  } catch (err) {
    console.error('Redis error', err);
    next();
  }
};

// Routes
// Get all products with caching
app.get('/products', checkCache, async (req, res) => {
  try {
    const products = await Product.find({});
    // Cache for 1 hour
    await redisClient.setEx('all_products', 3600, JSON.stringify(products));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new product (and invalidate cache)
app.post('/products', async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    if (!name || price == null) return res.status(400).json({ message: 'Name and price are required' });

    const product = new Product({ name, description, price, stock });
    await product.save();

    // Invalidate cache
    await redisClient.del('all_products');

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed Initial Products
app.post('/products/seed', async (req, res) => {
  try {
    await Product.deleteMany({});
    await Product.insertMany([
      { name: 'Laptop', description: 'High-end gaming laptop', price: 1500, stock: 10 },
      { name: 'Smartphone', description: 'Latest model 5G phone', price: 800, stock: 50 },
      { name: 'Headphones', description: 'Noise-cancelling over-ear headphones', price: 200, stock: 100 }
    ]);
    await redisClient.del('all_products');
    res.json({ message: 'Demo products seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => res.send('Product Service is running'));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Product Service listening on port ${PORT}`));
