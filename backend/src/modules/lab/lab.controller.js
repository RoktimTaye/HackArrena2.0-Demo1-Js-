const labService = require('./lab.service');
const { saveLabResult } = require('../../utils/storage');

const createLabRequest = async (req, res, next) => {
    try {
        const { tenantId } = req;
        const labRequest = await labService.createLabRequest(req.db, {
            ...req.body,
            doctorId: req.user.userId, // Assuming doctor creates the request
        });
        res.status(201).json(labRequest);
    } catch (error) {
        next(error);
    }
};

const listLabRequests = async (req, res, next) => {
    try {
        const result = await labService.listLabRequests(req.db, req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const uploadLabResult = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { comments } = req.body;
        const file = req.file;

        if (!file) {
            throw { status: 400, message: 'Result file is required' };
        }

        const resultFileUrl = await saveLabResult({
            tenantId: req.tenantId,
            requestId,
            buffer: file.buffer,
            mimetype: file.mimetype,
            originalName: file.originalname,
        });

        const updatedRequest = await labService.updateLabRequestResult(req.db, requestId, {
            resultFileUrl,
            resultComments: comments,
        });

        res.json(updatedRequest);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createLabRequest,
    listLabRequests,
    uploadLabResult,
};
