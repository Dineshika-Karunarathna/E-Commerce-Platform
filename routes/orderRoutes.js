const router = require('express').Router();
const {auth,admin} = require('../middleware/authMiddleware');
const {addOrder, viewAllOrders, viewMyOrders,updateOrderStatus} =require("../controller/orderController");

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
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - user_id
 *         - product_list
 *         - total_price
 *         - order_status
 *         - created_at
 *         - updated_at
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: Reference ID of the user who placed the order
 *         product_list:
 *           type: array
 *           description: List of products and quantities in the order
 *           items:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *                 description: Reference ID of the ordered product
 *               quantity:
 *                 type: integer
 *                 description: Quantity of the product ordered
 *         total_price:
 *           type: number
 *           format: double
 *           description: Total price of the order
 *         order_status:
 *           type: string
 *           description: Status of the order
 *           enum:
 *             - pending
 *             - shipped
 *             - delivered
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the order was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the order was last updated
 *       example:
 *         user_id: "5f8d04b6c7a9d3d2c2e6a5f1"
 *         product_list:
 *           - product_id: "5f8f8d8d8d4f8d8f4d8f8d8f"
 *             quantity: 2
 *         total_price: 39.98
 *         order_status: "pending"
 *         created_at: "2021-10-22T14:48:00.000Z"
 *         updated_at: "2021-10-22T14:48:00.000Z"
 */


/**
 * @swagger
 * /api/orders/addorder:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Add a new order
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_list:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_name
 *                     - quantity
 *                   properties:
 *                     product_name:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *             example:
 *               product_list:
 *                 - product_name: "Wireless Mouse"
 *                   quantity: 1
 *     responses:
 *       201:
 *         description: Order has been created successfully
 *       400:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post('/addorder',auth, addOrder);

/**
 * @swagger
 * /api/orders/allOrders:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: View all orders (Admin only)
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: A list of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 */
router.get('/allOrders',[auth, admin], viewAllOrders);

/**
 * @swagger
 * /api/orders/myOrders:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: View all orders of the logged-in user
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: A list of orders from the logged-in user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       404:
 *         description: No orders available
 *       500:
 *         description: Server error
 */
router.get('/myOrders',auth,viewMyOrders);

/**
 * @swagger
 * /api/orders/updateStatus/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update the status of an order (Admin only)
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *             example:
 *               order_status: "Shipped"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put('/updateStatus/:id',[auth,admin], updateOrderStatus);
module.exports=router;