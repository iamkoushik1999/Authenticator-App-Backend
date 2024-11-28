import mongoose from 'mongoose';
import {
  comparePassword,
  generateResetToken,
  hashPassword,
} from '../helpers/passwordHelper.js';

const adminSchema = mongoose.Schema(
  {
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hash Password
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await hashPassword(this.password);
  next();
});

// Match Password
adminSchema.method('comparePassword', async function (enteredPassword) {
  return await comparePassword(enteredPassword, this.password);
});

// Reset Password Token
adminSchema.methods.getResetToken = function () {
  const { resetToken, hashedToken, expireTime } = generateResetToken();
  this.resetPasswordToken = hashedToken;
  this.resetPasswordExpire = expireTime;
  return resetToken;
};

const adminModel = mongoose.model('Admin', adminSchema);
export default adminModel;
