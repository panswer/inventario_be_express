const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Session = require('../models/Session');

class AuthenticationService {
  /**
   * @type {AuthenticationService}
   */
  static instance;
  static secret = process.env.SERVER_JWT_SESSION_SECRET;
  static expiresIn = '1h';
  static salt = 12;
  static maxSessionsPerUser = parseInt(process.env.MAX_SESSIONS_PER_USER, 10) || 3;

  static getInstance() {
    if (!this.instance) {
      this.instance = new AuthenticationService();
    }

    return this.instance;
  }

  static destroyInstance() {
    delete this.instance;
  }

  /**
   * Verify password hash with plane text password
   *
   * @param {string} password - plane text password
   * @param {string} hash - password hash
   *
   * @returns {boolean}
   */
  verifyPasswordHash(password, hash) {
    return bcrypt.compareSync(password, hash);
  }

  /**
   * Create password hash from plane text
   *
   * @param {string} password - plane password
   *
   * @returns {string}
   */
  generatePasswordHash(password) {
    return bcrypt.hashSync(password, AuthenticationService.salt);
  }

  /**
   * Validate if the user is authenticated by checking the JWT token
   *
   * @param {string} token - JWT token
   * @returns {object} - Decoded user session
   */
  verifySessionToken(token) {
    return jwt.verify(token, AuthenticationService.secret);
  }

  /**
   * Create a JWT session
   *
   * @param {object} user - user document
   *
   * @returns {{ token: string, sessionId: string }}
   */
  generateSessionToken(user) {
    const userObj = user.toObject ? user.toObject() : user;
    const sessionId = crypto.randomUUID();

    const token = jwt.sign(
      {
        _id: userObj._id,
        username: userObj.username,
        role: userObj.role,
        warehouseId: userObj.warehouseId,
        sessionId,
      },
      AuthenticationService.secret,
      {
        expiresIn: '1h',
      }
    );

    return { token, sessionId };
  }

  /**
   * Save session to database
   *
   * @param {string} userId - user ID
   * @param {string} sessionId - session ID
   *
   * @returns {Promise<void>}
   */
  async saveSession(userId, sessionId) {
    const sessionCount = await Session.countDocuments({ userId });

    if (sessionCount >= AuthenticationService.maxSessionsPerUser) {
      const oldestSessions = await Session.find({ userId })
        .sort({ createdAt: 1 })
        .limit(sessionCount - AuthenticationService.maxSessionsPerUser + 1)
        .select('_id');

      const oldestIds = oldestSessions.map(s => s._id);
      await Session.deleteMany({ _id: { $in: oldestIds } });
    }

    await Session.create({ userId, sessionId });
  }

  /**
   * Validate session exists in database
   *
   * @param {string} userId - user ID
   * @param {string} sessionId - session ID
   *
   * @returns {Promise<boolean>}
   */
  async validateSession(userId, sessionId) {
    const session = await Session.findOne({ userId, sessionId });
    return !!session;
  }

  /**
   * Delete session from database
   *
   * @param {string} userId - user ID
   * @param {string} sessionId - session ID
   *
   * @returns {Promise<void>}
   */
  async deleteSession(userId, sessionId) {
    await Session.deleteOne({ userId, sessionId });
  }
}

module.exports = AuthenticationService;
