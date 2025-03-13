const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config/config');

const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization'); 
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided." });
    }

    try {
        const verified = jwt.verify(token, jwtConfig.secret); 
        req.user = verified;
        next(); 
    } catch (err) {
        res.status(403).json({ message: "Invalid or expired token." }); 
    }
};

module.exports = { authenticateToken };
