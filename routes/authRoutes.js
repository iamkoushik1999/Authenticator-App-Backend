import { Router } from 'express';
const router = Router();
// Controller
import {
  sendOTP,
  verifyOTP,
  generateAccessFromRefresh,
  checkUser,
} from '../controllers/authController.js';
// Middleware
import { isAuthenticated } from '../middlewares/authMiddleware.js';

// --------------------------------------------------------------------------

// POST
router.route('/send-otp').post(sendOTP);

// POST
router.route('/check').post(checkUser);

// POST
router.route('/verify-otp').post(verifyOTP);

// POST
router.route('/refresh-access').post(generateAccessFromRefresh);

export default router;
