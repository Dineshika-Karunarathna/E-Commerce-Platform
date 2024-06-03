require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const register = async (req,res) => {
    try{
        let user = await User.findOne({email: req.body.email});
        if (user){
            res.status(404).json({ success: false, message: "User already registered" });
        }else{
            user = new User({
                "username" : req.body.username,
                "email": req.body.email,
                "password" :req.body.password
            });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
            await user.save()
                .then(success => {
                    res.status(200).json({ success: true, message: user });
                })
                .catch((err) => {
                    res.status(500).json({ success: false, message: err.message });
                });
        };
    }catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const login = async (req,res)=>{
    try{
        const user = await User.findOne({email: req.body.email});
        if (!user){
            return res.status(404).json({ success: false, message: 'Invalid email or password' });
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword){
            return res.status(404).json({ success: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, process.env.ACCESS_TOKEN_SECRET);
        res.status(200).json({ success: true, message: 'Login successful', token});
        // res.status(200).json({ success: true, message: 'Login successful' });

    }catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }

}

module.exports = {
    register, login
};