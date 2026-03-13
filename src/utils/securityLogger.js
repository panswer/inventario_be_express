const winston = require('winston');

const securityFilter = winston.format((info) => {
    const SENSITIVE_FIELDS = ['password', 'token', 'auth', 'secret', 'credit_card'];

    function redact(obj) {
        if (!obj || typeof obj !== 'object') {
            return;
        }

        Object.keys(obj).forEach(key => {
            if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
                obj[key] = '[REDACTED]';
            } else {
                redact(obj[key]);
            }
        });
    }

    redact(info);
    return info;
});

module.exports = {
    securityFilter,
}