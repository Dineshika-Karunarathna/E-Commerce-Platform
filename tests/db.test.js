const mongoose = require('mongoose');
const {connectToMongoDB} = require('../config/db');

describe('Database Connection', () => {
  it('should connect to the database successfully', async () => {
    const connection = await connectToMongoDB(true);
    // console.log(connection);
    expect(connection).toBeDefined();
  });
});

