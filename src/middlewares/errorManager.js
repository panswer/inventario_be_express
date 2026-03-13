/**
 * Middleware to catch general error
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {void}
 */
const errorManager = (err, req, res, next) => {
    res.locals.errorMessage = err.message;

    const status = err.status || 500;

    res.status(status).json({
        code: -1
    });
}

module.exports = errorManager;