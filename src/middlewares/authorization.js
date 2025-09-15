const jwt = require("jsonwebtoken");

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

module.exports = {
  authorizationFn,
};
