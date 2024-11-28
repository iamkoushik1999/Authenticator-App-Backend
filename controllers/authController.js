// Packages
import expressAsyncHandler from 'express-async-handler';
// Models
import userModel from '../models/userModel.js';
// Helper
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../helpers/authHelper.js';
import historyModel from '../models/historyModel.js';

// --------------------------------------------------------------------------

// POST
// Send OTP
export const sendOTP = expressAsyncHandler(async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (!email || !password || !confirmPassword) {
    res.status(400);
    throw new Error('Required fields are missing(email, password)');
  }
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }
  const userData = await userModel.findOne({ email });
  if (userData) {
    res.status(400);
    throw new Error('User already exists');
  }

  const otp = Math.floor(Math.random() * 1000000);

  await userModel.create({
    email,
    password,
    otp,
  });

  res.status(200).json({
    message: `Your OTP is ${otp}`,
    success: true,
  });
});

// POST
// Check If User is OTP Verified
export const checkUser = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Required fields are missing(email)');
  }
  const userData = await userModel.findOne({ email });
  if (!userData) {
    res.status(404);
    throw new Error('User not found');
  }
  if (!userData.otpVerified) {
    res.status(400);
    throw new Error('User not otp verified');
  }

  res.status(200).json({
    message: 'User is OTP Verified',
    success: true,
  });
});

// POST
// Verify OTP
export const verifyOTP = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400);
    throw new Error('Required fields are missing(email, otp)');
  }
  const userData = await userModel.findOne({ email });
  if (!userData) {
    res.status(404);
    throw new Error('User not found');
  }
  if (userData.otpVerified) {
    res.status(400);
    throw new Error('User already verified');
  }
  if (userData.otp !== otp) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  userData.otpVerified = true;
  await userData.save();

  const accessToken = generateAccessToken(userData, 'user');
  const refreshToken = generateRefreshToken(userData, 'user');

  await historyModel.create({
    user: userData.id,
    mode: 'OTP',
    lastLogin: Date.now(),
  });

  res.status(200).json({
    message: 'User verified successfully',
    success: true,
    accessToken,
    refreshToken,
  });
});

// POST
// GENERATE ACCESS TOKEN from REFRESH TOKEN
export const generateAccessFromRefresh = expressAsyncHandler(
  async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Refresh token is required.');
    }

    try {
      // Verify the refresh token
      const decoded = verifyToken(refreshToken);
      let accessToken;

      const userData = await userModel.findOne({ _id: decoded.id });
      if (!userData) {
        res.status(403);
        throw new Error('Invalid refresh token.');
      }
      accessToken = generateAccessToken(userData);

      // Return the access token
      res.status(200).json({
        message: 'Access token generated',
        success: true,
        accessToken: accessToken,
      });
    } catch (error) {
      // Handle expired refresh token
      if (error.name === 'TokenExpiredError') {
        res.status(403);
        throw new Error('Please login again');
      } else {
        res.status(403);
        throw new Error('Please login again');
      }
    }
  }
);
