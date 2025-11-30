// backend/src/config/dbMaster.js
const mongoose = require('mongoose');
const { logger } = require('./logger');

/**
 * Connect to the master MongoDB where tenants/platform data lives.
 */
const connectMasterDb = async () => {
    const uri = process.env.MASTER_DB_URI;

    if (!uri) {
        logger.error('MASTER_DB_URI is not defined in environment variables');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri, {
            // You can add options here if needed
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        logger.info('✅ Connected to Master MongoDB');
    } catch (err) {
        logger.error(`❌ Error connecting to Master MongoDB: ${err.message}`);
        process.exit(1);
    }
};

module.exports = {
    connectMasterDb,
    masterConnection: mongoose, // exported in case we need to access it
};
