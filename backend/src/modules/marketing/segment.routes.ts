import { Router } from 'express';

import { requireAdmin } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

import { getSegments, createSegment } from './segment.controller.js';
import { createSegmentSchema } from './marketing.validator.js';

const router = Router();

router.use(requireAdmin);

router.get('/', getSegments);
router.post('/', validate(createSegmentSchema), createSegment);

export default router;
