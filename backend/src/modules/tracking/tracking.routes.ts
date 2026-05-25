import { Router } from 'express';
import { trackingLimiter } from '../../shared/middleware/rate-limit.middleware';
import { TrackingController } from './tracking.controller';

const router = Router();

// Public — no auth required
router.get('/:trackingCode', trackingLimiter, TrackingController.getStatus);

export default router;
