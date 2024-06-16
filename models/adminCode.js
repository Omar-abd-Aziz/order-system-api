// models/order.js
const mongoose = require('mongoose');

const adminCodeSchema = new mongoose.Schema({
    adminCode: { type: String, required: true }
});
  
const AdminCode = mongoose.model('AdminCode', adminCodeSchema);
  
module.exports = AdminCode;
  