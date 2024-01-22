const axios = require('axios');
const fs = require('fs');
const unzipper = require('unzipper');

const downloadData = async (url, destination) => {
    console.log(url,destination)
  const response = await axios({
    method: 'get',
    url,
    responseType: 'stream',
  });
//   console.log(response)
   
  response.data.pipe(fs.createWriteStream(destination));

  return new Promise((resolve, reject) => {
    response.data.on('end', () => resolve());
    response.data.on('error', (err) => reject(err));
  });
};

module.exports = downloadData;
