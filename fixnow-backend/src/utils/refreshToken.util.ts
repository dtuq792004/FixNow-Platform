import crypto from 'crypto';

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const verifyRefreshToken = (token: string, hashedToken: string): boolean => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return tokenHash === hashedToken;
};
