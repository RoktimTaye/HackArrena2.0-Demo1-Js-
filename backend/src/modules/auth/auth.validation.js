const Joi = require('joi');

const loginSchema = {
    body: Joi.object({
        tenantId: Joi.string().optional(),
        tenantDomain: Joi.string().optional(),
        username: Joi.string().required(),
        password: Joi.string().required(),
    }).or('tenantId', 'tenantDomain'),
};

const refreshSchema = {
    body: Joi.object({
        refreshToken: Joi.string().required(),
    }),
};

module.exports = {
    loginSchema,
    refreshSchema,
};
