// models/order.js
const mongoose = require('mongoose');

const labelsSchema = new mongoose.Schema({
    labels: { type: Array, required: true },
    nameOfAdmin: { type: String, required: true },
    idOfAdmin: { type: String, required: true },
    emailOfAdmin: { type: String, required: true },
});
  
const Labels = mongoose.model('Labels', labelsSchema);
  
module.exports = Labels;