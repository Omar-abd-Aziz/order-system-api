const express = require('express');
const Token = require('../models/token');
const Account = require('../models/auth'); // Assuming you have an Account model


const router = express.Router();

// Register endpoint
router.post('/createToken', async (req, res) => {
    const { uid, accountEmail, accountRole, accountId, accountUsername } = req.body;

    // Validate the required fields
    if (!uid || !accountEmail || !accountRole || !accountId || !accountUsername) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Check if the accountId exists in the database
        let account = await Account.findOne({ uid: accountId });
        if (!account) {
            return res.status(404).json({ message: "error Account id" });
        }

        // Set the start date to the current date and time
        const tokenStartDate = new Date();

        // Set the end date to one week from the start date
        const tokenEndDate = new Date();
        tokenEndDate.setDate(tokenStartDate.getDate() + 7);

        // Generate a random number for ordering
        const numberToOrderBy = Math.floor(Math.random() * 1000000).toString();

        // Create a new token
        const token = new Token({
            uid,
            accountEmail,
            accountRole,
            accountId,
            accountUsername,
            tokenStartDate,
            tokenEndDate,
            numberToOrderBy
        });

        // Save the token to the database
        await token.save();

        res.status(200).json({ message: "Token successfully created.", token });
    } catch (err) {
        console.error('Error creating Token:', err);
        res.status(500).json({ message: "Error creating Token: " + err.message });
    }
});

// Check token validity endpoint
router.get('/checkToken/:tokenId', async (req, res) => {
    const { tokenId } = req.params;

    try {
        // Find the token by ID
        const token = await Token.findById(tokenId);

        if (!token) {
            return res.status(404).json({ message: "Token not found." });
        }

        // Check if the token is expired
        const currentDate = new Date();
        if (currentDate > token.tokenEndDate) {
            return res.status(200).json({ "status": false, message: "Token is expired." });
        }

        res.status(200).json({ "status": true, message: "Token is valid." });
    } catch (err) {
        console.error('Error checking Token:', err);
        res.status(500).json({ "status": false, message: "Error checking Token: " + err.message });
    }
});

module.exports = router;
