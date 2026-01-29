import { Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { PrismaClient } from '@prisma/client';

const eventService = new EventService();
const prisma = new PrismaClient();

export class WebhookController {

    /**
     * Generic Webhook Receiver
     * POST /webhooks/event
     * Body: { type: 'REPLY' | 'BOUNCE', email: string, campaignId: string, leadId: string, meta: any }
     */
    async handleEvent(req: Request, res: Response) {
        const { type, email, campaignId, leadId, meta } = req.body;

        try {
            if (type === 'REPLY') {
                // Log Event
                await eventService.logEvent('REPLY_RECEIVED', campaignId, leadId, meta);

                // Logic: Update Lead Status -> REPLIED
                if (leadId && campaignId) {
                    await prisma.campaignLead.update({
                        where: { campaignId_leadId: { campaignId, leadId } },
                        data: { status: 'REPLIED', nextActionAt: null } // Stop sequence
                    });
                }
            }
            else if (type === 'BOUNCE') {
                await eventService.logEvent('BOUNCED', campaignId, leadId, meta);
                // Logic: Update Lead Status -> BOUNCED
                if (leadId && campaignId) {
                    await prisma.campaignLead.update({
                        where: { campaignId_leadId: { campaignId, leadId } },
                        data: { status: 'BOUNCED', nextActionAt: null }
                    });
                }
            }

            res.json({ status: 'ok' });
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    }
}
