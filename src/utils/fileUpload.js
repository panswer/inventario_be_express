const path = require('path');
const fs = require('fs');
const { uploadDir } = require('../config');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/svg+xml'];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.svg'];

const generateUUID = () => {
  const uuid = require('node:crypto').randomUUID();
  return uuid;
};

const isValidImageFormat = mimeType => {
  return ALLOWED_MIME_TYPES.includes(mimeType);
};

const getExtensionFromMimeType = mimeType => {
  const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/svg+xml': '.svg',
  };
  return mimeToExt[mimeType] || '.jpg';
};

const saveProductImage = file => {
  if (!file || !file.tempFilePath) {
    throw new Error('Invalid file object');
  }

  if (!isValidImageFormat(file.mimetype)) {
    throw new Error('Invalid image format. Allowed: jpg, jpeg, svg');
  }

  const extension = getExtensionFromMimeType(file.mimetype);
  const filename = `${generateUUID()}${extension}`;
  const destinationPath = path.join(uploadDir, filename);

  fs.copyFileSync(file.tempFilePath, destinationPath);

  fs.unlinkSync(file.tempFilePath);

  return filename;
};

const deleteProductImage = filename => {
  if (!filename) {
    return;
  }

  let absolutePath;
  if (path.isAbsolute(filename)) {
    absolutePath = filename;
  } else {
    absolutePath = path.join(uploadDir, filename);
  }

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

module.exports = {
  generateUUID,
  isValidImageFormat,
  getExtensionFromMimeType,
  saveProductImage,
  deleteProductImage,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};
