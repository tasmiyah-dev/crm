import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();
const controller = new WebhookController();

router.post('/event', controller.handleEvent.bind(controller));

// Mock endpoint to simulate receiving a reply for testing
router.post('/simulate-reply', controller.handleEvent.bind(controller));

export default router;
