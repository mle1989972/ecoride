import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middlewares/validate.js';
import { authRequired } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js';
import { createEmployee, suspendUser, getStats } from '../controllers/adminController.js';

const router = Router();

// Toutes les routes admin nécessitent un jeton + rôle admin
router.use(authRequired, requireRole('admin'));

// Créer un compte employé
router.post('/employees', validate(Joi.object({
  email: Joi.string().email().required(),
  pseudo: Joi.string().min(2).required(),
  password: Joi.string().min(8).optional()
})), createEmployee);

// Suspendre un utilisateur
router.post('/suspend/:userId', validate(Joi.object({
  reason: Joi.string().default('suspension'),
  end_date: Joi.date().iso().allow(null)
}).unknown(true)), suspendUser);

// Statistiques (30 derniers jours)
router.get('/stats', getStats);

export default router;
