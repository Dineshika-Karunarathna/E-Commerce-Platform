const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

describe('Auth Controller', () => {
    let server;
    beforeAll(async() => {
        server=await app.listen(process.env.PORT);
    });
    afterAll(async() =>{
        // await mongoose.connection.dropDatabase();
        // await mongoose.connection.close();
        await new Promise((resolve)=> server.close(resolve));
    });
    afterEach(async ()=>{
        await User.deleteMany({});
    });

    describe('POST /api/register',()=>{
        it ('should register a new user', async ()=>{
            const res = await request(server)
                .post('/api/register')
                .send({
                    username:'testuser',
                    email:'testuser@example.com',
                    password:'password',
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toHaveProperty('_id');
            expect(res.body.message).toHaveProperty('username','testuser');
            expect(res.body.message).toHaveProperty('email','testuser@example.com');

        });

        it ('should return 404 if user already exists', async() =>{
            const user = new User({
                username:'testuser',
                email:'testuser1@example.com',
                password:'password'
            });
            await user.save();
            
            const res = await request(server)
                .post('/api/register')
                .send({
                    username:'testuser',
                    email:'testuser1@example.com',
                    password:'password',
                });
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('User already registered');
        });
    });

    describe('POST /api/login', () =>{
        it('should login an existing user',async()=>{
            const user = new User({
                username:'testuser',
                email:'testuser2@example.com',
                password:'password123'
            });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
            await user.save();

            const res = await request(server)
                .post('/api/login')
                .send({
                    email: 'testuser2@example.com',
                    password: 'password123',
                });
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Login successful');
            expect(res.body).toHaveProperty('token');
        });

        it('should return 404 if email is incorrect', async()=>{
            const res = await request(server)
                .post('/api/login')
                .send({
                    email: 'wrongemail@example.com',
                    password: 'password123',
                });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid email or password');
        });

        it('should return 404 if password is incorrect', async () => {

            const res = await request(server)
                .post('/api/login')
                .send({
                    email: 'testuser@example.com',
                    password: 'wrongpassword',
                });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid email or password');
        });
    })
})