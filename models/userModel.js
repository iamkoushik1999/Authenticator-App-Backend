import mongoose from 'mongoose';
import {
  comparePassword,
  generateResetToken,
  hashPassword,
} from '../helpers/passwordHelper.js';

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: 'user',
    },
    otp: {
      type: String,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    twoFASecret: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hash Password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await hashPassword(this.password);
  next();
});

// Match Password
userSchema.method('comparePassword', async function (enteredPassword) {
  return await comparePassword(enteredPassword, this.password);
});

// Reset Password Token
userSchema.methods.getResetToken = function () {
  const { resetToken, hashedToken, expireTime } = generateResetToken();
  this.resetPasswordToken = hashedToken;
  this.resetPasswordExpire = expireTime;
  return resetToken;
};

const userModel = mongoose.model('User', userSchema);
export default userModel;
