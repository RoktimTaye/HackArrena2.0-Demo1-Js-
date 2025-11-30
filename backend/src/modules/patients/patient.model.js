// backend/src/modules/patients/patient.model.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
    {
        patientId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            trim: true,
        },

        dateOfBirth: {
            type: Date,
        },

        gender: {
            type: String,
            enum: ['MALE', 'FEMALE', 'OTHER'],
        },

        bloodGroup: {
            type: String,
            trim: true,
        },

        contactPhone: {
            type: String,
            required: true,
            trim: true,
        },

        contactEmail: {
            type: String,
            lowercase: true,
            trim: true,
        },

        address: {
            type: String,
        },

        emergencyContactName: {
            type: String,
        },

        emergencyContactPhone: {
            type: String,
        },

        patientType: {
            type: String,
            enum: ['OPD', 'IPD'],
            required: true,
        },

        department: {
            type: String,
        },

        primaryDoctorId: {
            type: String, // we can store user _id as string
        },

        photoUrl: {
            type: String,
        },

        extraInfo: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

const getPatientModel = (connection) => {
    try {
        return connection.model('Patient');
    } catch (e) {
        return connection.model('Patient', patientSchema);
    }
};

module.exports = {
    getPatientModel,
    patientSchema,
};
