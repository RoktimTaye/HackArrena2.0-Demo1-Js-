const Joi = require('joi');

const registerTenantSchema = {
    body: Joi.object({
        name: Joi.string().min(2).max(200).required(),
        address: Joi.string().min(2).required(),
        contactEmail: Joi.string().email().required(),
        contactPhone: Joi.string().min(5).max(20).required(),
        licenseNumber: Joi.string().min(3).required(),
        domain: Joi.string().min(3).max(50).required(),
    }),
};

module.exports = {
    registerTenantSchema,
};
