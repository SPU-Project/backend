// routes/uploadRoute.js

import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { uploadProfileImage } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/upload-profile', upload.single('profileImage'), uploadProfileImage);

export default router;
