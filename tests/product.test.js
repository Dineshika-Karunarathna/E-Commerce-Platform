const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const bcrypt = require('bcrypt');
const Product = require('../models/Product')
const User = require('../models/User')

describe('Product Controller', ()=>{
    let server;
    let createdProductIds = [];
    let admintoken;
    let usertoken;

    beforeAll(async () =>{
        server = await app.listen(process.env.PORT);

        const adminUser = new User({
            username: 'adminuser',
            email: 'admin@example.com',
            password:'password',
            isAdmin: true
        });
        const salt = await bcrypt.genSalt(10);
        adminUser.password = await bcrypt.hash(adminUser.password, salt);
        await adminUser.save();

        const res = await request(server)
            .post('/api/login')
            .send({email: 'admin@example.com',
                password: 'password'
            });
            admintoken = res.body.token;
        

        const normalUser = new User({
            username: 'normaluser',
            email: 'normaluser@example.com',
            password:'password2',
            isAdmin: false
        });
        // const salt1 = await bcrypt.genSalt(10);
        normalUser.password = await bcrypt.hash(normalUser.password, salt);
        await normalUser.save();

        const res1 = await request(server)
            .post('/api/login')
            .send({email: 'normaluser@example.com',
                password: 'password2'
            });
            usertoken = res1.body.token;
        
    });

    afterAll(async () =>{
        await Product.deleteMany({_id: {$in: createdProductIds}});
        await User.deleteMany({ email: 'admin@example.com' });
        await User.deleteMany({email: 'normaluser@example.com'})
        await new Promise((resolve) => server.close(resolve));
    });

    afterEach(async() =>{
        createdProductIds = [];
    });

    describe('POST /api/products/addproduct', ()=>{
        it('should add a new product', async() =>{
            const res = await request(server)
                .post('/api/products/addproduct')
                .set('Authorization', `Bearer ${admintoken}`)
                .send({
                    name: 'Test Product',
                    description: 'This is a test product',
                    price: 100,
                    category: 'Test Category',
                    stock_quantity: 10
                });
                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.message).toHaveProperty('_id');
                expect(res.body.message).toHaveProperty('name', 'Test Product');
    
    
                createdProductIds.push(res.body.message._id);
        });

        it('should receive error', async() =>{
            const res = await request(server)
                .post('/api/products/addproduct')
                .set('Authorization', `Bearer ${admintoken}`)
                .send({
                    name: 'Test Product',
                    description: 'This is a test product',
                    price: 100,
                });
                expect(res.status).toBe(500);
                expect(res.body.success).toBe(false);
        });



    });

    describe('GET /api/products/:page/:limit', () => {
        it('should get all products with pagination', async () => {
            // Add some test products
            const products = [
                { name: 'Product 1', description: 'Desc 1', price: 10, category: 'Cat 1', stock_quantity: 10 },
                { name: 'Product 2', description: 'Desc 2', price: 20, category: 'Cat 2', stock_quantity: 20 },
                { name: 'Product 3', description: 'Desc 3', price: 30, category: 'Cat 3', stock_quantity: 30 }
            ];
            const savedProducts = await Product.insertMany(products);
            createdProductIds.push(...savedProducts.map(p => p._id));

            const res = await request(server)
                .get('/api/products/1/2') // Example: page 1, limit 2
                .set('Authorization', `Bearer ${usertoken}`); // Set the token in the header

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.pagination).toHaveProperty('totalProducts');
            expect(res.body.pagination).toHaveProperty('totalPages');
            expect(res.body.pagination).toHaveProperty('currentPage', 1);
            expect(res.body.pagination).toHaveProperty('perPage', 2);
        });

        it('should return an empty array if no products are available', async () => {
            // First delete all products to simulate no products in database
            await Product.deleteMany({});
            createdProductIds = []; // Clear the createdProductIds array

            const res = await request(server)
                .get('/api/products/1/2')
                .set('Authorization', `Bearer ${usertoken}`); // Set the token in the header

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message.length).toBe(0);
            expect(res.body.pagination).toHaveProperty('totalProducts', 0);
            expect(res.body.pagination).toHaveProperty('totalPages', 0);
            expect(res.body.pagination).toHaveProperty('currentPage', 1);
            expect(res.body.pagination).toHaveProperty('perPage', 2);
        });
    });

    describe('GET /api/products/:name', () => {
        it('should get product by name', async () => {
            // Add a test product
            const product = new Product({
                name: 'Test Product',
                description: 'This is a test product',
                price: 100,
                category: 'Test Category',
                stock_quantity: 10
            });
            const savedProduct = await product.save();
            createdProductIds.push(savedProduct._id);

            const res = await request(server)
                .get(`/api/products/${savedProduct.name}`)
                .set('Authorization', `Bearer ${usertoken}`); 

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message.length).toBeGreaterThan(0);
            expect(res.body.message[0]).toHaveProperty('_id', savedProduct._id.toString());
            expect(res.body.message[0]).toHaveProperty('name', 'Test Product');
        });

        it('should return 404 if product not found', async () => {
            const res = await request(server)
                .get('/api/products/unknown')
                .set('Authorization', `Bearer ${usertoken}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Product not found');
        });
    });

    describe('PUT /api/products/update/:id', () => {
        beforeEach(async () => {
            // Add a test product to update
            const product = new Product({
                name: 'Test Product',
                description: 'This is a test product',
                price: 100,
                category: 'Test Category',
                stock_quantity: 10
            });
            const savedProduct = await product.save();
            createdProductId = savedProduct._id;
        });

        it('should update product', async () => {
            const updatedData = {
                name: 'Updated Product',
                description: 'This is the updated product',
                price: 200,
                category: 'Updated Category',
                stock_quantity: 20
            };

            const res = await request(server)
                .put(`/api/products/update/${createdProductId}`)
                .set('Authorization', `Bearer ${admintoken}`) // Set the token in the header
                .send(updatedData);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toHaveProperty('_id', createdProductId.toString());
            expect(res.body.message).toHaveProperty('name', 'Updated Product');
            expect(res.body.message).toHaveProperty('description', 'This is the updated product');
            expect(res.body.message).toHaveProperty('price', 200);
            expect(res.body.message).toHaveProperty('category', 'Updated Category');
            expect(res.body.message).toHaveProperty('stock_quantity', 20);
        });

        it('should return 404 if product not found', async () => {
            const nonExistentProductId = new mongoose.Types.ObjectId();
            const res = await request(server)
            
                .put(`/api/products/update/${nonExistentProductId}`)
                .set('Authorization', `Bearer ${admintoken}`) // Set the token in the header
                .send({
                    name: 'Updated Product',
                    description: 'This is the updated product',
                    price: 200,
                    category: 'Updated Category',
                    stock_quantity: 20
                });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Product not found');
        });
    });

    describe('DELETE /api/products/delete/:id', () => {
        it('should delete a product by ID', async () => {
            // Create a product to be deleted
            const newProduct = new Product({
                name: 'Test Product',
                description: 'This is a test product',
                price: 100,
                category: 'Test Category',
                stock_quantity: 10
            });
            await newProduct.save();
            createdProductId = newProduct._id;

            // Send DELETE request to delete the product
            const res = await request(server)
                .delete(`/api/products/delete/${createdProductId}`)
                .set('Authorization', `Bearer ${admintoken}`)
                .expect(200);

            // Check response
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Product deleted successfully');

            // Check if the product is deleted from the database
            const deletedProduct = await Product.findById(createdProductId);
            expect(deletedProduct).toBeNull();
        });

        it('should return 404 if product ID does not exist', async () => {
            // Send DELETE request with a non-existing product ID
            const nonExistingId = new mongoose.Types.ObjectId();
            const res = await request(server)
                .delete(`/api/products/delete/${nonExistingId}`)
                .set('Authorization', `Bearer ${admintoken}`)
                .expect(404);

            // Check response
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Product not found');
        });

        it('should return 403 access denied', async()=>{
            const newProduct = new Product({
                name: 'Test Product',
                description: 'This is a test product',
                price: 100,
                category: 'Test Category',
                stock_quantity: 10
            });
            await newProduct.save();
            createdProductId = newProduct._id;

            const res = await request(server)
                .delete(`/api/products/delete/${createdProductId}`)
                .set('Authorization', `Bearer ${usertoken}`)
                .expect(403);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Access denied');
        });
            
    });
})