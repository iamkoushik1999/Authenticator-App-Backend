// Packages
import expressAsyncHandler from 'express-async-handler';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
// Models
import userModel from '../models/userModel.js';
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
  const { code } = req.body;
  if (!code) {
    res.status(400);
    throw new Error('Required fields are missing(code)');
  }

  const userData = await userModel.findById(req.user._id);
  if (!userData) {
    res.status(401);
    throw new Error('Invalid User');
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

  res.status(200).json({
    message: '2FA verified successfully',
    success: true,
  });
});
