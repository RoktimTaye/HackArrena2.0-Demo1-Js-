const { getAppointmentModel } = require('./appointment.model');
const { generateAppointmentId } = require('../../utils/idGenerator');
const { getPaginationParams } = require('../../utils/pagination');

const createAppointment = async (tenantConnection, payload) => {
    const Appointment = getAppointmentModel(tenantConnection);
    const appointmentId = generateAppointmentId();

    const appointment = await Appointment.create({
        appointmentId,
        ...payload,
    });

    return appointment;
};

const listAppointments = async (tenantConnection, queryParams) => {
    const Appointment = getAppointmentModel(tenantConnection);
    const { page, limit, skip } = getPaginationParams(queryParams, 20);

    const query = {};
    if (queryParams.patientId) query.patientId = queryParams.patientId;
    if (queryParams.doctorId) query.doctorId = queryParams.doctorId;
    if (queryParams.status) query.status = queryParams.status;
    if (queryParams.date) {
        // Simple date match, can be improved for range
        const start = new Date(queryParams.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(queryParams.date);
        end.setHours(23, 59, 59, 999);
        query.date = { $gte: start, $lte: end };
    }

    const [items, total] = await Promise.all([
        Appointment.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ date: 1 }),
        Appointment.countDocuments(query),
    ]);

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
    };
};

const updateAppointment = async (tenantConnection, appointmentId, updates) => {
    const Appointment = getAppointmentModel(tenantConnection);

    const appointment = await Appointment.findOne({ appointmentId });
    if (!appointment) {
        throw { status: 404, message: 'Appointment not found' };
    }

    Object.assign(appointment, updates);
    await appointment.save();
    return appointment;
};

module.exports = {
    createAppointment,
    listAppointments,
    updateAppointment,
};
