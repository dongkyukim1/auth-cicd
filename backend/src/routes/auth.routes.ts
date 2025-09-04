import { Router } from 'express';
import { login, register, sendCode } from '../controllers/auth.controller';

const router = Router();

router.post('/send-code', sendCode);
router.post('/register', register);
router.post('/login', login);

export default router;
