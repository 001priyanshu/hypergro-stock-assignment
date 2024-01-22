const express = require('express');
const router = express.Router();
const Stock = require('../models/stockModel');
const Favorite = require('../models/favoriteModel')
const mongoose = require('mongoose');


router.get('/top10', async (req, res) => {
    console.log("JJJ")
try {
    const topStocks = await Stock.find().limit(10).sort({ close: -1 });
    res.json(topStocks);
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
}
});

router.get('/search', async (req, res) => {
    const { name } =  req.query;
    console.log(name,"**");

if (!name) {
    return res.status(400).json({ error: 'Name parameter is required' });
}

try {
    const foundStocks = await Stock.find({ name: { $regex: new RegExp(name, 'i') } });
    res.json(foundStocks);
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
}
});
router.post('/favorites', async (req, res) => {
    const { stockId } = req.body;
   console.log(stockId);
    if (!stockId) {
      return res.status(400).json({ error: 'Stock ID is required' });
    }
  
    try {
      // Create a new favorite entry
      const newFavorite = new Favorite({ stock: stockId });
      await newFavorite.save();
  
      // Update the Stock model to include this favorite reference
      await Stock.findByIdAndUpdate(stockId, { $push: { favorites: newFavorite._id } });
  
      res.status(201).json(newFavorite);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/favorites', async (req, res) => {
    try {
      const favoriteStocks = await Favorite.find().populate('stock');
      res.json(favoriteStocks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Route to remove a stock from favorites
  router.delete('/favorites/:id', async (req, res) => {
    const { id } = req.params;
  
    if (!id) {
      return res.status(400).json({ error: 'ID parameter is required' });
    }
  
    try {
      // Remove the reference from the Stock model
      const favorite = await Favorite.findByIdAndDelete(id);
      await Stock.findByIdAndUpdate(favorite.stock, { $pull: { favorites: favorite._id } });
  
      res.json({ message: 'Stock removed from favorites' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/stockHistory/:code', async (req, res) => {
    const { code } = req.params;
  
    if (!code) {
      return res.status(400).json({ error: 'Code parameter is required' });
    }
  
    try {
      const currentDate = new Date();
      const fiftyDaysAgo = new Date();
      fiftyDaysAgo.setDate(fiftyDaysAgo.getDate() - 50);
     console.log(currentDate)
     console.log(fiftyDaysAgo)
      const stockData = await Stock.find({
        code,
        createdAt: { $gte: fiftyDaysAgo, $lte: currentDate },
      }).sort({ createdAt: -1 });
  
      res.json(stockData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  module.exports = router;
