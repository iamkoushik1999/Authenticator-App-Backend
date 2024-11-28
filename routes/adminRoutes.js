import { Router } from 'express';
const router = Router();
// Controller
import {
  adminLogin,
  getUsers,
  updateStatus,
} from '../controllers/adminController.js';
import {
  authorizeAdmin,
  isAuthenticated,
} from '../middlewares/authMiddleware.js';

// --------------------------------------------------------------------------

// POST
router.route('/login').post(adminLogin);

// GET
router.route('/users').get(isAuthenticated, authorizeAdmin, getUsers);

// PUT
router.route('/status').put(isAuthenticated, authorizeAdmin, updateStatus);

export default router;