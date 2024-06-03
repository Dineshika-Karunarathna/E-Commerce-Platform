const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

let mongoServer;

const connectToMongoDB = async (isTestEnv = false) => {
    const URL = isTestEnv? await startInMemoryMongoDB() : process.env.MONGODB_URL;  
    if (mongoose.connection.readyState !== 0) {
        if (mongoose.connection._connectionString !== URL) {
            await mongoose.disconnect();
        } else {
            return mongoose.connection;
        }
    }

    try {
        const connection = await mongoose.connect(URL);
        console.log("Connected to MongoDB...",URL);
        return connection;
    } catch (err) {
        console.error('Could not connect to MongoDB...', err);
        throw err;
    }
};

const startInMemoryMongoDB = async () => {
    mongoServer = await MongoMemoryServer.create();
    return mongoServer.getUri();
};

const stopInMemoryMongoDB = async () => {
    if (mongoServer) {
        await mongoose.disconnect();
        await mongoServer.stop();
    }
};


module.exports = { connectToMongoDB, stopInMemoryMongoDB };