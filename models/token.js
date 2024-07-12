// models/order.js
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    uid: { type: mongoose.Schema.Types.Mixed, required: true },
    accountEmail: { type: String, required: true },
    accountRole: { type: String, required: true },
    accountId: { type: String, required: true },
    accountUsername: { type: String, required: true },
    tokenStartDate: { type: String, required: true },
    tokenEndDate: { type: String, required: true },
    numberToOrderBy: { type: Number, required: true }
});
  
const Token = mongoose.model('Token', tokenSchema);
  
module.exports = Token;
  