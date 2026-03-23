const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthenticationService {
    /**
     * @type {AuthenticationService}
     */
    static instance;
    static secret = process.env.SERVER_JWT_SESSION_SECRET;
    static expiresIn = '1h';
    static salt = 12;

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
     * @returns {string}
     */
    generateSessionToken(user) {
        const userObj = user.toObject ? user.toObject() : user;
        return jwt.sign(
            {
                _id: userObj._id,
                username: userObj.username,
                role: userObj.role,
            },
            AuthenticationService.secret,
            {
                expiresIn: "1h",
            }
        );
    }
}

module.exports = AuthenticationService;