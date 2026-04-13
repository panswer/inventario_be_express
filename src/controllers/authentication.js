const UserService = require('../services/UserService');
const EmailService = require('../services/EmailService');
const PasswordResetService = require('../services/PasswordResetService');
const AuthenticationService = require('../services/AuthenticationService');
const LoggerService = require('../services/LoggerService');

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
  const loggerService = LoggerService.getInstance();

  let user;
  try {
    user = await userService.createUser(body.email, body.password);
  } catch (error) {
    loggerService.error('userService@createUser', {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
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
  const loggerService = LoggerService.getInstance();

  let user;
  try {
    user = await userService.getUserByEmailFlow(email);
  } catch (error) {
    loggerService.error('userService@getUserByEmailFlow', {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
    return res.status(403).json({
      code: 1001,
    });
  }

  if (!authenticationService.verifyPasswordHash(password, user.password)) {
    loggerService.error('authenticationService@verifyPasswordHash', {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason: 'Contraseña incorrecta',
      type: 'logic',
    });
    return res.status(403).json({
      code: 1001,
    });
  }

  const { token, sessionId } = authenticationService.generateSessionToken(user);

  await authenticationService.saveSession(user._id.toString(), sessionId);

  res.status(201).json({
    authorization: token,
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
  const loggerService = LoggerService.getInstance();

  try {
    await emailService.sendResetPasswordEmailFlow(email);
  } catch (error) {
    if (error?.message === 'Solicitud de recuperación para email no registrado')
      loggerService.warn('emailService@sendResetPasswordEmailFlow', {
        requestId: req.requestId,
        userIp: req.userIp,
        body: req.body,
        reason: error.message,
        type: 'logic',
      });

    if (error?.message !== 'Solicitud de recuperación para email no registrado') {
      loggerService.error('emailService@sendResetPasswordEmailFlow', {
        requestId: req.requestId,
        userIp: req.userIp,
        body: req.body,
        reason: error?.message ?? 'Unknown error',
        type: 'logic',
      });

      return res.status(500).json({
        code: 2000,
      });
    }
  }

  return res.status(200).json({});
};

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
  const loggerService = LoggerService.getInstance();

  try {
    await passwordResetService.validateTokenByEmailFlow(email, token);
  } catch (error) {
    if (error.message === 'Intento de recuperación con token inválido o expirado')
      loggerService.warn('passwordResetService@validateTokenByEmailFlow', {
        requestId: req.requestId,
        userIp: req.user,
        body: req.body,
        reason: error.message,
        type: 'logic',
      });

    if (error.message !== 'Intento de recuperación con token inválido o expirado')
      loggerService.error('passwordResetService@validateTokenByEmailFlow', {
        requestId: req.requestId,
        userIp: req.user,
        body: req.body,
        reason: error.message,
        type: 'logic',
      });

    return res.status(404).json({
      code: 1003,
    });
  }

  const userService = UserService.getInstance();

  try {
    await userService.updateUserPassword(email, password);
  } catch (error) {
    loggerService.error('userService@updateUserPassword', {
      requestId: req.requestId,
      userIp: req.user,
      body: req.body,
      reason: error.message,
      type: 'logic',
    });
    return res.status(500).json({
      code: 1004,
    });
  }

  res.status(202).json({});
};

/**
 * Sign out controller - invalidates session
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const signOut = async (req, res) => {
  const { session } = req.body;
  const authenticationService = AuthenticationService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    await authenticationService.deleteSession(session._id, session.sessionId);
  } catch (error) {
    loggerService.error('authenticationService@deleteSession', {
      requestId: req.requestId,
      userIp: req.userIp,
      body: req.body,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
    return res.status(500).json({
      message: 'Internal error',
    });
  }

  res.status(200).json({});
};

module.exports = {
  signIn,
  signUp,
  resetPassword,
  resetPasswordVerify,
  signOut,
};
