const appointmentService = require('./appointment.service');

const createAppointment = async (req, res, next) => {
    try {
        const appointment = await appointmentService.createAppointment(req.db, req.body);
        res.status(201).json(appointment);
    } catch (error) {
        next(error);
    }
};

const listAppointments = async (req, res, next) => {
    try {
        const result = await appointmentService.listAppointments(req.db, req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const updateAppointment = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const appointment = await appointmentService.updateAppointment(req.tenantConnection, appointmentId, req.body);
        res.json(appointment);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAppointment,
    listAppointments,
    updateAppointment,
};
