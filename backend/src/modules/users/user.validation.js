const Joi = require('joi');

const createUserSchema = {
    body: Joi.object({
        username: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        firstName: Joi.string().min(1).required(),
        lastName: Joi.string().allow('', null),
        password: Joi.string().min(8).required(),
        roles: Joi.array().items(Joi.string()).default([]),
        department: Joi.string().allow('', null),
        attributes: Joi.object().unknown(true).default({}),
    }),
};

const updateUserStatusSchema = {
    body: Joi.object({
        status: Joi.string()
            .valid('ACTIVE', 'INACTIVE', 'LOCKED', 'PASSWORD_EXPIRED')
            .required(),
    }),
};

module.exports = {
    createUserSchema,
    updateUserStatusSchema,
};
