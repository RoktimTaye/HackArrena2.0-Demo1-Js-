// backend/src/modules/users/role.model.js
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
        permissions: {
            type: [String], // e.g. ['USER_CREATE', 'PATIENT_READ']
            default: [],
        },
    },
    { timestamps: true }
);

const getRoleModel = (connection) => {
    try {
        return connection.model('Role');
    } catch (e) {
        return connection.model('Role', roleSchema);
    }
};

module.exports = {
    getRoleModel,
};
