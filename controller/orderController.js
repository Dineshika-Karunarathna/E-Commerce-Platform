const Order = require('../models/Order');
const Product = require('../models/Product');

const addOrder = async (req,res) => {
    try{
        const {product_list} = req.body;
        let total_price = 0;
        let productDetails = [];
        for (const item of product_list){
            const product = await Product.findOne({name: item.product_name});
            if (product){
                productDetails.push({product_id:product._id, quantity: item.quantity});
                total_price += product.price*item.quantity;
            } else{
                return res.status(400).json({ success: false, message: `Product with name ${item.product_name} not found` });
            }
        }

        const newOrder = new Order({
            user_id: req.user._id,
            product_list: productDetails,
            total_price,
            created_at: new Date(),
            updated_at: new Date()
        });

        const savedOrder = await newOrder.save();
            res.status(201).json({ success: true, message: savedOrder });
        
        
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }

};

//Only by admin users
const viewAllOrders = async (req, res) =>{
    await Order.find()

        .then(result => {
            res.status(200).json({ success: true, message: result });
    })
    .catch((err) => {
        res.status(500).json({ success: false, message: err.message });
    });
    
};

const viewMyOrders = async(req,res)=>{
    try{
        const user_id = req.user._id;
        const orders  = await Order.find({user_id:user_id});
        if(orders){
            if (orders.length>0){
                res.status(200).json({ success: true, message: orders });
            }
            else{
                res.status(200).json({ success: true, message: "No orders available" });
            }
        }else{
            res.status(404).json({ success: true, message: "Orders not found" });
        }

    }catch(err) {
        res.status(500).json({ success: false, message: err.message });
    }
    
};

const updateOrderStatus = async(req,res)=>{
    try{
        const orderId = req.params.id;
        const updateData = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(orderId,updateData,{new: true, runValidators:true});
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        updatedOrder.set({"updated_at" :Date.now()});
        await updatedOrder.save();
        
        res.status(200).json({ success: true, message: updatedOrder});
        
    } catch(err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = {
    addOrder, viewAllOrders, viewMyOrders, updateOrderStatus
};

