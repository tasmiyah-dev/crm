import { Request, Response } from 'express';
import { MailboxService } from '../services/mailbox.service';

const mailboxService = new MailboxService();

export class MailboxController {

    async create(req: Request, res: Response) {
        try {
            // Auto-test before creation? Or let user do it explicitly.
            // For now, simple creation.
            const mailbox = await mailboxService.create(req.body);
            res.status(201).json(mailbox);
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const mailbox = await mailboxService.update(id as string, req.body);
            res.json(mailbox);
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    }

    async test(req: Request, res: Response) {
        try {
            const result = await mailboxService.testConnection(req.body);
            if (result.success) {
                res.json({ status: 'ok', message: 'Connection successful' });
            } else {
                res.status(400).json({ status: 'error', message: result.message });
            }
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    }

    async list(req: Request, res: Response) {
        try {
            const mailboxes = await mailboxService.list();
            res.json(mailboxes);
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await mailboxService.delete(id as string);
            res.json({ status: 'deleted' });
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    }
}
