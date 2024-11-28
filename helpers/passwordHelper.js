import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Hash Password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Match Password
export const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

// Reset Password Token
export const generateResetToken = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const expireTime = Date.now() + 15 * 60 * 1000;

  return { resetToken, hashedToken, expireTime };
};
