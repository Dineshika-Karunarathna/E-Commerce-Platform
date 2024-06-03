const Product = require('../models/Product');

const addProduct = async (req,res) => {
    const product = new Product({
        // "id" :req.body.id,
        "name" : req.body.name,
        "description": req.body.description,
        "price" :req.body.price,
        "category": req.body.category,
        "stock_quantity":req.body.stock_quantity
    });
    await product.save()
        .then(success => {
            res.status(200).json({ success: true, message: product });
    })
        .catch((err) => {
            res.status(500).json({ success: false, message: err.message });
    });
};

const getAllProducts = async (req, res) =>{
    try{
        const page = parseInt(req.params.page) || 1; 
        const limit = parseInt(req.params.limit) || 10;

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find()
            .skip((page - 1) * limit)
            .limit(limit);
            
        res.status(200).json({ 
            success: true, 
            message: products,
                    pagination: {
                        totalProducts,
                        totalPages,
                        currentPage: page,
                        perPage: limit}
            });

    }catch(err){
        res.status(500).json({ success: false, message: err.message });
    };
};

const getproductsByName = async (req,res)=>{
    try{
        const name = req.params.name;
        const product = await Product.find({name:name});    
        if (product.length>0){
            res.status(200).json({ success: true, message: product });
        }
        else{
            res.status(404).json({ success: false, message: "Product not found" });
        }
    } catch(err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const updateProduct = async (req,res) =>{
    try{
        const productId = req.params.id;
        const updateData = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(productId,updateData,{new: true, runValidators:true});
        if (!updatedProduct){
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        updatedProduct.set({"updated_time" :Date.now()});
        await updatedProduct.save();
        res.status(200).json({ success: true, message: updatedProduct });
        
    } catch(err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteProduct = async(req, res) =>{
    try{
        const productId = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (deletedProduct) {
            res.status(200).json({ success: true, message: "Product deleted successfully" });
        } else {
            res.status(404).json({ success: false, message: "Product not found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    addProduct,getAllProducts,getproductsByName,updateProduct,deleteProduct
};