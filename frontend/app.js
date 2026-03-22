const USER_SERVICE = 'http://localhost:3001';
const PRODUCT_SERVICE = 'http://localhost:3002';
const ORDER_SERVICE = 'http://localhost:3003';

let token = localStorage.getItem('token');
let currentUser = localStorage.getItem('username');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  fetchProducts();
});

// Update UI based on auth state
function updateNav() {
  if (token) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('welcome-msg').innerText = `Welcome, ${currentUser}`;
  } else {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('user-info').style.display = 'none';
  }
}

// Authentication
async function register() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  try {
    const res = await fetch(`${USER_SERVICE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();
    alert(data.message);
  } catch (err) { alert('Error connecting to User Service'); }
}

async function login() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  try {
    const res = await fetch(`${USER_SERVICE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();
    if (res.ok) {
      token = data.token;
      currentUser = user;
      localStorage.setItem('token', token);
      localStorage.setItem('username', user);
      updateNav();
    } else {
      alert(data.message);
    }
  } catch (err) { alert('Error connecting to User Service'); }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  updateNav();
  closeOrders();
}

// Products
async function fetchProducts() {
  try {
    const res = await fetch(`${PRODUCT_SERVICE}/products`);
    const products = await res.json();
    const list = document.getElementById('products-list');
    list.innerHTML = '';
    products.forEach(p => {
      list.innerHTML += `
        <div class="card">
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <p class="price">$${p.price}</p>
          <button class="buy-btn" onclick="buyProduct('${p._id}', '${p.name}', ${p.price})">Buy Now</button>
        </div>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

async function seedProducts() {
  try {
    await fetch(`${PRODUCT_SERVICE}/products/seed`, { method: 'POST' });
    fetchProducts();
    alert('Products seeded!');
  } catch (err) { alert('Error seeding products'); }
}

// Orders
async function buyProduct(id, name, price) {
  if (!token) return alert('Please login first');
  try {
    const res = await fetch(`${ORDER_SERVICE}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        productId: id,
        productName: name,
        quantity: 1,
        totalPrice: price
      })
    });
    const data = await res.json();
    if(res.ok) alert('Order placed successfully!');
    else alert(data.message);
  } catch (err) { alert('Error connecting to Order Service'); }
}

async function viewMyOrders() {
  document.getElementById('products-section').style.display = 'none';
  document.getElementById('orders-section').style.display = 'block';
  
  try {
    const res = await fetch(`${ORDER_SERVICE}/orders/my-orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const orders = await res.json();
    const list = document.getElementById('orders-list');
    list.innerHTML = '';
    if (orders.length === 0) list.innerHTML = '<p>No orders yet.</p>';
    orders.forEach(o => {
      list.innerHTML += `
        <div class="card">
          <h3>Order ID: ${o._id.substring(0,8)}...</h3>
          <p>Product: ${o.productName}</p>
          <p>Quantity: ${o.quantity}</p>
          <p class="price">Total: $${o.totalPrice}</p>
          <p><small>${new Date(o.createdAt).toLocaleString()}</small></p>
        </div>
      `;
    });
  } catch (err) { console.error(err); }
}

function closeOrders() {
  document.getElementById('products-section').style.display = 'block';
  document.getElementById('orders-section').style.display = 'none';
}
