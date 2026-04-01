const winston = require('winston');
const path = require('node:path');
const { securityFilter } = require('../utils/securityLogger');

class LoggerService {
  /**
   * @type {LoggerService}
   */
  static instance;
  static loggerFolder = path.resolve(__dirname, '../../logger');

  /**
   * @type {winston.Logger}
   */
  logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        securityFilter(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({
          filename: path.join(LoggerService.loggerFolder, 'combined.log'),
        }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        })
      );
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new LoggerService();
    }

    return this.instance;
  }

  static destroyInstance() {
    delete this.instance;
  }

  /**
   * Log an info message
   * @param {string} message
   * @param {Object} meta
   */
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  /**
   * Log an error message
   * @param {string} message
   * @param {Object} meta
   */
  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  /**
   * Log a warning message
   * @param {string} message
   * @param {Object} meta
   */
  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }
}

module.exports = LoggerService;
