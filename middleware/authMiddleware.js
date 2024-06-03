const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ success: false, message: 'Invalid token' });
    }
};

const admin = (req, res, next) =>{

    if (!req.user.isAdmin) {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
}
module.exports = {auth, admin};
