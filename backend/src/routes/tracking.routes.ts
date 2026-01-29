import { Router } from 'express';
import { TrackingController } from '../controllers/tracking.controller';

const router = Router();
const controller = new TrackingController();

router.get('/pixel.png', controller.trackOpen.bind(controller));
router.get('/click', controller.trackClick.bind(controller));

export default router;
