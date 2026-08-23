import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import academicRoutes from './routes/academic.routes.js';
import authRoutes from './routes/auth.routes.js';
import { generalLimiter } from './middleware/rate-limiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, '../../frontend');

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(cookieParser());

// 1. Root gateway redirect to Login Portal
app.get('/', (req, res) => {
  res.redirect('/screens/01-auth/login.html');
});

// 2. Serve static frontend assets without rate limiting
app.use('/frontend', express.static(frontendPath));
app.use('/screens/03-admin-portal', express.static(path.join(frontendPath, 'screens/04-hod-portal')));
app.use('/screens/04-hod-portal', express.static(path.join(frontendPath, 'screens/04-hod-portal')));
app.use('/screens/02-student-portal', express.static(path.join(frontendPath, 'screens/02-student-portal')));
app.use(express.static(frontendPath));

// Clean route aliases for HOD & Admin pages
app.get(['/fee-analytics', '/fee-payments', '/screens/02-student-portal/fee-analytics.html', '/screens/03-admin-portal/fee-analytics.html'], (req, res) => {
  res.sendFile(path.join(frontendPath, 'screens/04-hod-portal/fee-analytics.html'));
});

app.get(['/students-info', '/dept-students', '/screens/03-admin-portal/students-info.html'], (req, res) => {
  res.sendFile(path.join(frontendPath, 'screens/04-hod-portal/students-info.html'));
});

app.get(['/hod-dashboard', '/dashboard-hod', '/screens/03-admin-portal/hod-dashboard.html'], (req, res) => {
  res.sendFile(path.join(frontendPath, 'screens/04-hod-portal/hod-dashboard.html'));
});

app.get(['/document-approvals', '/doc-approvals', '/screens/03-admin-portal/document-approvals.html'], (req, res) => {
  res.sendFile(path.join(frontendPath, 'screens/04-hod-portal/document-approvals.html'));
});

app.get(['/security-roster', '/security-keys', '/screens/03-admin-portal/security-roster.html'], (req, res) => {
  res.sendFile(path.join(frontendPath, 'screens/04-hod-portal/security-roster.html'));
});

// 2. Parse Body on API requests with 15MB limit for photo uploads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// 3. Apply generalLimiter strictly to API routes
app.use('/api', generalLimiter);

import { getAttendance, syncSbtetAttendance, getResults, syncSbtetResults } from './controllers/academicController.js';
import collaborationRoutes from './routes/collaboration.routes.js';
import documentRoutes from './routes/document.routes.js';
import marketRoutes from './routes/market.routes.js';
import messageRoutes from './routes/message.routes.js';
import { getAllPeerSkills } from './controllers/collaborationController.js';

// 4. API Route Mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/academics', academicRoutes);
app.use('/api/academics', academicRoutes);

// Attendance routes
app.get('/api/student/attendance', getAttendance);
app.get('/api/v1/student/attendance', getAttendance);
app.get('/api/attendance', getAttendance);
app.post('/api/student/attendance/sync', syncSbtetAttendance);
app.post('/api/v1/student/attendance/sync', syncSbtetAttendance);
app.post('/api/attendance/sync', syncSbtetAttendance);

// Academic results routes
app.get('/api/results', getResults);
app.get('/api/v1/results', getResults);
app.get('/api/results/consolidated', getResults);
app.get('/api/v1/results/consolidated', getResults);
app.get('/api/student/results', getResults);
app.get('/api/v1/student/results', getResults);
app.post('/api/results/sync', syncSbtetResults);
app.post('/api/v1/results/sync', syncSbtetResults);
app.post('/api/student/results/sync', syncSbtetResults);
app.post('/api/v1/student/results/sync', syncSbtetResults);

// Idea Hub Collaboration routes
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/v1/collaboration', collaborationRoutes);
app.get('/api/student/peers', getAllPeerSkills);
app.use('/api/student/skills', collaborationRoutes);

// Document Logistics routes
app.use('/api/documents', documentRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/student/documents', documentRoutes);

// Marketplace routes
app.use('/api/marketplace', marketRoutes);
app.use('/api/v1/marketplace', marketRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/v1/market', marketRoutes);

import hodRoutes from './routes/hod.routes.js';

// Unified Messaging routes
app.use('/api/messages', messageRoutes);
app.use('/api/v1/messages', messageRoutes);

// HOD Department Analytics & Batch Sync routes
app.use('/api/hod', hodRoutes);
app.use('/api/v1/hod', hodRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});

// 404 Handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `API Endpoint ${req.originalUrl} not found.` });
});

export default app;
