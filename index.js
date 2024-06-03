const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const setupSwagger = require('./config/swagger');
const {connectToMongoDB} = require('./config/db');
const prod = require('./config/prod');

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

app.use('/api/products',productRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api',authRoutes);

setupSwagger(app);
prod(app);

const isTestEnv = process.env.NODE_ENV === 'test';
connectToMongoDB(isTestEnv);

if (!isTestEnv){
    const port  = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log("Server is running on", port);
    });
}


module.exports = app