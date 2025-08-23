import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { acceptParticipation } from '../controllers/participationsController.js';

const router = Router();

// Chauffeur accepte une demande de participation
router.post('/:pid/accept', authRequired, acceptParticipation);

export default router;
