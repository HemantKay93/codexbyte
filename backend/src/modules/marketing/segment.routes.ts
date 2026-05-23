import { Router } from 'express';
import { getSegments, createSegment } from './segment.controller.js';
import { requireAdmin } from '../../middlewares/auth.js';

const router = Router();

router.use(requireAdmin);

router.get('/', getSegments);
router.post('/', createSegment);

export default router;
