/**
 * Enforces basic password rules:
 * - min 8 chars
 * - at least one uppercase
 * - at least one lowercase
 * - at least one digit
 * - at least one special char
 */
const validatePassword = (password) => {
    const errors = [];

    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one digit');
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

module.exports = {
    validatePassword,
};
