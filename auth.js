import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middlewares/validate.js';
import { register, login } from '../controllers/authController.js';

const router = Router();

const registerSchema = Joi.object({
  pseudo: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

export default router;
