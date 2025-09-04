import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { getRedis } from '../utils/redis';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET || getJwtSecret();
  return secret;
}

export async function registerUser(email: string, name: string, password: string): Promise<IUser> {
  const existing = await User.findOne({ email });
  if (existing) throw new Error('EMAIL_IN_USE');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name, passwordHash });
  return user;
}

export async function verifyUser(email: string, password: string): Promise<IUser> {
  const user = await User.findOne({ email });
  if (!user) throw new Error('INVALID_CREDENTIALS');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('INVALID_CREDENTIALS');
  return user;
}

export function issueTokens(user: IUser): Tokens {
  const payload = { sub: user.id, email: user.email, name: user.name };
  const accessToken = jwt.sign(payload, getJwtSecret(), { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: user.id }, getRefreshSecret(), { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const redis = getRedis();
  const key = `refresh:${userId}:${token}`;
  const ttlSeconds = 60 * 60 * 24 * 7;
  await redis.set(key, '1', 'EX', ttlSeconds);
}

export async function revokeRefreshToken(userId: string, token: string): Promise<void> {
  const redis = getRedis();
  const key = `refresh:${userId}:${token}`;
  await redis.del(key);
}

export async function isRefreshTokenValid(userId: string, token: string): Promise<boolean> {
  const redis = getRedis();
  const key = `refresh:${userId}:${token}`;
  const exists = await redis.exists(key);
  return exists === 1;
}
