const Token = require('../models/token');

const verifyToken = async (req, res, next) => {
    const tokenValue = req.headers['authorization'];


    if (!tokenValue) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    try {
        // Find the token in the database
        const token = await Token.findById(tokenValue);

        if (!token) {
            console.log('Invalid token.');
            return res.status(401).json({ message: 'Invalid token.',token: token });
        }

        // Check if the token is expired
        const currentDate = new Date();
        if (currentDate > token.tokenEndDate) {
            console.log('Token is expired.');
            return res.status(401).json({ message: 'Token is expired.' });
        }

        // Token is valid, proceed to the next middleware or route handler
        next();
    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(500).json({ message: 'Error verifying token: ' + err.message });
    }
};

module.exports = verifyToken;
