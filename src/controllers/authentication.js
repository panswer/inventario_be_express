const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Sign up controller
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const signUp = async (req, res) => {
  const body = req.body;

  const newUser = new User({
    username: body.email,
    password: bcrypt.hashSync(body.password, 12),
  });

  let user;
  try {
    user = await newUser.save();
  } catch (error) {
    return res.status(400).json({
      code: 1000,
    });
  }

  return res.status(201).json(user);
};

/**
 * Sign in controller
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const signIn = async (req, res) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ username: email });
  } catch (error) {
    return res.status(403).json({
      code: 1001,
    });
  }

  if (!user) {
    return res.status(403).json({
      code: 1001,
    });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).json({
      code: 1001,
    });
  }

  const secret = process.env.SERVER_JWT_SESSION_SECRET;

  const authorization = jwt.sign(user.toObject(), secret, {
    expiresIn: "1h",
  });

  res.status(201).json({
    authorization,
  });
};

module.exports = {
  signIn,
  signUp,
};
