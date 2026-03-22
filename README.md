# 3-Tier Microservices Architecture Demo

This project is a beginner-friendly 3-tier microservices application built with **Node.js, Express, MongoDB, and Vanilla HTML/JS**. It demonstrates a basic E-commerce flow without overwhelming complexities like API Gateways or Service Registries.

## 🏗️ Architecture Overview

The system consists of a Vanilla JS frontend and 3 distinct backend microservices:

1. **User Service (Port 3001)**: Handles User Registration and Login using JWT authentication.
2. **Product Service (Port 3002)**: Handles Product catalog. It uses **Redis Caching** to speed up product fetching.
3. **Order Service (Port 3003)**: Handles order placements. It requires a valid JWT token (passed through headers) to ensure only authenticated users can place orders.

**Databases needed**:
- MongoDB (for storing users, products, and orders)
- Redis (for caching product requests)

---

## 📂 Project Structure

```
.
├── frontend/
│   ├── index.html       # Main UI Layout
│   ├── style.css        # Simple, responsive styling
│   └── app.js           # API connections to microservices
├── user-service/
│   ├── package.json
│   ├── server.js        # Auth logic (bcrypt, JWT)
│   └── .env.example     # Environment variable template
├── product-service/
│   ├── package.json
│   ├── server.js        # Product catalog & Redis caching logic
│   └── .env.example
└── order-service/
    ├── package.json
    ├── server.js        # Order logic & JWT verification middleware
    └── .env.example
```

---

## 🚀 Setup & Local Deployment Guide

Your task is to take this source code and orchestrate it using Docker / Docker Compose. Here is what you need to know:

### 1. Environment Variables (`.env`)
Each service folder contains an `.env.example` file. 
When containerizing, make sure to pass these environment variables or rename `.env.example` to `.env` during local testing.

*Example for User Service:*
- `PORT=3001`
- `MONGO_URI=mongodb://root:example@mongo-db:27017/user_db?authSource=admin`
- `JWT_SECRET=supersecretjwtkey123` *(Must match across User & Order services!)*

*Example for Product Service:*
- Requires `REDIS_URL` in addition to Mongo. E.g., `redis://redis-cache:6379`

### 2. Networking Services
When creating your Docker network:
- Spin up a **MongoDB container** (e.g., named `mongo-db`).
- Spin up a **Redis container** (e.g., named `redis-cache`).
- Point your microservices' `MONGO_URI` and `REDIS_URL` to these container names.

### 3. Running the Backend Services
Install dependencies and start each service:
```bash
# In each service directory (user-service, product-service, order-service):
npm install
npm start
```

### 4. Running the Frontend
There is NO build step. The frontend relies purely on Vanilla HTML/CSS/JS.
Simply open `frontend/index.html` in your browser.
*(Ensure your browser allows local file access, or use a tool like VSCode Live Server).*

### 5. Using the Application (Testing Flow)
1. **Products Setup**: Once the Product Service is running, copy the URL and click the **"Seed Demo Products"** button in the UI, or send a `POST` request to `http://localhost:3002/products/seed` to populate the database.
2. **Register**: Go to the UI, enter a username and password, and click **Register**.
3. **Login**: Click **Login** – this grabs the JWT token and saves it in your browser (`localStorage`).
4. **Buy Products**: Click **Buy Now** on any product. The UI will send the JWT token to the Order Service to securely place an order.
5. **View Orders**: Click **My Orders** to fetch your personalized order history from the Order Service.

---

## 💡 DevOps Practice Objectives
As part of your DevOps practice, you should now:
1. Write a `Dockerfile` for each microservice (`user-service`, `product-service`, `order-service`).
2. Write a `docker-compose.yml` in the root directory that brings up:
   - Database: MongoDB
   - Cache: Redis
   - 3 Backend Services
   - 1 Frontend App (You could serve this via an Nginx container)
3. Ensure that the microservices communicate with MongoDB/Redis via the internal Docker network, while mapping ports (3001, 3002, 3003) to your host so the Vanilla JS frontend can reach them.

Happy coding! Let me know if you need help with the Dockerization process after reviewing the code.
