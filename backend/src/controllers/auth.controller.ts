import { Request, Response } from 'express';
import { z } from 'zod';
import {
  registerUser,
  verifyUser,
  issueTokens,
  storeRefreshToken
} from '../services/auth.service';
import { generateAndStoreOtp, verifyOtp } from '../services/otp.service';
import { sendOtpEmail } from '../services/mail.service';
import { emailSendTotal, otpVerifyTotal, userLoginTotal, userRegisterTotal } from '../utils/metrics';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  code: z.string().min(4).max(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function sendCode(req: Request, res: Response) {
  try {
    const body = z.object({ email: z.string().email() }).parse(req.body);
    const code = await generateAndStoreOtp(body.email);
    await sendOtpEmail(body.email, code);
    emailSendTotal.inc({ result: 'success' });
    res.status(200).json({ ok: true });
  } catch (err: any) {
    emailSendTotal.inc({ result: 'error' });
    res.status(400).json({ error: 'SEND_CODE_FAILED' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { email, name, password, code } = registerSchema.parse(req.body);
    const valid = await verifyOtp(email, code);
    otpVerifyTotal.inc({ result: valid ? 'success' : 'error' });
    if (!valid) return res.status(400).json({ error: 'INVALID_CODE' });
    const user = await registerUser(email, name, password);
    const tokens = issueTokens(user);
    await storeRefreshToken(user.id, tokens.refreshToken);
    userRegisterTotal.inc({ result: 'success' });
    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name }, tokens });
  } catch (err: any) {
    userRegisterTotal.inc({ result: 'error' });
    const code = err?.message === 'EMAIL_IN_USE' ? 409 : 400;
    res.status(code).json({ error: err?.message || 'BAD_REQUEST' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await verifyUser(email, password);
    const tokens = issueTokens(user);
    await storeRefreshToken(user.id, tokens.refreshToken);
    userLoginTotal.inc({ result: 'success' });
    res.status(200).json({ user: { id: user.id, email: user.email, name: user.name }, tokens });
  } catch (err: any) {
    userLoginTotal.inc({ result: 'error' });
    const code = err?.message === 'INVALID_CREDENTIALS' ? 401 : 400;
    res.status(code).json({ error: err?.message || 'BAD_REQUEST' });
  }
}
