import { Router } from 'express';
import Joi from 'joi';
import { authRequired } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  listVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle
} from '../controllers/vehiclesController.js';

const router = Router();
router.use(authRequired);

const energyEnum = ['electric','hybrid','petrol','diesel'];

const createSchema = Joi.object({
  make: Joi.string().min(1).max(50).required(),
  model: Joi.string().min(1).max(50).required(),
  color: Joi.string().allow('', null).max(40),
  energy: Joi.string().valid(...energyEnum).required(),
  seats: Joi.number().integer().min(1).max(8).required()
});

const updateSchema = Joi.object({
  make: Joi.string().min(1).max(50),
  model: Joi.string().min(1).max(50),
  color: Joi.string().allow('', null).max(40),
  energy: Joi.string().valid(...energyEnum),
  seats: Joi.number().integer().min(1).max(8)
}).min(1);

router.get('/', listVehicles);
router.get('/:id', getVehicle);
router.post('/', validate(createSchema), createVehicle);
router.put('/:id', validate(updateSchema), updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
