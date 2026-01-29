import { Router } from 'express';
import { WidgetController } from '../controllers/widget.controller';

const router = Router();
const controller = new WidgetController();

router.post('/leads', controller.submitLead);

export default router;
