const PasswordReset = require('../models/PasswordReset');
const UserService = require('../services/UserService');
const { createHash } = require('../utils/random');
const { getPassDateByMilliseconds } = require('../utils/date');

class PasswordResetService {
    /**
     * @type {PasswordResetService}
     */
    static instance;
    static tokenLife = 1000 * 60 * 15;

    static getInstance() {
        if (!this.instance) {
            this.instance = new PasswordResetService();
        }

        return this.instance;
    }

    static destroyInstance() {
        delete this.instance;
    }

    createPasswordReset(userId, token) {
        return new PasswordReset({
            userId,
            token: createHash(token),
        }).save();
    }

    getPasswordResetByUserId(userId) {
        return PasswordReset.findOne({
            userId,
            createdAt: {
                $gt: getPassDateByMilliseconds(PasswordResetService.tokenLife)
            }
        });
    }

    async validateTokenByEmailFlow(email, token) {
        const userService = UserService.getInstance();

        const user = await userService.getUserByEmailFlow(email);

        if (!user) {
            throw new Error('User not found');
        }

        const passwordReset = await this.getPasswordResetByUserId(user._id);

        if (!passwordReset) {
            throw new Error("Intento de recuperación con token inválido o expirado");
        }

        const tokenHash = createHash(token);

        if (passwordReset.token !== tokenHash) {
            throw new Error("Intento de recuperación con token inválido o expirado");
        }

        await this.deleteTokenByUserId(user._id);
    }

    deleteTokenByUserId(userId) {
        return PasswordReset.deleteOne({ userId });
    }
}

module.exports = PasswordResetService;