const bcrypt = require('bcrypt');
const User = require('../models/User');
const AuthenticationService = require('./AuthenticationService');

class UserService {
    /**
     * @type {UserService}
     */
    static instance;

    static getInstance() {
        if (!this.instance) {
            this.instance = new UserService();
        }

        return this.instance;
    }

    static destroyInstance() {
        delete this.instance;
    }

    createUser(email, password) {
        const authenticationService = AuthenticationService.getInstance();

        return new User({
            username: email,
            password: authenticationService.generatePasswordHash(password),
        }).save();
    }

    /**
     * Get an user by email
     * 
     * @param {string} email - email
     */
    getUserByEmail(username) {
        return User.findOne({ username });
    }

    /**
     * Get an user by email flow
     * 
     * @param {string} email - email
     */
    async getUserByEmailFlow(email) {
        const user = await this.getUserByEmail(email);

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async updateUserPassword(email, password) {
        await User.findOneAndUpdate(
            { username: email },
            { password: bcrypt.hashSync(password, 12) }
        );
    }
}

module.exports = UserService;