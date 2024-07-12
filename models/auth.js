// models/order.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    uid: { type: mongoose.Schema.Types.Mixed, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    date: { type: String, required: true },
    numberToOrderBy: { type: Number, required: true }
});
  
const Account = mongoose.model('Account', accountSchema);
  
module.exports = Account;
  