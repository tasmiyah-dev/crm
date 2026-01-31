import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsController {

    async getCampaignStats(req: Request, res: Response) {
        try {
            const user = (req as AuthRequest).user;
            if (!user) return res.status(401).json({ error: 'Unauthorized' });

            const { id } = req.params;

            // 1. Sent count (Leads that are processed)
            // 'NEW' means not sent yet. 'CONTACTED', 'REPLIED', 'BOUNCED', 'FAILED' means sent (at least once)
            const sent = await prisma.campaignLead.count({
                where: {
                    campaignId: id,
                    status: { not: 'NEW' }
                }
            });

            // 2. Replied count
            const replied = await prisma.campaignLead.count({
                where: {
                    campaignId: id,
                    status: 'REPLIED'
                }
            });

            // 3. Opened count (Unique Leads)
            const openedRows = await prisma.event.groupBy({
                by: ['leadId'],
                where: {
                    campaignId: id,
                    type: 'EMAIL_OPENED'
                }
            });
            const opened = openedRows.length;

            // 4. Clicked count (Unique Leads? or Total Clicks? Usually Unique for rate)
            const clickedRows = await prisma.event.groupBy({
                by: ['leadId'],
                where: {
                    campaignId: id,
                    type: 'LINK_CLICKED'
                }
            });
            const clicked = clickedRows.length;

            // Rates
            const openRate = sent > 0 ? (opened / sent) * 100 : 0;
            const replyRate = sent > 0 ? (replied / sent) * 100 : 0;
            const clickRate = sent > 0 ? (clicked / sent) * 100 : 0;

            res.json({
                sent,
                opened,
                clicked,
                replied,
                openRate,
                replyRate,
                clickRate
            });

        } catch (error) {
            console.error('[Analytics] Error:', error);
            res.status(500).json({ error: String(error) });
        }
    }
}
