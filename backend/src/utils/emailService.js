// backend/src/utils/emailService.js
const nodemailer = require('nodemailer');
const { logger } = require('../config/logger');

let transporter = null;

const createTransporter = () => {
    if (
        !process.env.EMAIL_HOST ||
        !process.env.EMAIL_PORT ||
        !process.env.EMAIL_USER ||
        !process.env.EMAIL_PASS
    ) {
        logger.warn('Email environment variables not fully configured. Emails will not be sent.');
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        if (!transporter) {
            transporter = createTransporter();
        }

        if (!transporter) {
            // No config: just log
            logger.info(`Email not sent (no SMTP configured). To: ${to}, Subject: ${subject}`);
            return;
        }

        const from =
            process.env.EMAIL_FROM || `"HMS Support" <${process.env.EMAIL_USER || 'no-reply@example.com'}>`;

        const info = await transporter.sendMail({
            from,
            to,
            subject,
            text,
            html,
        });

        logger.info(`Email sent: ${info.messageId} to ${to}`);
    } catch (err) {
        logger.error('Error sending email:', err.message);
    }
};

module.exports = {
    sendEmail,
};
