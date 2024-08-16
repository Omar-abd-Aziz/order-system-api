// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: Number, required: true },
  name: { type: String, required: true },
  nameOfAdmin: { type: String, required: true },
  idOfAdmin: { type: String, required: true },
  emailOfAdmin: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  order: { type: String, required: true },
  detailedOrder: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: String, required: true },
  numberToOrderBy: { type: Number, required: true },
  PersonFacebookLink: { type: String, required: false },
  PersonInstgramLink: { type: String, required: false },
  PersonTikTokLink: { type: String, required: false },
  PersonTelegramLink: { type: String, required: false },
  PersonWebsiteLink: { type: String, required: false },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
