const swaggerjsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce API',
            version: '1.0.0',
            description: 'RESTful API Documentation for a e-commerce platform',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],  
    },
    apis: [
        path.join(__dirname, '../routes/AuthRoutes.js'),
        path.join(__dirname, '../routes/productRoutes.js'),
        path.join(__dirname, '../routes/orderRoutes.js'),
    ]    
};

const specs = swaggerjsdoc(options);

const setupSwagger = (app) =>{
    app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(specs));
};

module.exports = setupSwagger;