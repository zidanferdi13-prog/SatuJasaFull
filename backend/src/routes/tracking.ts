import { Router } from 'express';
import { TrackingController } from '../controllers/TrackingController';

const router = Router();

router.get('/:tracking_token', TrackingController.getStatus);
router.get('/:tracking_token/history', TrackingController.getHistory);

export default router;
