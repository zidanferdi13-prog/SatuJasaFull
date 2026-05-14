import { Router } from 'express';
import { TrackingController } from './tracking.controller';

const router = Router();

// Public — no auth required
router.get('/:trackingCode', TrackingController.getStatus);

export default router;
