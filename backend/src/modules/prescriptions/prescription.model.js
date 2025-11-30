// backend/src/modules/prescriptions/prescription.model.js
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        dosage: { type: String, required: true },      // e.g., "500mg"
        frequency: { type: String, required: true },   // e.g., "Twice a day"
        duration: { type: String, required: true },    // e.g., "5 days"
        instructions: { type: String },                // e.g., "After food"
    },
    { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
    {
        prescriptionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        patientId: {
            type: String, // patient.patientId
            required: true,
            index: true,
        },

        doctorId: {
            type: String, // user._id or custom
            required: true,
        },

        doctorName: {
            type: String,
        },

        department: {
            type: String,
        },

        visitDate: {
            type: Date,
            default: Date.now,
        },

        medicines: {
            type: [medicineSchema],
            required: true,
            validate: (v) => Array.isArray(v) && v.length > 0,
        },

        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

const getPrescriptionModel = (connection) => {
    try {
        return connection.model('Prescription');
    } catch (e) {
        return connection.model('Prescription', prescriptionSchema);
    }
};

module.exports = {
    getPrescriptionModel,
    prescriptionSchema,
};
