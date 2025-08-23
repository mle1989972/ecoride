import { Router } from 'express';
import Joi from 'joi';
import { authRequired } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js';
import { validate } from '../middlewares/validate.js';
import { createIncident, listIncidents, updateIncidentStatus } from '../controllers/incidentsController.js';

const router = Router();
router.use(authRequired);

const createSchema = Joi.object({
  trip_id: Joi.string().uuid().required(),
  summary: Joi.string().min(5).max(200).required(),
  description: Joi.string().allow('', null).max(2000)
});

const updateSchema = Joi.object({
  status: Joi.string().valid('open','in_review','closed').required()
});

router.post('/', validate(createSchema), createIncident);
router.get('/', listIncidents);
router.patch('/:id', requireRole('employee','admin'), validate(updateSchema), updateIncidentStatus);

export default router;
