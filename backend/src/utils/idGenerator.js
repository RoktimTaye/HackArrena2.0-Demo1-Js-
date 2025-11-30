// backend/src/utils/idGenerator.js
const mongoose = require('mongoose');

/**
 * Generic counter schema used per tenant DB to generate sequential numbers.
 */
const counterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        seq: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const getCounterModel = (connection) => {
    try {
        return connection.model('Counter');
    } catch (e) {
        return connection.model('Counter', counterSchema);
    }
};

/**
 * Get next sequence number for a named counter in a specific tenant connection.
 */
const getNextSequence = async (connection, name) => {
    const Counter = getCounterModel(connection);

    const result = await Counter.findOneAndUpdate(
        { name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    return result.seq;
};

/**
 * Generate patient ID as {tenantId}-P-{seq}
 */
const generatePatientId = async (connection, tenantId) => {
    const seq = await getNextSequence(connection, 'PATIENT');
    return `${tenantId}-P-${seq}`;
};

/**
 * Generate prescription ID as {tenantId}-RX-{seq}
 * (future use for prescriptions module)
 */
const generatePrescriptionId = async (connection, tenantId) => {
    const seq = await getNextSequence(connection, 'PRESCRIPTION');
    return `${tenantId}-RX-${seq}`;
};

const generateLabRequestId = () => {
    return `LAB-${Date.now()}`;
};

const generateAppointmentId = () => {
    return `APT-${Date.now()}`;
};

module.exports = {
    generatePatientId,
    generatePrescriptionId,
    generateLabRequestId,
    generateAppointmentId,
};
