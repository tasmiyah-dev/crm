import { Router } from 'express';
import { TrackingController } from '../controllers/tracking.controller';

const router = Router();

router.get('/open', TrackingController.trackOpen);
router.get('/click', TrackingController.trackClick);

export default router;
