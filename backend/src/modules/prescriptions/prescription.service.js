// backend/src/modules/prescriptions/prescription.service.js
const { getPrescriptionModel } = require('./prescription.model');
const { getPatientModel } = require('../patients/patient.model');
const { generatePrescriptionId } = require('../../utils/idGenerator');
const { getPaginationParams } = require('../../utils/pagination');

/**
 * Create a new prescription for a patient.
 * - Validates patient exists
 * - Ensures doctor (if role=DOCTOR) is from same department as patient (ABAC)
 */
const createPrescription = async (tenantConnection, tenantId, user, payload) => {
    const Prescription = getPrescriptionModel(tenantConnection);
    const Patient = getPatientModel(tenantConnection);

    const { patientId, medicines, notes, visitDate } = payload;

    if (!patientId) {
        throw { status: 400, message: 'patientId is required' };
    }

    if (!Array.isArray(medicines) || medicines.length === 0) {
        throw { status: 400, message: 'At least one medicine is required' };
    }

    // Validate patient exists
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
        throw { status: 404, message: 'Patient not found' };
    }

    const userRoles = user.roles || [];

    // ABAC rule: if DOCTOR, ensure same department as patient
    if (userRoles.includes('DOCTOR')) {
        if (user.department && patient.department && user.department !== patient.department) {
            throw {
                status: 403,
                message: 'Doctor is not allowed to prescribe for patients in a different department',
            };
        }
    }

    const prescriptionId = await generatePrescriptionId(tenantConnection, tenantId);

    const doctorName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;

    const prescription = await Prescription.create({
        prescriptionId,
        patientId,
        doctorId: user.userId || user.user_id || user.id || user._id || '', // token payload has userId
        doctorName,
        department: patient.department,
        visitDate: visitDate ? new Date(visitDate) : new Date(),
        medicines,
        notes,
    });

    return prescription;
};

/**
 * List prescriptions, typically filtered by patientId.
 * ABAC: doctor can see only prescriptions of patients in their department.
 */
const listPrescriptions = async (tenantConnection, user, queryParams) => {
    const Prescription = getPrescriptionModel(tenantConnection);
    const Patient = getPatientModel(tenantConnection);

    const { page, limit, skip } = getPaginationParams(queryParams, 20);
    const { patientId, fromDate, toDate } = queryParams;

    const query = {};

    if (patientId) {
        query.patientId = patientId;
    }

    if (fromDate || toDate) {
        query.visitDate = {};
        if (fromDate) {
            query.visitDate.$gte = new Date(fromDate);
        }
        if (toDate) {
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            query.visitDate.$lte = end;
        }
    }

    const userRoles = user.roles || [];

    // If DOCTOR, restrict to prescriptions for patients in their department
    if (userRoles.includes('DOCTOR') && user.department) {
        // Find patients of doctor’s department, then restrict prescriptions to those patients
        const patientsInDept = await Patient.find({ department: user.department }).select('patientId');
        const patientIds = patientsInDept.map((p) => p.patientId);

        if (!query.patientId) {
            query.patientId = { $in: patientIds };
        } else {
            // If query already has patientId filter, ensure it's in allowed set
            if (!patientIds.includes(query.patientId)) {
                // No access
                return {
                    items: [],
                    total: 0,
                    page,
                    limit,
                    totalPages: 1,
                };
            }
        }
    }

    const [items, total] = await Promise.all([
        Prescription.find(query).skip(skip).limit(limit).sort({ visitDate: -1 }),
        Prescription.countDocuments(query),
    ]);

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
    };
};

/**
 * Get a single prescription by prescriptionId.
 * ABAC: if DOCTOR, ensure same department as patient.
 */
const getPrescriptionById = async (tenantConnection, user, prescriptionId) => {
    const Prescription = getPrescriptionModel(tenantConnection);
    const Patient = getPatientModel(tenantConnection);

    const prescription = await Prescription.findOne({ prescriptionId });

    if (!prescription) {
        throw { status: 404, message: 'Prescription not found' };
    }

    const userRoles = user.roles || [];

    if (userRoles.includes('DOCTOR') && user.department) {
        const patient = await Patient.findOne({ patientId: prescription.patientId });
        if (!patient) {
            throw { status: 404, message: 'Patient not found for this prescription' };
        }

        if (patient.department && patient.department !== user.department) {
            throw {
                status: 403,
                message: 'Doctor is not allowed to view prescriptions of other departments',
            };
        }
    }

    return prescription;
};

module.exports = {
    createPrescription,
    listPrescriptions,
    getPrescriptionById,
};
