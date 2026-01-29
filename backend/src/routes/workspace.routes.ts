import { Router } from 'express';
import { WorkspaceController } from '../controllers/workspace.controller';

const router = Router();
const controller = new WorkspaceController();

router.get('/', controller.get);
router.post('/checkout', controller.createCheckoutSession);
router.post('/dev-upgrade', controller.devUpgrade);

export default router;
