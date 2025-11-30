const { getVitalsModel } = require('./vitals.model');
const { getPaginationParams } = require('../../utils/pagination');

const createVitals = async (tenantConnection, payload) => {
    const Vitals = getVitalsModel(tenantConnection);

    const vitals = await Vitals.create(payload);
    return vitals;
};

const listVitals = async (tenantConnection, queryParams) => {
    const Vitals = getVitalsModel(tenantConnection);
    const { page, limit, skip } = getPaginationParams(queryParams, 20);

    const query = {};
    if (queryParams.patientId) query.patientId = queryParams.patientId;

    const [items, total] = await Promise.all([
        Vitals.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ recordedAt: -1 }),
        Vitals.countDocuments(query),
    ]);

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
    };
};

module.exports = {
    createVitals,
    listVitals,
};
