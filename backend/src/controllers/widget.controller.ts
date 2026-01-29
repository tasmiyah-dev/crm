import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { LeadService } from '../services/lead.service';

const prisma = new PrismaClient();
const leadService = new LeadService();

export class WidgetController {

    async submitLead(req: Request, res: Response) {
        try {
            const { email, name, campaignId, redirectUrl, workspaceId } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            // If campaignId provided, verify it exists and get workspaceId from it
            // If only workspaceId provided, just add to global leads

            let targetWorkspaceId = workspaceId;
            let targetCampaignId = campaignId;

            if (campaignId) {
                const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
                if (!campaign) {
                    return res.status(404).json({ error: 'Campaign not found' });
                }
                targetWorkspaceId = campaign.workspaceId;
            } else if (workspaceId) {
                // Verify workspace exists
                const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
                if (!workspace) {
                    return res.status(404).json({ error: 'Workspace not found' });
                }
            } else {
                return res.status(400).json({ error: 'campaignId or workspaceId is required' });
            }

            // Create/Find Lead using Service (Enforces Limits)
            // upsertLead requires workspaceId
            const lead = await leadService.upsertLead({
                email,
                firstName: name, // map name to firstName
                workspaceId: targetWorkspaceId,
                source: 'WIDGET'
            });

            // Add to Campaign if requested
            if (targetCampaignId) {
                // Check if already in campaign
                const exists = await prisma.campaignLead.findFirst({
                    where: { campaignId: targetCampaignId, leadId: lead.id }
                });

                if (!exists) {
                    await prisma.campaignLead.create({
                        data: {
                            campaignId: targetCampaignId,
                            leadId: lead.id,
                            status: 'NEW'
                        }
                    });
                }
            }

            // Response
            if (redirectUrl) {
                return res.redirect(redirectUrl);
            } else {
                return res.json({ success: true, leadId: lead.id });
            }

        } catch (error) {
            console.error(error);
            const { redirectUrl } = req.body;
            const errorMsg = String(error);

            if (redirectUrl) {
                // Determine error type
                let reason = 'true';
                if (errorMsg.includes('limit reached')) reason = 'limit_reached';

                return res.redirect(`${redirectUrl}?error=${reason}`);
            }

            if (errorMsg.includes('limit reached')) {
                return res.status(402).json({ error: 'Plan limit reached' });
            }

            res.status(500).json({ error: errorMsg });
        }
    }
}
