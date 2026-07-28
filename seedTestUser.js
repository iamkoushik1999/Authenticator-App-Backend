// One-off script to seed a demo account (test@test.com / 123456) plus related
// data, so the frontend "Autofill" button on Login/Admin Sign In has a real
// account to log into. Safe to re-run — it replaces the previous demo docs.
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import speakeasy from 'speakeasy';
import connectDB from './config/dbConfig.js';
import userModel from './models/userModel.js';
import adminModel from './models/adminModel.js';
import historyModel from './models/historyModel.js';

dotenv.config();

const DEMO_EMAIL = 'test@test.com';
const DEMO_PASSWORD = '123456';

const run = async () => {
  await connectDB();

  await userModel.deleteMany({ email: DEMO_EMAIL });
  await adminModel.deleteMany({ email: DEMO_EMAIL });
  await historyModel.deleteMany({ user: DEMO_EMAIL });

  const twoFASecret = speakeasy.generateSecret({
    length: 20,
    name: 'Authenticator App (test@test.com)',
  }).base32;

  const user = new userModel({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    role: 'user',
    otpVerified: true,
    isVerified: true,
    twoFASecret,
  });
  await user.save();

  const admin = new adminModel({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    role: 'admin',
  });
  await admin.save();

  await historyModel.create([
    { user: DEMO_EMAIL, mode: 'otp', lastLogin: new Date() },
    {
      user: DEMO_EMAIL,
      mode: '2fa',
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ]);

  console.log('Seeded demo user + admin + login history for test@test.com');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
