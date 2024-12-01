import { Router } from 'express';
const router = Router();
// Controller
import {
  generate2FACode,
  verify2FACode,
} from '../controllers/twoFAController.js';
// Middleware
import {
  authorizeUser,
  isAuthenticated,
} from '../middlewares/authMiddleware.js';

// --------------------------------------------------------------------------

// POST
router.route('/generate').post(isAuthenticated, authorizeUser, generate2FACode);

// POST
router.route('/verify').post(isAuthenticated, authorizeUser, verify2FACode);

export default router;
