import express from 'express';
import {Login, Logout, Me} from "../controllers/Auth.js";
import sessionChecker from '../middleware/sessionChecker.js';

const router = express.Router();

router.get('/me', sessionChecker, Me);
router.post('/login', Login);
router.delete('/logout',Logout);

export default router;

