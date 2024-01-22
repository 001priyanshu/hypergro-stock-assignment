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