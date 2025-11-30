const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema(
    {
        patientId: {
            type: String,
            required: true,
            index: true,
        },
        recordedBy: {
            type: String,
            required: true,
        },
        temperature: {
            type: Number,
        },
        bloodPressure: {
            systolic: Number,
            diastolic: Number,
        },
        heartRate: {
            type: Number,
        },
        respiratoryRate: {
            type: Number,
        },
        oxygenSaturation: {
            type: Number,
        },
        notes: {
            type: String,
        },
        recordedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const getVitalsModel = (connection) => {
    try {
        return connection.model('Vitals');
    } catch (e) {
        return connection.model('Vitals', vitalsSchema);
    }
};

module.exports = {
    getVitalsModel,
    vitalsSchema,
};
