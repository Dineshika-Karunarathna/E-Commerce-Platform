const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const bcrypt = require('bcrypt');
const Product = require('../models/Product')
const User = require('../models/User')
const Order = require('../models/Order')

describe('Order Controller', ()=>{
    let createdOrderIds = [];
    let admintoken1;
    let usertoken1;
    let adminUser1;
    let normalUser1;
    let product;

    beforeAll(async () =>{
        // await connectToMongoDB(true);
        server = await app.listen(process.env.PORT);

        adminUser1 = new User({
            // user_id:'12345',
            username: 'adminuser1',
            email: 'admin1@example.com',
            password:'password',
            isAdmin: true
        });
        const salt = await bcrypt.genSalt(10);
        adminUser1.password = await bcrypt.hash(adminUser1.password, salt);
        await adminUser1.save();

        const res = await request(server)
            .post('/api/login')
            .send({email: 'admin1@example.com',
                password: 'password'
            });
            admintoken1 = res.body.token;
        

        normalUser1 = new User({
            // user_id : '13427986',
            username: 'normaluser2',
            email: 'normaluser2@example.com',
            password:'password2',
            isAdmin: false
        });
        // const salt1 = await bcrypt.genSalt(10);
        normalUser1.password = await bcrypt.hash(normalUser1.password, salt);
        await normalUser1.save();

        const res1 = await request(server)
            .post('/api/login')
            .send({email: 'normaluser2@example.com',
                password: 'password2'
            });
            usertoken1 = res1.body.token;

        product = new Product({
            name: "ExampleProduct",
            description: 'This is a test product',
            price: 100,
            category: 'Test Category',
            stock_quantity: 10
        });
        await product.save();

    });

    afterEach(async() =>{
        createdOrderIds = [];
    });

    afterAll(async () =>{
        await Order.deleteMany({_id: {$in: createdOrderIds}});
        await User.deleteMany({ email: 'admin1@example.com' });
        await User.deleteMany({email: 'normaluser2@example.com'})
        await Product.deleteMany({name: 'ExampleProduct'})
        await new Promise((resolve) => server.close(resolve));    
    });

    describe('POST /api/orders/addorder', ()=>{
        it('should add a new order', async() =>{
            const res = await request(server)
                .post('/api/orders/addorder')
                .set('Authorization', `Bearer ${usertoken1}`)
                .send({
                    "product_list":[
                        {
                            "product_name":"ExampleProduct",
                            "quantity": 8
                        }
                    ] 
                });
                expect(res.status).toBe(201);
                expect(res.body.success).toBe(true);
                expect(res.body.message).toHaveProperty('_id');
                expect(res.body.message).toHaveProperty('total_price', 800);

                createdOrderIds.push(res.body.message._id);
        });

        it('should receive no product', async() =>{
            const res = await request(server)
                .post('/api/orders/addorder')
                .set('Authorization', `Bearer ${usertoken1}`)
                .send({
                    "product_list":[
                        {
                            "product_name":"ExampleProduct2",
                            "quantity": 8
                        }
                    ] 
                });
                expect(res.status).toBe(400);
                expect(res.body.success).toBe(false);
                
                expect(res.body.message).toBe('Product with name ExampleProduct2 not found');

            });
    });

    describe('GET /api/orders/allOrders', ()=>{
        it('get all orders by admin users', async()=>{
            
            const orders = [
                {user_id: adminUser1._id, product_list:[{product_id:product._id,quantity:2}], total_price:200, order_status:"pending",created_at:new Date(),updated_at:new Date()},
                {user_id: normalUser1._id, product_list:[{product_id:product._id,quantity:3}], total_price:300, order_status:"pending",created_at:new Date(),updated_at:new Date()},
                
            ];
            const savedOrders = await Order.insertMany(orders);
            createdOrderIds.push(...savedOrders.map(p=>p._id));

            const res = await request(server)
                .get('/api/orders/allOrders')
                .set('Authorization', `Bearer ${admintoken1}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 403 if the user is not an admin', async () => {
            const res = await request(server)
                .get('/api/orders/allOrders')
                .set('Authorization', `Bearer ${usertoken1}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Access denied');
        });
    });

    describe('GET /api/orders/myOrders', () => {
        it('should return the orders of the authenticated user', async () => {
            // Create orders for the normal user
            const orders = [
                {user_id: adminUser1._id, product_list:[{product_id:product._id,quantity:2}], total_price:200, order_status:"pending",created_at:new Date(),updated_at:new Date()},
                {user_id: normalUser1._id, product_list:[{product_id:product._id,quantity:3}], total_price:300, order_status:"pending",created_at:new Date(),updated_at:new Date()},
            ];
            const savedOrders = await Order.insertMany(orders);
            createdOrderIds.push(...savedOrders.map(o => o._id));

            const res = await request(server)
                .get('/api/orders/myOrders')
                .set('Authorization', `Bearer ${usertoken1}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return a message when the user has no orders', async () => {
            // Clear orders for the normal user
            await Order.deleteMany({ user_id: normalUser1._id });

            const res = await request(server)
                .get('/api/orders/myOrders')
                .set('Authorization', `Bearer ${usertoken1}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('No orders available');
        });

        it('should return 401 if the user is not authenticated', async () => {
            const res = await request(server)
                .get('/api/orders/myOrders');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Access denied, no token provided');
        });
    });

    describe('PUT /api/orders/updateStatus/:id', () => {
        it('should update the order status by admin user', async () => {
            const order1 = new Order({
                user_id: normalUser1._id,
                product_list: [{ product_id: product._id, quantity: 2 }],
                total_price: 200,
                order_status: 'pending',
                created_at: new Date(),
                updated_at: new Date()
            });
            await order1.save();
            console.log(order1._id);

            const res = await request(server)
                .put(`/api/orders/updateStatus/${order1._id}`)
                .set('Authorization', `Bearer ${admintoken1}`)
                .send({ order_status: 'shipped' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toHaveProperty('_id', order1._id.toString());
            expect(res.body.message).toHaveProperty('order_status', 'shipped');
        });

        it('should return 404 if the order does not exist', async () => {
            const nonExistentOrderId = new mongoose.Types.ObjectId();
            const res = await request(server)
                .put(`/api/orders/updateStatus/${nonExistentOrderId}`)
                .set('Authorization', `Bearer ${admintoken1}`)
                .send({ order_status: 'shipped' });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Order not found');
        });

        it('should return 403 if the user is not an admin', async () => {
            const order2 = new Order({
                user_id: normalUser1._id,
                product_list: [{ product_id: product._id, quantity: 2 }],
                total_price: 200,
                order_status: 'pending',
                created_at: new Date(),
                updated_at: new Date()
            });
            await order2.save();
            createdOrderIds.push(order2._id);

            const res = await request(server)
                .put(`/api/orders/updateStatus/${order2._id}`)
                .set('Authorization', `Bearer ${usertoken1}`)
                .send({ order_status: 'shipped' });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Access denied');
        });
    });

})