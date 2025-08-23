import { Router } from 'express';
import authRouter from './auth.js';
import tripsRouter from './trips.js';
import reviewsRouter from './reviews.js';
import adminRouter from './admin.js';
import participationsRouter from './participations.js';
import vehiclesRouter from './vehicles.js';
import preferencesRouter from './preferences.js';
import incidentsRouter from './incidents.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/trips', tripsRouter);
router.use('/reviews', reviewsRouter);
router.use('/admin', adminRouter);
router.use('/participations', participationsRouter);
router.use('/vehicles', vehiclesRouter);
router.use('/preferences', preferencesRouter);
router.use('/incidents', incidentsRouter);

export default router;
