const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        passwordHash: {
            type: String,
            required: true,
        },

        roles: {
            type: [String], // e.g. ['HOSPITAL_ADMIN', 'DOCTOR']
            default: [],
        },

        department: {
            type: String,
        },

        attributes: {
            type: mongoose.Schema.Types.Mixed, // for ABAC (shift, specialization, etc.)
            default: {},
        },

        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE', 'LOCKED', 'PASSWORD_EXPIRED'],
            default: 'ACTIVE',
        },

        forcePasswordChange: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

/**
 * Because we're using per-tenant connections (createConnection),
 * we can't just do mongoose.model('User', schema). We need to attach
 * the schema to the specific tenant connection.
 */
const getUserModel = (connection) => {
    try {
        return connection.model('User');
    } catch (e) {
        return connection.model('User', userSchema);
    }
};

module.exports = {
    getUserModel,
    userSchema,
};
