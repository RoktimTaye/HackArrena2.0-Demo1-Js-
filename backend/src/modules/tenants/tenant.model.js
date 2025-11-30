const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
    {
        tenantId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        address: {
            type: String,
            required: true,
        },

        contactEmail: {
            type: String,
            required: true,
            lowercase: true,
        },

        contactPhone: {
            type: String,
            required: true,
        },

        licenseNumber: {
            type: String,
            required: true,
            unique: true,
        },

        domain: {
            type: String,
            required: true,
            unique: true,
        },

        status: {
            type: String,
            enum: ['PENDING', 'VERIFIED', 'ACTIVE', 'SUSPENDED', 'INACTIVE'],
            default: 'PENDING',
        },

        supportedLanguages: {
            type: [String],
            default: ['en'],
        },

        verificationToken: {
            type: String,
        },

    },
    { timestamps: true }
);

module.exports = mongoose.model('Tenant', tenantSchema);
