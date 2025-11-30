// backend/server.js
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { connectMasterDb } = require('./config/db');
const { logger } = require('./src/config/logger');
const { closeAllTenantConnections } = require('./src/config/tenantDbManager');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectMasterDb();

        const server = http.createServer(app);

        server.listen(PORT, () => {
            logger.info(`🚀 Server is running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
        });

        // Graceful shutdown
        const shutdown = async (signal) => {
            logger.info(`${signal} received: closing server...`);
            server.close(async (err) => {
                if (err) {
                    logger.error('Error closing HTTP server', err);
                    process.exit(1);
                }

                try {
                    await closeAllTenantConnections();
                } catch (e) {
                    logger.error('Error closing tenant connections during shutdown', e);
                }

                logger.info('Shutdown complete. Bye 👋');
                process.exit(0);
            });
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    } catch (err) {
        logger.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
