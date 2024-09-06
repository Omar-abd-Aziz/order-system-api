const express = require('express');
const bcrypt = require('bcrypt');
const Token = require('../models/token');
// auth.js

const Account = require('../models/auth');
const router = express.Router();

const verifyAdminCode = require('../middleware/verfiyAdminCode'); // Path to your verifyToken middleware


const admin = require('firebase-admin');

require('dotenv').config();

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);




admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});


// Register endpoint
router.post('/register',verifyAdminCode, async (req, res) => {
    const {  email, role, username, password, date,numberToOrderBy } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }


    

    try {

        // Check if the email is already registered
        const existingUserEmail = await Account.findOne({ email });
        if (existingUserEmail) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        // Check if the username is already used
        const existingUserUsername = await Account.findOne({ username });
        if (existingUserUsername) {
            return res.status(400).json({ message: "Username is already used. Choose another one." });
        }


        try {
            const userRecord = await admin.auth().createUser({
                email: email,
                password: password,
            });
    
            console.log('Successfully created new user:', userRecord.uid);
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new Account({
                uid: userRecord.uid,
                email,
                role,
                username,
                password: hashedPassword,
                date,
                numberToOrderBy
            });
    
            await user.save();

            res.status(200).json({ message: "User successfully created." });
        } catch (error) {
            console.error('Error creating new user:', error);
            res.status(500).json({ message: "Error creating user: " + error.message });
        }






    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: "Error creating user" + err });
    }
});




// Endpoint to send password reset email
router.post('/sendPasswordReset', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    try {
        await admin.auth().generatePasswordResetLink(email);
        console.log(`Password reset email sent to ${email}`);
        res.status(200).json({ message: "Password reset email sent. Please check your email inbox." });
    } catch (error) {
        console.error("Error sending password reset email:", error.message);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});



// Get all accounts with pagination and sorting
router.get('/accounts',verifyAdminCode, async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'numberToOrderBy', order = 'asc' } = req.query;

  try {
      const sortOrder = order === 'asc' ? 1 : -1;
      const accounts = await Account.find()
          .sort({ [sortBy]: sortOrder })
          .skip((page - 1) * limit)
          .limit(Number(limit));

      const totalAccounts = await Account.countDocuments();

      res.status(200).json({
          totalPages: Math.ceil(totalAccounts / limit),
          currentPage: page,
          totalAccounts,
          accounts,
      });
  } catch (err) {
      console.error('Error fetching accounts:', err);
      res.status(500).json({ message: "Error fetching accounts" });
  }
});


// Edit account endpoint
router.patch('/account/:uid',verifyAdminCode, async (req, res) => {
  const { uid } = req.params;
  const { email, role, username, password, date, numberToOrderBy } = req.body;

  try {
      const account = await Account.findOne({ uid: uid });
      if (!account) {
          return res.status(404).json({ message: "Account not found" });
      }

      // Update fields
      account.email = email ?? account.email;
      account.role = role ?? account.role;
      account.username = username ?? account.username;
      account.date = date ?? account.date;
      account.numberToOrderBy = numberToOrderBy ?? account.numberToOrderBy;

      if (password) {
          if (password.length < 6) {
              return res.status(400).json({ message: "Password must be at least 6 characters" });
          }
          account.password = await bcrypt.hash(password, 10);
      }

      await account.save();

      res.status(200).json({ message: "Account successfully updated", account });
  } catch (err) {
      console.error('Error updating account:', err);
      res.status(500).json({ message: "Error updating account: " + err });
  }
});








// Get account with uid endpoint
router.get('/account/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        const account = await Account.findOne({ uid: uid });
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        res.status(200).json({ message: "Account found", account });
    } catch (err) {
        res.status(500).json({ message: "Error: " + err });
    }
});




// POST endpoint for verifying the ID token
router.post('/sign-in', async (req, res) => {
    const { idToken } = req.body;

    try {
        // Verify the ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Fetch the account details from the database using the user's UID
        const account = await Account.findOne({ uid: uid });
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Create a token object with user details
        const tokenObject = {
            uid: Math.floor(Math.random() * 100000000000).toString(),
            accountEmail: account.email,
            accountRole: account.role,
            accountId: account.uid,
            accountUsername: account.username
        };


        // Call createToken function
        const token = await createToken(tokenObject);

        // Respond with the token
        return res.status(200).json({ token });

    } catch (error) {
        console.error("Error signing in:", error.message);
        return res.status(500).json({ message: "Error signing in: " + error.message });
    }
});





// Get count of users with this username endpoint
router.get('/account/count/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const count = await Account.countDocuments({ username: username });
        res.status(200).json({ count, message: count > 0 ? "Username is used" : "Username not used" });
    } catch (err) {
        res.status(500).json({ message: "Error: " + err });
    }
});



// Delete account with uid endpoint
router.delete('/account/:uid',verifyAdminCode, async (req, res) => {
    const { uid } = req.params;

    try {
        const account = await Account.findOneAndDelete({ uid: uid });
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        res.status(200).json({ message: "Account successfully deleted", account });
    } catch (err) {
        console.error('Error deleting account:', err);
        res.status(500).json({ message: "Error deleting account: " + err });
    }
});


// Delete all accounts endpoint

router.delete('/accounts', async (req, res) => {
    try {
        await Account.deleteMany({});
        res.status(200).json({ message: "All accounts successfully deleted" });
    } catch (err) {
        console.error('Error deleting accounts:', err);
        res.status(500).json({ message: "Error deleting accounts: " + err });
    }
});





async function createToken({ uid, accountEmail, accountRole, accountId, accountUsername }) {
    if (!uid || !accountEmail || !accountRole || !accountId || !accountUsername) {
        throw new Error("All fields are required.");
    }

    const tokenStartDate = new Date();
    const tokenEndDate = new Date();
    tokenEndDate.setDate(tokenStartDate.getDate() + 7);

    const numberToOrderBy = Math.floor(Math.random() * 1000000).toString();

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

    await token.save();

    return token._id;
}



module.exports = router;
