import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middlewares/errorHandler.js';
import apiRouter from './routes/index.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve static front from /public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ecoride' }));

// API routes
app.use('/api', apiRouter);

// 404 for API only (let static handle its 404)
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Errors
app.use(errorHandler);

export default app;
