const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        patientId: {
            type: String,
            required: true,
            index: true,
        },
        doctorId: {
            type: String,
            required: true,
            index: true,
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
            default: 'SCHEDULED',
        },
        type: {
            type: String,
            enum: ['OPD', 'FOLLOW_UP'],
            default: 'OPD',
        },
        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

const getAppointmentModel = (connection) => {
    try {
        return connection.model('Appointment');
    } catch (e) {
        return connection.model('Appointment', appointmentSchema);
    }
};

module.exports = {
    getAppointmentModel,
    appointmentSchema,
};
