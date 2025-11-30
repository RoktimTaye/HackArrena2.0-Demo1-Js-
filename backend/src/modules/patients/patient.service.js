// backend/src/modules/patients/patient.service.js
const { getPatientModel } = require('./patient.model');
const { generatePatientId } = require('../../utils/idGenerator');
const { getPaginationParams } = require('../../utils/pagination');

/**
 * Create a new patient in the tenant DB.
 */
const createPatient = async (tenantConnection, tenantId, user, payload) => {
    const Patient = getPatientModel(tenantConnection);

    const {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        bloodGroup,
        contactPhone,
        contactEmail,
        address,
        emergencyContactName,
        emergencyContactPhone,
        patientType,
        department,
        primaryDoctorId,
        photoUrl,
        extraInfo,
    } = payload;

    if (!firstName || !contactPhone || !patientType) {
        throw { status: 400, message: 'firstName, contactPhone and patientType are required' };
    }

    if (!['OPD', 'IPD'].includes(patientType)) {
        throw { status: 400, message: 'patientType must be OPD or IPD' };
    }

    const patientId = await generatePatientId(tenantConnection, tenantId);

    const patient = await Patient.create({
        patientId,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        bloodGroup,
        contactPhone,
        contactEmail,
        address,
        emergencyContactName,
        emergencyContactPhone,
        patientType,
        department,
        primaryDoctorId,
        photoUrl,
        extraInfo,
    });

    return patient;
};

/**
 * Build query with filters + ABAC (doctor sees only own department).
 */
const buildPatientQuery = (user, abac, filters) => {
    const {
        patientId,
        name,
        phone,
        email,
        patientType,
        department,
        doctorId,
        fromDate,
        toDate,
    } = filters;

    const query = {};

    if (patientId) {
        query.patientId = patientId.trim();
    }

    if (phone) {
        query.contactPhone = new RegExp(phone.trim(), 'i');
    }

    if (email) {
        query.contactEmail = new RegExp(email.trim(), 'i');
    }

    if (patientType) {
        query.patientType = patientType;
    }

    if (department) {
        query.department = department;
    }

    if (doctorId) {
        query.primaryDoctorId = doctorId;
    }

    if (name) {
        const regex = new RegExp(name.trim(), 'i');
        query.$or = [
            { firstName: regex },
            { lastName: regex },
        ];
    }

    if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) {
            query.createdAt.$gte = new Date(fromDate);
        }
        if (toDate) {
            // include entire day
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            query.createdAt.$lte = end;
        }
    }

    // --- ABAC rule: doctor sees only his/her department patients ---
    // --- ABAC rule: doctor sees only his/her department patients ---
    const userRoles = user.roles || [];
    const deptScope = abac.departmentScope;

    if (userRoles.includes('DOCTOR') && deptScope) {
        query.department = deptScope;
    }

    return query;
};

/**
 * List patients with filters, pagination & ABAC.
 */
const listPatients = async (tenantConnection, user, queryParams, abacContext = {}) => {
    const Patient = getPatientModel(tenantConnection);

    const { page, limit, skip } = getPaginationParams(queryParams, 20);

    const dbQuery = buildPatientQuery(user, abacContext, queryParams);

    const [items, total] = await Promise.all([
        Patient.find(dbQuery)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        Patient.countDocuments(dbQuery),
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
 * Get patient by patientId
 */
const getPatientByPatientId = async (tenantConnection, patientId) => {
    const Patient = getPatientModel(tenantConnection);

    const patient = await Patient.findOne({ patientId });
    if (!patient) {
        throw { status: 404, message: 'Patient not found' };
    }

    return patient;
};

module.exports = {
    createPatient,
    listPatients,
    getPatientByPatientId,
};
