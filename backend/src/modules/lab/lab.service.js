const { getLabRequestModel } = require('./lab.model');
const { generateLabRequestId } = require('../../utils/idGenerator');
const { getPaginationParams } = require('../../utils/pagination');

const createLabRequest = async (tenantConnection, payload) => {
    const LabRequest = getLabRequestModel(tenantConnection);
    const requestId = generateLabRequestId();

    const labRequest = await LabRequest.create({
        requestId,
        ...payload,
    });

    return labRequest;
};

const listLabRequests = async (tenantConnection, queryParams) => {
    const LabRequest = getLabRequestModel(tenantConnection);
    const { page, limit, skip } = getPaginationParams(queryParams, 20);

    const query = {};
    if (queryParams.status) query.status = queryParams.status;
    if (queryParams.patientId) query.patientId = queryParams.patientId;
    if (queryParams.type) query.type = queryParams.type;

    const [items, total] = await Promise.all([
        LabRequest.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        LabRequest.countDocuments(query),
    ]);

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
    };
};

const updateLabRequestResult = async (tenantConnection, requestId, resultData) => {
    const LabRequest = getLabRequestModel(tenantConnection);

    const labRequest = await LabRequest.findOne({ requestId });
    if (!labRequest) {
        throw { status: 404, message: 'Lab request not found' };
    }

    labRequest.status = 'COMPLETED';
    labRequest.resultFileUrl = resultData.resultFileUrl;
    labRequest.resultComments = resultData.resultComments;

    await labRequest.save();
    return labRequest;
};

module.exports = {
    createLabRequest,
    listLabRequests,
    updateLabRequestResult,
};
