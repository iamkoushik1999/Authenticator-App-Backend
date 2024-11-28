// Packages
import expressAsyncHandler from 'express-async-handler';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
// Models
import userModel from '../models/userModel.js';
import historyModel from '../models/historyModel.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../helpers/authHelper.js';

// --------------------------------------------------------------------------

// POST
// Generate 2 Factor Code
export const generate2FACode = expressAsyncHandler(async (req, res) => {
  const secret = await speakeasy.generateSecret({
    length: 20,
    name: 'Authenticator App',
  });

  // Save the secret in the user's document in MongoDB
  await userModel.findByIdAndUpdate(req.user._id, {
    twoFASecret: secret.base32,
  });

  // Generate QR code data
  const otpauthURL = secret.otpauth_url;
  QRCode.toDataURL(otpauthURL, (err, dataUrl) => {
    if (err) {
      res.status(500);
      throw new Error('QR code generation failed');
    }

    res.status(200).json({
      qrCodeDataUrl: dataUrl,
      success: true,
    });
  });
});

// POST
// Verify 2 Factor Code
export const verify2FACode = expressAsyncHandler(async (req, res) => {
  const { code, email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Required fields are missing(email, password)');
  }

  const userData = await userModel.findOne({ email: email });
  if (!userData) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  const { password: pass, ...user } = userData._doc;

  const checkPassword = await userData.comparePassword(password);
  if (!checkPassword) {
    res.status(400);
    throw new Error('Invalid user credential');
  }

  if (!userData.otpVerified) {
    res.status(400);
    throw new Error('User not otp verified');
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

  userData.isVerified = true;
  await userData.save();

  const accessToken = generateAccessToken(userData);
  const refreshToken = generateRefreshToken(userData);

  await historyModel.create({
    email: userData.email,
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
