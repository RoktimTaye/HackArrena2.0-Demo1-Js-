// backend/src/modules/patients/patient.controller.js
const patientService = require('./patient.service');
const { logAuditEvent } = require('../audit/audit.service');

/**
 * POST /api/patients
 */
const createPatient = async (req, res, next) => {
    try {
        const tenantConnection = req.db;
        const tenantId = req.tenantId;
        const user = req.user;

        const patient = await patientService.createPatient(
            tenantConnection,
            tenantId,
            user,
            req.body
        );

        await logAuditEvent(tenantConnection, {
            tenantId,
            userId: req.user.userId,
            action: 'PATIENT_CREATE',
            resource: 'PATIENT',
            resourceId: patient.patientId,
            metadata: { firstName: patient.firstName, lastName: patient.lastName },
        });

        res.status(201).json({
            success: true,
            message: 'Patient registered successfully',
            data: patient,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/patients
 */
const listPatients = async (req, res, next) => {
    try {
        const tenantConnection = req.db;
        const user = req.user;
        const abacContext = req.abac || {};

        const result = await patientService.listPatients(
            tenantConnection,
            user,
            req.query,
            abacContext
        );

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/patients/:patientId
 */
const getPatient = async (req, res, next) => {
    try {
        const tenantConnection = req.db;
        const { patientId } = req.params;

        const patient = await patientService.getPatientByPatientId(
            tenantConnection,
            patientId
        );

        res.json({
            success: true,
            data: patient,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPatient,
    listPatients,
    getPatient,
};
