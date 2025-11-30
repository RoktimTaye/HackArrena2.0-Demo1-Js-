// backend/src/config/logger.js
const { createLogger, format, transports } = require('winston');

const logLevel = process.env.LOG_LEVEL || 'info';
const isProd = process.env.NODE_ENV === 'production';

const logger = createLogger({
    level: logLevel,
    format: isProd
        ? format.combine(
            format.timestamp(),
            format.errors({ stack: true }),
            format.splat(),
            format.json()
        )
        : format.combine(
            format.timestamp(),
            format.colorize(),
            format.printf(({ level, message, timestamp, stack }) => {
                if (stack) {
                    return `${timestamp} [${level}]: ${message} - ${stack}`;
                }
                return `${timestamp} [${level}]: ${message}`;
            })
        ),
    defaultMeta: { service: 'hms-backend' },
    transports: [new transports.Console()],
});

module.exports = {
    logger,
};
