// backend/src/utils/pagination.js

const getPaginationParams = (query, defaultLimit = 20) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || defaultLimit, 100);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

module.exports = {
    getPaginationParams,
};
