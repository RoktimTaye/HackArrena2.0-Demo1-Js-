// backend/src/modules/prescriptions/prescription.controller.js
const prescriptionService = require('./prescription.service');
const { logAuditEvent } = require('../audit/audit.service');

const createPrescription = async (req, res, next) => {
    try {
        const tenantConnection = req.db;
        const tenantId = req.tenantId;
        const user = req.user;

        const prescription = await prescriptionService.createPrescription(
            tenantConnection,
            tenantId,
            {
                ...user,
                // userId in token is user.userId (from auth payload)
                userId: user.userId,
            },
            req.body
        );

        await logAuditEvent(tenantConnection, {
            tenantId,
            userId: user.userId,
            action: 'PRESCRIPTION_CREATE',
            resource: 'PRESCRIPTION',
            resourceId: prescription.prescriptionId,
            metadata: { patientId: prescription.patientId },
        });

        res.status(201).json({
            success: true,
            message: 'Prescription created successfully',
            data: prescription,
        });
    } catch (error) {
        next(error);
    }
};

const listPrescriptions = async (req, res, next) => {
    try {
        const tenantConnection = req.db;
        const user = req.user;

        const result = await prescriptionService.listPrescriptions(
            tenantConnection,
            {
                ...user,
                userId: user.userId,
            },
            req.query
        );

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getPrescription = async (req, res, next) => {
    try {
        const tenantConnection = req.db;
        const user = req.user;
        const { prescriptionId } = req.params;

        const prescription = await prescriptionService.getPrescriptionById(
            tenantConnection,
            {
                ...user,
                userId: user.userId,
            },
            prescriptionId
        );

        res.json({
            success: true,
            data: prescription,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPrescription,
    listPrescriptions,
    getPrescription,
};
