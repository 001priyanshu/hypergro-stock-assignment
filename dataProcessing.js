const fs = require('fs');
const downloadData = require('./dataProcessing/downloadData');
const extractData = require('./dataProcessing/extractData');
const saveToDatabase = require('./dataProcessing/saveToDatabase');
const Stock = require("./models/stockModel");
const csv = require('csv-parser');

async function fetchDataForDays(days) {
    const currentDate = new Date();
    const datePromises = [];
  
    for (let i = days-1; i >= 0; i--) {
      const currentDateCopy = new Date(currentDate);
      currentDateCopy.setDate(currentDateCopy.getDate() - i);
  
      const formattedDate = currentDateCopy.toLocaleDateString('en-GB', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      }).replace(/\//g, '');
  
      const latestEntry = await Stock.findOne().sort({ createdAt: -1 });
      
  
      const latestEntryDate = new Date(latestEntry.createdAt);
      latestEntryDate.setHours(0, 0, 0, 0); 
      
      const currentDateCopyMidnight = new Date(currentDateCopy);
      currentDateCopyMidnight.setHours(0, 0, 0, 0); 
      
      if (latestEntryDate >= currentDateCopyMidnight) {
        console.log(`Data for ${formattedDate} already exists. Skipping data fetch and processing.`);
        continue;
      }
     
  
      const BSE_URL = `https://www.bseindia.com/download/BhavCopy/Equity/EQ${formattedDate}_CSV.ZIP`;
      const DOWNLOAD_PATH = `downloads/data_${formattedDate}.zip`;
      const EXTRACT_PATH = 'downloads/';
      const csvHeaders = ['SC_CODE', 'SC_NAME', 'SC_GROUP', 'SC_TYPE', 'OPEN', 'HIGH', 'LOW', 'CLOSE', 'LAST', 'PREVCLOSE', 'NO_TRADES', 'NO_OF_SHRS', 'NET_TURNOV', 'TDCLOINDI'];
  
      const promise =await downloadData(BSE_URL, DOWNLOAD_PATH)
        .then(() => extractData(DOWNLOAD_PATH, EXTRACT_PATH))
        .then(() => {
          const data = [];
          const filePath = `${EXTRACT_PATH}EQ${formattedDate}.CSV`;
  
          return new Promise((resolve, reject) => {
            let isFirstRow = true;
  
            const stream = fs.createReadStream(filePath)
              .pipe(csv({ headers: csvHeaders }))
              .on('data', (row) => {
                if (isFirstRow) {
                  for (const originalColumn in row) {
                    const index = csvHeaders.indexOf(originalColumn);
                    if (index !== -1) {
                      const newColumn = csvHeaders[index];
                      row[newColumn] = originalColumn;
                      delete row[originalColumn];
                    }
                  }
                  isFirstRow = false;
                }
  
                const stockData = {
                  code: row['SC_CODE'],
                  name: row['SC_NAME'],
                  open: parseFloat(row['OPEN']) || 0,
                  high: parseFloat(row['HIGH']) || 0,
                  low: parseFloat(row['LOW']) || 0,
                  close: parseFloat(row['CLOSE']) || 0,
                  createdAt:currentDateCopy,
                };
  
                if (!isNaN(stockData.open) && !isNaN(stockData.high) && !isNaN(stockData.low) && !isNaN(stockData.close) && !isNaN(stockData.code)) {
                  data.push(stockData);
                }
              })
              .on('end', () => {
                resolve(data);
              })
              .on('error', (error) => {
                reject(error);
              });
  
            stream.resume();
          });
        })
        .then((data) => {
          return saveToDatabase(data);
        })
        .then(() => {
          console.log(`Data for ${formattedDate} saved to the database successfully.`);
        })
        .catch((error) => {
          console.error(`Error during data processing for ${formattedDate}:`);
        });
  
      datePromises.push(promise);
    }
  
    await Promise.all(datePromises);
}

async function runDataProcessingBeforeServerStarts() {
  const daysToFetch = 50;
  await fetchDataForDays(daysToFetch);
}

module.exports = {
  fetchDataForDays,
  runDataProcessingBeforeServerStarts,
};
