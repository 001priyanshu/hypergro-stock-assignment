const Stock = require('../models/stockModel');
const mongoose = require('mongoose');

const saveToDatabase = async (data) => {
  try {

    await Stock.insertMany(data);
   
  } catch (error) {
    console.error('Error saving data to the database:', error);
  } 
};

module.exports = saveToDatabase;
