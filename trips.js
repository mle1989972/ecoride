import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middlewares/validate.js';
import { authRequired } from '../middlewares/auth.js';
import {
  listTrips, getTrip, createTrip,
  startTrip, arriveTrip, cancelTrip,
  requestParticipation, myTrips
} from '../controllers/tripsController.js';

const router = Router();
router.get('/mine', authRequired, myTrips);

// Public
router.get('/', listTrips);
router.get('/:id', getTrip);

// Create trip (driver)
const createSchema = Joi.object({
  vehicle_id: Joi.string().uuid().required(),
  origin_city: Joi.string().min(2).required(),
  destination_city: Joi.string().min(2).required(),
  departure_time: Joi.date().iso().required(),
  arrival_time: Joi.date().iso().greater(Joi.ref('departure_time')).required(),
  price_cents: Joi.number().integer().min(0).required(),
  seats_total: Joi.number().integer().min(1).max(8).required()
});

router.post('/', authRequired, validate(createSchema), createTrip);

// Passenger requests participation
router.post('/:id/participations', authRequired, requestParticipation);

// Driver actions
router.post('/:id/start', authRequired, startTrip);
router.post('/:id/arrive', authRequired, arriveTrip);
router.post('/:id/cancel', authRequired, cancelTrip);

export default router;