// Define the expected admin code
const expectedAdminCode = "omarvenom1234";

// Middleware to verify admin code from headers
const verifyAdminCode = (req, res, next) => {
    const adminCodeFromHeader = req.headers['admincode'];

    if (!adminCodeFromHeader) {
        // Error message for missing admin code in the header
        return res.status(400).json({ 
            "statue": false, 
            "error": "Admin code must be provided in the request headers under the key 'admincode'." 
        });
    }

    if (adminCodeFromHeader === expectedAdminCode) {
        next(); // Admin code is correct, proceed to the next middleware or route handler
    } else {
        // Error message for incorrect admin code
        res.status(403).json({ 
            "statue": false, 
            "error": `Admin code from header: '${adminCodeFromHeader}' is incorrect.` 
        });
    }
};

module.exports = verifyAdminCode;
