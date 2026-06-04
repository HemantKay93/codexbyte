import { Router } from 'express';

import { requireAdmin } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

import { getSegments, createSegment, updateSegment } from './segment.controller.js';
import { createSegmentSchema } from './marketing.validator.js';

const router = Router();

router.use(requireAdmin);

router.get('/', getSegments);
router.post('/', validate(createSegmentSchema), createSegment);
router.put('/:id', validate(createSegmentSchema), updateSegment);

export default router;
