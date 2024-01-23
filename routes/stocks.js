const express = require('express');
const router = express.Router();
const Stock = require('../models/stockModel');
const Favorite = require('../models/favoriteModel')
const mongoose = require('mongoose');


router.get('/top10', async (req, res) => {

  try {
    const topStocks = await Stock.find().limit(10).sort({ close: -1 });
    res.json(topStocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/search', async (req, res) => {
  const { name } = req.query;
  console.log(name, "**");

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
    const newFavorite = new Favorite({ stock: stockId });
    await newFavorite.save();

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

router.delete('/favorites/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);

  if (!id) {
    return res.status(400).json({ error: 'ID parameter is required' });
  }

  try {
    const favorite = await Favorite.findByIdAndDelete(id);
    if(!favorite){
     return res.json({message:'Stock not available'})
    }
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

router.get('/stocksByDate/:date', async (req, res) => {
  const requestedDate = new Date(req.params.date);

  try {
    const stocksOnDate = await Stock.find({
      createdAt: {
        $gte: requestedDate,
        $lt: new Date(requestedDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    res.json(stocksOnDate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

