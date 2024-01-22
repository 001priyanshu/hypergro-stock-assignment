const mongoose = require('mongoose');



const stockSchema = new mongoose.Schema({
  code: String,
  name: String,
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Favorite' }],
  createdAt: Date,
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
