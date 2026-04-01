const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { warningText } = require('./utils/color');

const fileEnv = path.resolve(__dirname, '../.env');

if (fs.existsSync(fileEnv)) {
  dotenv.config({
    path: fileEnv,
  });
} else {
  console.log(warningText('.env not found'));
}

const uploadDir = process.env.UPLOAD_DIR || './uploads';
const uploadTempDir = path.join(uploadDir, 'temp');
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 2 * 1024 * 1024;

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(uploadTempDir)) {
  fs.mkdirSync(uploadTempDir, { recursive: true });
}

module.exports = {
  uploadDir,
  uploadTempDir,
  maxFileSize,
};
