export const generateOtp = (): string => {
  // Generate 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOtp = (otp: string): string => {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');
};

export const verifyOtp = (otp: string, hashedOtp: string): boolean => {
  const crypto = require('crypto');
  const inputHash = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');
  return inputHash === hashedOtp;
};