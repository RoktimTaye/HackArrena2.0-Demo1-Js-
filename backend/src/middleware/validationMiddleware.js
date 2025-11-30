// backend/src/middleware/validationMiddleware.js
const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const toValidate = {};
        if (schema.body) toValidate.body = req.body;
        if (schema.query) toValidate.query = req.query;
        if (schema.params) toValidate.params = req.params;

        const joiSchema = Joi.object(schema);
        const { error, value } = joiSchema.validate(toValidate, {
            abortEarly: false,
            allowUnknown: true, // Allow unknown for now, but strip them below
            stripUnknown: true, // Sanitize: remove unknown fields
        });

        if (error) {
            const messages = error.details.map((d) => d.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages,
            });
        }

        if (value.body) req.body = value.body;
        if (value.query) req.query = value.query;
        if (value.params) req.params = value.params;

        next();
    };
};

module.exports = {
    validate,
};
