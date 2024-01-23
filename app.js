const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const { runDataProcessingBeforeServerStarts } = require('./dataProcessing');
const stocksRouter = require('./routes/stocks');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/stocks', stocksRouter);


mongoose.connect(process.env.DATABASE_URL).then(async () => {
  console.log('Connected to the database');

  await runDataProcessingBeforeServerStarts();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Error connecting to the database:', error);
});
