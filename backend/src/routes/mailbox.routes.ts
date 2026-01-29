import { Router } from 'express';
import { MailboxController } from '../controllers/mailbox.controller';

const router = Router();
const controller = new MailboxController();

router.get('/', controller.list.bind(controller));
router.post('/', controller.create.bind(controller));
router.post('/test-connection', controller.test.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
