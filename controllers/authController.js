// Packages
import expressAsyncHandler from 'express-async-handler';
import speakeasy from 'speakeasy';
// Models
import userModel from '../models/userModel.js';
import historyModel from '../models/historyModel.js';
// Helper
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../helpers/authHelper.js';

// --------------------------------------------------------------------------

// POST
// Send OTP
export const sendOTP = expressAsyncHandler(async (req, res) => {
  const { auth } = req.query;
  if (!auth) {
    res.status(400);
    throw new Error('Required fields are missing(auth)');
  }
  if (auth === 'signup') {
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
  } else if (auth === 'login') {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Required fields are missing(email)');
    }
    const userData = await userModel.findOne({ email });
    if (!userData) {
      res.status(400);
      throw new Error('User doesnot exists');
    }

    const otp = Math.floor(Math.random() * 1000000);

    userData.otp = otp;
    await userData.save();

    res.status(200).json({
      message: `Your OTP is ${otp}`,
      success: true,
    });
  } else {
    res.status(400);
    throw new Error('Invalid auth');
  }
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
// Login
export const verifyCode = expressAsyncHandler(async (req, res) => {
  const { code, email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Required fields are missing(code, email)');
  }

  const userData = await userModel.findOne({ email: email });
  if (!userData) {
    res.status(401);
    throw new Error('User not found');
  }

  const secret = userData.twoFASecret;
  // Verify the provided token with the stored secret
  const verified = await speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: code,
  });
  if (!verified) {
    res.status(400);
    throw new Error('Invalid 2FA Code');
  }
  const accessToken = generateAccessToken(userData, 'user');
  const refreshToken = generateRefreshToken(userData, 'user');

  await historyModel.create({
    user: userData.id,
    mode: '2FA',
    lastLogin: Date.now(),
  });

  res.status(200).json({
    message: '2FA verified successfully',
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

// GET
// Profile
export const getProfile = expressAsyncHandler(async (req, res) => {
  const userData = await userModel
    .findById(req.user.id)
    .select('-password -twoFASecret -otp -otpVerified');
  if (!userData) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({ data: userData });
});
