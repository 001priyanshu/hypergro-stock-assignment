const fs = require('fs');
const unzipper = require('unzipper');

const extractData = async (zipFilePath, extractPath) => {
  await fs.createReadStream(zipFilePath)
    .pipe(unzipper.Extract({ path: extractPath }))
    .promise();
};

module.exports = extractData;
