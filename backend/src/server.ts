import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectToDatabase } from './utils/db';
import { createRedisClient } from './utils/redis';
import authRouter from './routes/auth.routes';
import { metricsHandler, metricsMiddleware, initAuthMetrics } from './utils/metrics';

dotenv.config();

const app = express();

app.use(cors({ origin: '*', credentials: false }));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);
app.use(metricsMiddleware());

// initialize custom metrics zero values
initAuthMetrics();

app.get('/health', (_: Request, res: Response) => {
  res.status(200).json({ ok: true, service: 'backend', time: new Date().toISOString() });
});

app.get('/metrics', metricsHandler());

app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await connectToDatabase();
  await createRedisClient();
  app.listen(PORT, () => {
    console.log(`[server] listening on :${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[bootstrap] fatal', err);
  process.exit(1);
});
