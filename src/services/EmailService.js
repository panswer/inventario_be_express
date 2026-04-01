const nodemailer = require('nodemailer');

const UserService = require('../services/UserService');
const PasswordResetService = require('../services/PasswordResetService');
const { getRandomChar } = require('../utils/random');
const LoggerService = require('./LoggerService');

class Mailer {
  /**
   * @type {Mailer}
   */
  static instance;

  transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Mailer();
    }

    return this.instance;
  }

  static destroyInstance() {
    delete this.instance;
  }

  /**
   * Send an email
   *
   * @param {string} to - email address
   * @param {string} subject - email's subject
   * @param {string} content - email's body
   *
   * @returns {Promise<void>}
   */
  async sendEmail(to, subject, content) {
    await this.transporter.sendMail({
      to,
      subject,
      html: content,
    });
  }

  /**
   * Send password reset token
   *
   * @param {string} email - user's email
   *
   * @returns {Promise<void>}
   */
  async sendResetPasswordEmail(email, token) {
    await this.sendEmail(email, 'Reset password', token);
  }

  /**
   * Send a password reset token flow
   *
   * @param {string} email - user's email
   *
   * @return {Promise<void>}
   */
  async sendResetPasswordEmailFlow(email) {
    const userService = UserService.getInstance();
    const passwordResetService = PasswordResetService.getInstance();

    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw new Error('Solicitud de recuperación para email no registrado');
    }

    let token = '';
    try {
      await passwordResetService.deleteTokenByUserId(user._id);

      token = getRandomChar(3);

      await passwordResetService.createPasswordReset(user._id, token);
    } catch (e) {
      throw new Error('Fallo al generar token de recuperación');
    }

    try {
      await this.sendResetPasswordEmail(email, token);
    } catch (e) {
      throw new Error('Error de comunicación con el proveedor de correo');
    }
  }
}

module.exports = Mailer;
