const mongoose = require('mongoose');

const orderSchema= mongoose.Schema({
    user_id:{
        type:mongoose.Types.ObjectId,
        ref: 'User',
        required:true
    },
    product_list:[
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    total_price :{
        type:Number,
        required:true
    },
    order_status :{
        type:String,
        required:true,
        enum:['pending','shipped','delivered'],
        lowercase:true,
        trim:true,
        default:'pending'
    },
    created_at: {
        type: Date,
        default: Date.now,
        required: true
    },
    updated_at: {
        type: Date,
        default: Date.now,
        required: true
    }   
});

module.exports = mongoose.model('Orders',orderSchema);