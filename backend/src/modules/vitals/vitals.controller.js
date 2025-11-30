const vitalsService = require('./vitals.service');

const createVitals = async (req, res, next) => {
    try {
        const vitals = await vitalsService.createVitals(req.db, {
            ...req.body,
            recordedBy: req.user.userId,
        });
        res.status(201).json(vitals);
    } catch (error) {
        next(error);
    }
};

const listVitals = async (req, res, next) => {
    try {
        const result = await vitalsService.listVitals(req.tenantConnection, req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createVitals,
    listVitals,
};
