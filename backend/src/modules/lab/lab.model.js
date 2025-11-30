const mongoose = require('mongoose');

const labRequestSchema = new mongoose.Schema(
    {
        requestId: {
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
        },
        type: {
            type: String,
            enum: ['XRAY', 'BLOOD_TEST', 'VACCINATION'],
            required: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'COMPLETED'],
            default: 'PENDING',
        },
        notes: {
            type: String,
        },
        resultFileUrl: {
            type: String,
        },
        resultComments: {
            type: String,
        },
    },
    { timestamps: true }
);

const getLabRequestModel = (connection) => {
    try {
        return connection.model('LabRequest');
    } catch (e) {
        return connection.model('LabRequest', labRequestSchema);
    }
};

module.exports = {
    getLabRequestModel,
    labRequestSchema,
};
