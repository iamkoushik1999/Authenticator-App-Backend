import { Router } from 'express';
const router = Router();
// Controller
import { getHistory } from '../controllers/historyController.js';
// Middleware
import {
  authorizeUser,
  isAuthenticated,
} from '../middlewares/authMiddleware.js';

// --------------------------------------------------------------------------

// GET
router.route('/get').get(isAuthenticated, authorizeUser, getHistory);

export default router;
