const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const LoggerService = require("../services/LoggerService");

/**
 * Verify Authorization token
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 * @param {import('express').NextFunction} next - next middleware or controller
 *
 * @returns {Promise<void>}
 */
const authorizationFn = (req, res, next) => {
  const authorizationToken = req.get("Authorization");

  if (!authorizationToken || typeof authorizationToken !== "string") {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { 1: token } = authorizationToken.split(" ");

  try {
    const userAuth = jwt.verify(token, process.env.SERVER_JWT_SESSION_SECRET);
    req.body = req.body || {};
    req.body.session = userAuth;
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  next();
};

/**
 * Middleware to catch error after validation
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {void}
 */
const signUpValidator = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const loggerService = LoggerService.getInstance();
  const errors = result.array();
  const messages = errors.map(error => error.msg);

  const reason = messages.join(', ');

  loggerService.warn(
    "middleware@signUpValidator",
    {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason,
      type: 'logic'
    }
  );

  res.status(400).json({
    code: 1002,
  });
}

/**
 * Middleware to catch error after validation
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {void}
 */
const resetPasswordVerifyValidator = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const loggerService = LoggerService.getInstance();
  const errors = result.array();

  const reason = errors.map(error => error.msg).join(', ');

  loggerService.warn(
    "middleware@resetPasswordVerifyValidator",
    {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason,
      type: 'logic'
    }
  );

  res.status(400).json({
    code: 1002,
  });
}

module.exports = {
  authorizationFn,
  signUpValidator,
  resetPasswordVerifyValidator,
};
