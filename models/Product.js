const mongoose = require('mongoose');

const productSchema= mongoose.Schema({
    // id:{
    //     type:Number,
    //     required:true
    // },
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price :{
        type:Number,
        required:true
    },
    category :{
        type:String,
        required:true
    },
    stock_quantity :{
        type:Number,
        required:true
    },
    created_time:{
        type:Date,
        default:Date.now,
        required:true
    },
    updated_time:{
        type:Date,
        default:Date.now,
        required:true
    },
});


module.exports = mongoose.model('Product',productSchema);