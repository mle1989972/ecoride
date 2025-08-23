import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middlewares/validate.js';
import { authRequired } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js';
import { createReview, moderateReview, listPendingReviews } from '../controllers/reviewsController.js';

const router = Router();

const createSchema = Joi.object({
  trip_id: Joi.string().uuid().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow('').max(1000)
});

// Passager d'un trajet arrivé : laisse un avis
router.post('/', authRequired, validate(createSchema), createReview);

// Employé/Admin : lister les avis en attente
router.get('/pending', authRequired, requireRole('employee','admin'), listPendingReviews);

// Employé/Admin : modère un avis
router.post('/:id/moderate', authRequired, requireRole('employee','admin'), moderateReview);

export default router;
