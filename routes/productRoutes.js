const router = require('express').Router();
// const auth = require('../middleware/authMiddleware');
const {auth,admin} = require('../middleware/authMiddleware');
const {addProduct, getAllProducts,getproductsByName,updateProduct,deleteProduct} =require("../controller/productController");

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *         - stock_quantity
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the product
 *         name:
 *           type: string
 *           description: Name of the product
 *         description:
 *           type: string
 *           description: Detailed description of the product
 *         price:
 *           type: number
 *           format: float
 *           description: Price of the product in USD
 *         category:
 *           type: string
 *           description: Category of the product
 *         stock_quantity:
 *           type: integer
 *           description: Available stock quantity of the product
 *       example:
 *         id: "60af924411b6fc46d4f3b85a"
 *         name: "Wireless Mouse"
 *         description: "A state-of-the-art wireless mouse with ergonomic design and Bluetooth connectivity."
 *         price: 29.99
 *         category: "Electronics"
 *         stock_quantity: 150
 */

/**
 * @swagger
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *      description: Enter JWT token in the following format - Bearer [token]
 */

/**
 * @swagger
 * /api/products/addproduct:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Add a new product (Admin only)
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       500:
 *         description: Error occurred while adding the product
 */
router.post('/addproduct',[auth,admin], addProduct);

/**
 * @swagger
 * /api/products/{page}/{limit}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieve all products with pagination
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         description: Page number
 *       - in: path
 *         name: limit
 *         schema:
 *           type: integer
 *         required: true
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Error occurred while retrieving products
 */
router.get('/:page/:limit',auth,getAllProducts);

/**
 * @swagger
 * /api/products/{name}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Search products by name
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Product name to search
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error occurred while retrieving the product
 */
router.get('/:name',auth,getproductsByName);

/**
 * @swagger
 * /api/products/update/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update product details (Admin only)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error occurred while updating the product
 */
router.put('/update/:id',[auth,admin],updateProduct);

/**
 * @swagger
 * /api/products/delete/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a product (Admin only)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the product to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error occurred while deleting the product
 */
router.delete('/delete/:id',[auth,admin],deleteProduct);

module.exports=router;