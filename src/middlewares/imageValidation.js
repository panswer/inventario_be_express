const LoggerService = require('../services/LoggerService');
const { isValidImageFormat, ALLOWED_EXTENSIONS } = require('../utils/fileUpload');

const imageValidation = (req, res, next) => {
  const file = req.files?.image;

  if (!file) {
    return next();
  }

  const loggerService = LoggerService.getInstance();
  const allowedExtensions = ALLOWED_EXTENSIONS.join(', ');
  const reasonParts = [];

  if (!isValidImageFormat(file.mimetype)) {
    reasonParts.push(`Invalid format. Allowed: ${allowedExtensions}`);
  }

  const fileExt = file.name ? file.name.substring(file.name.lastIndexOf('.')).toLowerCase() : '';
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    reasonParts.push(`Invalid extension. Allowed: ${allowedExtensions}`);
  }

  if (reasonParts.length > 0) {
    loggerService.warn('imageValidation@imageValidation', {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason: reasonParts.join('; '),
      type: 'logic',
    });

    return res.status(400).json({
      code: 2001,
    });
  }

  next();
};

module.exports = {
  imageValidation,
};
