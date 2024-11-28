// Packages
import jwt from 'jsonwebtoken';
// ENV
const { JWT_SECRET } = process.env;

// --------------------------------------------------------------------------

// Generate Access Token
export const generateAccessToken = (user, role) => {
  return jwt.sign(
    {
      id: user._id,
      role: role,
    },
    JWT_SECRET,
    {
      expiresIn: '15d',
    }
  );
};

// Generate Refesh Token
export const generateRefreshToken = (user, role) => {
  return jwt.sign(
    {
      id: user._id,
      role: role,
    },
    JWT_SECRET,
    {
      expiresIn: '365d',
    }
  );
};

// Verify Token
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
