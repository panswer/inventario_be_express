const bcrypt = require('bcrypt');
const User = require('../models/User');
const AuthenticationService = require('./AuthenticationService');
const { userRoleEnum } = require('../enums/userRoleEnum');

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

    /**
     * Create a new user. First user becomes admin.
     * 
     * @param {string} email - user email (username)
     * @param {string} password - plain text password
     * @param {string} [role] - optional role (admin, manager, user)
     * @returns {Promise<object>}
     */
    async createUser(email, password, role = null) {
        const authenticationService = AuthenticationService.getInstance();
        
        const userCount = await User.countDocuments();
        
        let assignedRole = role;
        if (!assignedRole) {
            assignedRole = userCount === 0 ? userRoleEnum.admin : userRoleEnum.user;
        }

        const user = await new User({
            username: email,
            password: authenticationService.generatePasswordHash(password),
            role: assignedRole,
        }).save();

        return user;
    }

    /**
     * Get an user by email
     * 
     * @param {string} username - email
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

    /**
     * Get all users
     * 
     * @returns {Promise<object[]>}
     */
    getAllUsers() {
        return User.find({}, { password: 0 }).sort({ createdAt: -1 });
    }

    /**
     * Get user by ID
     * 
     * @param {string} userId - user ID
     */
    getUserById(userId) {
        return User.findById(userId);
    }

    /**
     * Update user role
     * 
     * @param {string} userId - user ID
     * @param {string} role - new role
     */
    async updateUserRole(userId, role) {
        if (!Object.values(userRoleEnum).includes(role)) {
            throw new Error("Invalid role");
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        );

        if (!user) {
            throw new Error("User not found");
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