const UserService = require("../services/UserService");
const EmailService = require("../services/EmailService");
const PasswordResetService = require("../services/PasswordResetService");
const AuthenticationService = require("../services/AuthenticationService");

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
  const userService = UserService.getInstance();

  let user;
  try {
    user = await userService.createUser(body.email, body.password);
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
  const userService = UserService.getInstance();
  const authenticationService = AuthenticationService.getInstance();

  let user;
  try {
    user = await userService.getUserByEmailFlow(email);
  } catch (error) {
    return res.status(403).json({
      code: 1001,
    });
  }

  if (!authenticationService.verifyPasswordHash(password, user.password)) {
    return res.status(403).json({
      code: 1001,
    });
  }

  const authorization = authenticationService.generateSessionToken(user);

  res.status(201).json({
    authorization,
  });
};

/**
 * Send token to reset password
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * 
 * @returns {Promise<void>}
 */
const resetPassword = async (req, res) => {
  const { email } = req.body;

  const emailService = EmailService.getInstance();

  try {
    await emailService.sendResetPasswordEmailFlow(email);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 2000,
    });
  }

  return res.status(200).json({});
}

/**
 * Reset password by token
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * 
 * @return {Promise<void>}
 */
const resetPasswordVerify = async (req, res) => {
  const { email, token, password } = req.body;

  const passwordResetService = PasswordResetService.getInstance();

  try {
    await passwordResetService.validateTokenByEmailFlow(email, token);
  } catch (error) {
    return res.status(404).json({
      code: 1003,
    });
  }

  const userService = UserService.getInstance();

  try {
    await userService.updateUserPassword(email, password);
  } catch (error) {
    return res.status(500).json({
      code: 1004,
    });
  }

  res.status(202).json({});
}

module.exports = {
  signIn,
  signUp,
  resetPassword,
  resetPasswordVerify,
};
