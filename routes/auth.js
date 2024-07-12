const express = require('express');
const bcrypt = require('bcrypt');
const Account = require('../models/auth');
const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
    const { uid, email, role, username, password, date,numberToOrderBy } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new Account({
            uid,
            email,
            role,
            username,
            password: hashedPassword,
            date,
            numberToOrderBy
        });

        await user.save();

        res.status(200).json({ message: "User successfully created." });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: "Error creating user" + err });
    }
});






// Get all accounts with pagination and sorting
router.get('/accounts', async (req, res) => {
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
router.patch('/account/:uid', async (req, res) => {
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
router.delete('/account/:uid', async (req, res) => {
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
/*
router.delete('/accounts', async (req, res) => {
    try {
        await Account.deleteMany({});
        res.status(200).json({ message: "All accounts successfully deleted" });
    } catch (err) {
        console.error('Error deleting accounts:', err);
        res.status(500).json({ message: "Error deleting accounts: " + err });
    }
});
*/

module.exports = router;
