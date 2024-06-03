# E-Commerce API

## Project Overview

This project is an E-Commerce API built with Node.js, Express, MongoDB, and Jest for testing. It includes functionalities for user authentication, product management, and order processing.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [API Endpoints](#api-endpoints)
- [API Documentation](#api-documentation)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (>= 14.x)
- npm (>= 6.x)
- MongoDB (Local or MongoDB Atlas)

## Installation

1. **Clone the Repository**

```bash
git clone <Gitlab-clone-link>
cd <project-folder>
```

2. **Install Dependencies**

```bash
npm install
```

## Running the Application

1. **Start MongoDB**

Ensure MongoDB is running on your local machine or you have access to a MongoDB Atlas cluster.

2. **Run the Application**

```bash
npm start
```

The application will start, and you can access it at `http://localhost:3000`.

## Running Tests

1. **Setup Jest**

Ensure your `jest.setup.js` and `jest.config.js` are configured correctly for using an in-memory database.

2. **Run Tests**

```bash
npm test
```

## API Endpoints

### Auth Routes

- **POST /api/register** - Register a new user
- **POST /api/login** - Login an existing user

### Product Routes

- **POST /api/products/addproduct** - Add a new product (Admin only)
- **GET /api/products/:page/:limit** - Get all products with pagination
- **GET /api/products/:name** - Get product by name
- **PUT /api/products/update/:id** - Update a product (Admin only)
- **DELETE /api/products/delete/:id** - Delete a product (Admin only)

### Order Routes

- **POST /api/orders/addorder** - Add a new order
- **GET /api/orders/allOrders** - Get all orders (Admin only)
- **GET /api/orders/myOrders** - Get orders for the authenticated user
- **PUT /api/orders/updateStatus/:id** - Update order status (Admin only)

## API Documentation

The API documentation is accessible via Swagger UI. To view the API documentation:

1. Ensure the application is running.
2. Open your web browser and go to `http://localhost:3000/api-docs`.
3. Swagger UI will display all available endpoints and their details.

---
