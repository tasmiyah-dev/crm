import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();
const controller = new AnalyticsController();

router.get('/global', controller.getGlobalStats.bind(controller));
router.get('/campaigns/:id', controller.getCampaignStats.bind(controller));

export default router;
