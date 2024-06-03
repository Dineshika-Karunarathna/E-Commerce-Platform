const mongoose = require('mongoose');
const {connectToMongoDB, stopInMemoryMongoDB} = require('./db');

process.env.PORT = 4000;
process.env.NODE_ENV = 'test';

jest.setTimeout(30000); 

beforeAll(async () => {
    await connectToMongoDB(true);
});


afterEach(async () => {

    if (mongoose.connection.readyState === 1) {
        try {
            await mongoose.connection.dropDatabase();
        } catch (err) {
            console.error("Failed to drop database:", err);
        }
    }
});

afterAll(async () => {
    
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
    
    await stopInMemoryMongoDB();
});
