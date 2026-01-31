import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();
const controller = new AnalyticsController();

router.get('/campaigns/:id', controller.getCampaignStats);

export default router;
