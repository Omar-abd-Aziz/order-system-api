// models/order.js
const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    totalPrice: { type: Number, required: true },
    goal: { type: Number, required: true },
    count: { type: Number, required: true },
    date: { type: String, required: true }
});
  
const Goal = mongoose.model('Goal', goalSchema);
  
module.exports = Goal;
  