const crypto = require('node:crypto');

const getRandomChar = (size = 3) => crypto.randomBytes(size).toString('hex');
const createHash = text => crypto.createHash('sha256').update(text).digest('hex');

module.exports = {
  getRandomChar,
  createHash,
};
