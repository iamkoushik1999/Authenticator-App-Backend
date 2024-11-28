// Packages
import expressAsyncHandler from 'express-async-handler';
// Models
import adminModel from '../models/adminModel.js';
import userModel from '../models/userModel.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../helpers/authHelper.js';

// --------------------------------------------------------------------------

// POST
// Admin Login
export const adminLogin = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Required fields are missing(email, password)');
  }
  const adminData = await adminModel.findOne({ email });
  if (!adminData) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const { password: pass, ...admin } = adminData._doc;

  const checkPassword = await adminData.comparePassword(password);
  if (!checkPassword) {
    res.status(400);
    throw new Error('Invalid admin credential');
  }

  const accessToken = generateAccessToken(admin, 'admin');
  const refreshToken = generateRefreshToken(admin, 'admin');

  res.status(200).json({
    message: 'Admin logged in successfully',
    success: true,
    accessToken,
    refreshToken,
  });
});

// GET
// Get Users
export const getUsers = expressAsyncHandler(async (req, res) => {
  const users = await userModel
    .find({ role: 'user' })
    .select('_id email role otpVerified isVerified createdAt');

  const totalUsers = await userModel.countDocuments({ role: 'user' });

  res.status(200).json({
    data: users,
    total: totalUsers,
  });
});

// PUT
// Update Status
export const updateStatus = expressAsyncHandler(async (req, res) => {
  const { userId, otpVerified, isVerified } = req.body;
  if (!userId) {
    res.status(400);
    throw new Error('Required fields are missing');
  }
  const userData = await userModel.findById(userId);
  if (!userData) {
    res.status(404);
    throw new Error('User not found');
  }

  // Explicitly check for null or undefined to handle `false` correctly
  if (otpVerified !== null && otpVerified !== undefined) {
    userData.otpVerified = otpVerified;
  }
  if (isVerified !== null && isVerified !== undefined) {
    userData.isVerified = isVerified;
  }

  await userData.save();

  res.status(200).json({
    message: 'User status updated',
    success: true,
    data: {
      userId: userData._id,
      otpVerified: userData.otpVerified,
      isVerified: userData.isVerified,
    },
  });
});
