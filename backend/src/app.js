// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./config/logger');

const tenantRoutes = require('./modules/tenants/tenant.routes');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const patientRoutes = require('./modules/patients/patient.routes');
const prescriptionRoutes = require('./modules/prescriptions/prescription.routes');
const menuRoutes = require('./modules/menu/menu.routes');
const passwordRoutes = require('./modules/security/password.routes');
const labRoutes = require('./modules/lab/lab.routes');
const vitalsRoutes = require('./modules/vitals/vitals.routes');
const appointmentRoutes = require('./modules/appointments/appointment.routes');
const app = express();

// --- Security Middlewares ---
app.use(helmet());

// --- CORS ---
// --- CORS ---
const whitelist = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (whitelist.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);

// --- Body Parser ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- HTTP Request Logging ---
app.use(
    morgan('dev', {
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    })
);

// --- Rate Limiting for API (basic global limiter) ---
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', apiLimiter);
app.use('/api/tenants', tenantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/lab-requests', labRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/appointments', appointmentRoutes);

// --- Simple root route ---
app.get('/', (req, res) => {
    res.send('Hospital HMS Backend API');
});

// --- Health check route ---
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Backend is running',
    });
});

// Add liveness
app.get('/api/health/live', (req, res) => {
    res.json({ status: 'live' });
});

// Add readiness (can be extended to check DB)
app.get('/api/health/ready', (req, res) => {
    // later you can check mongoose connection state
    res.json({ status: 'ready' });
});

// TODO: Mount feature routes here later, for example:
// const tenantRoutes = require('./modules/tenants/tenant.routes');
// app.use('/api/tenants', tenantRoutes);

// --- Error handlers ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
