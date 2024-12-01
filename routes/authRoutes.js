import { Router } from 'express';
const router = Router();
// Controller
import {
  sendOTP,
  verifyOTP,
  generateAccessFromRefresh,
  checkUser,
  verifyCode,
  getProfile,
} from '../controllers/authController.js';
// Middleware
import {
  authorizeUser,
  isAuthenticated,
} from '../middlewares/authMiddleware.js';

// --------------------------------------------------------------------------

// POST
router.route('/send-otp').post(sendOTP);

// POST
router.route('/check').post(checkUser);

// POST
router.route('/verify-otp').post(verifyOTP);

// POST
router.route('/verify-code').post(verifyCode);

// POST
router.route('/refresh-access').post(generateAccessFromRefresh);

// GET
router.route('/me').get(isAuthenticated, authorizeUser, getProfile);

export default router;
