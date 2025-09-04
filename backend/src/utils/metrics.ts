import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});
register.registerMetric(httpRequestDuration);

// Custom auth flow counters
export const emailSendTotal = new client.Counter({
  name: 'auth_email_send_total',
  help: 'Number of email send attempts',
  labelNames: ['result']
});
register.registerMetric(emailSendTotal);

export const otpVerifyTotal = new client.Counter({
  name: 'auth_otp_verify_total',
  help: 'Number of OTP verify attempts',
  labelNames: ['result']
});
register.registerMetric(otpVerifyTotal);

export const userRegisterTotal = new client.Counter({
  name: 'auth_register_total',
  help: 'Number of user register attempts',
  labelNames: ['result']
});
register.registerMetric(userRegisterTotal);

export const userLoginTotal = new client.Counter({
  name: 'auth_login_total',
  help: 'Number of user login attempts',
  labelNames: ['result']
});
register.registerMetric(userLoginTotal);

// Web Vitals histograms (frontend -> backend ingest)
// Values are expected in seconds for time-based metrics
// 웹바이탈 메트릭 제거로 단순화

// Ensure metrics appear even before first event
export function initAuthMetrics() {
  for (const result of ['success', 'error']) {
    emailSendTotal.labels(result).inc(0);
    otpVerifyTotal.labels(result).inc(0);
    userRegisterTotal.labels(result).inc(0);
    userLoginTotal.labels(result).inc(0);
  }
}

export function metricsMiddleware() {
  return async (req: any, res: any, next: any) => {
    const end = httpRequestDuration.startTimer({ method: req.method, route: req.path });
    res.on('finish', () => end({ code: res.statusCode }));
    next();
  };
}

export function metricsHandler() {
  return async (_req: any, res: any) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  };
}
