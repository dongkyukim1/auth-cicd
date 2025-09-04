import nodemailer from 'nodemailer';

export function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    // 개발/테스트 환경 폴백: 실제 SMTP 없이 콘솔에 메시지를 기록합니다.
    console.warn('[mail] SMTP env missing. Falling back to jsonTransport (no real email sent).');
    return nodemailer.createTransport({ jsonTransport: true });
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export async function sendOtpEmail(to: string, code: string) {
  const transporter = createTransport();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'dev@example.com';
  const mailOptions = {
    from,
    to,
    subject: '[AuthStack] 인증 코드',
    text: `인증 코드: ${code} (10분 내 사용)`,
    html: `<p>인증 코드: <b>${code}</b></p><p>10분 내 사용하세요.</p>`
  };
  const info = await new Promise<any>((resolve, reject) => {
    (transporter as any).sendMail(mailOptions, (err: Error | null, info: any) => {
      if (err) return reject(err);
      resolve(info);
    });
  });
  // jsonTransport 사용 시 개발 편의를 위해 로그 출력
  if ((transporter as any).options?.jsonTransport) {
    console.log('[mail] Sent OTP (dev mode):', { to, code, info });
  }
}
