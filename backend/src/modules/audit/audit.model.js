// backend/src/modules/audit/audit.model.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
    {
        tenantId: {
            type: String,
            required: true,
            index: true,
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        action: {
            type: String, // e.g. 'USER_CREATE', 'PATIENT_CREATE'
            required: true,
        },
        resource: {
            type: String, // e.g. 'USER', 'PATIENT', 'PRESCRIPTION'
            required: true,
        },
        resourceId: {
            type: String,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

const getAuditLogModel = (connection) => {
    try {
        return connection.model('AuditLog');
    } catch (e) {
        return connection.model('AuditLog', auditLogSchema);
    }
};

module.exports = {
    getAuditLogModel,
};
