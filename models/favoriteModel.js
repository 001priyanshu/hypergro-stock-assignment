const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
 
  stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
