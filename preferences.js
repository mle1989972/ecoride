import { Router } from 'express';
import Joi from 'joi';
import { authRequired } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { getMyPreferences, updateMyPreferences } from '../controllers/preferencesController.js';

const router = Router();
router.use(authRequired);

const updateSchema = Joi.object({
  smoke_allowed: Joi.boolean().optional(),
  animals_allowed: Joi.boolean().optional(),
  notes: Joi.string().allow('', null).max(500).optional()
}).min(1);

router.get('/', getMyPreferences);
router.put('/', validate(updateSchema), updateMyPreferences);

export default router;
