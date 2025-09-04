import { getRedis } from '../utils/redis';

function otpKey(email: string) {
  return `otp:${email}`;
}

export async function generateAndStoreOtp(email: string): Promise<string> {
  const redis = getRedis();
  const code = (Math.floor(100000 + Math.random() * 900000)).toString();
  await redis.set(otpKey(email), code, 'EX', 60 * 10);
  return code;
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const redis = getRedis();
  const stored = await redis.get(otpKey(email));
  if (!stored) return false;
  const ok = stored === code;
  if (ok) {
    await redis.del(otpKey(email));
  }
  return ok;
}
