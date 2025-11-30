// backend/src/modules/security/password.model.js
const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        tenantId: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        used: {
            type: Boolean,
            default: false,
        },
        usedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

const passwordHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const getPasswordResetTokenModel = (connection) => {
    try {
        return connection.model('PasswordResetToken');
    } catch (e) {
        return connection.model('PasswordResetToken', passwordResetTokenSchema);
    }
};

const getPasswordHistoryModel = (connection) => {
    try {
        return connection.model('PasswordHistory');
    } catch (e) {
        return connection.model('PasswordHistory', passwordHistorySchema);
    }
};

module.exports = {
    getPasswordResetTokenModel,
    getPasswordHistoryModel,
};
