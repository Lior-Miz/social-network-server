const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Extract the token from the request header
    const token = req.header('Authorization');

    // If no token is provided, return an access denied error
    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        // Remove the 'Bearer ' prefix (industry standard) and verify against the secret from .env
        const cleanToken = token.replace('Bearer ', '');
        const verified = jwt.verify(cleanToken, process.env.JWT_SECRET);
        
        // Attach the verified user details to the request object (so the Controller knows who made the request)
        req.user = verified;
        
        // Pass control to the next middleware or controller function
        next();
    } catch (err) {
        // If the token is invalid or expired, return a 400 error
        res.status(400).json({ message: "Invalid Token" });
    }
};

module.exports = auth;