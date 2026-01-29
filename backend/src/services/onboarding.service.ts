// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class OnboardingService {

    async getStatus(workspaceId: string) {
        // If no workspaceId, assume incomplete or global check? 
        // With current schema, workspaceId is optional but we should enforce checking it if provided.
        // For now, if workspaceId is missing, we might check global items (where workspaceId is null)
        // or just return false. Let's assume passed workspaceId is valid.

        const where = workspaceId ? { workspaceId } : {};

        const [mailboxCount, leadCount, campaignCount] = await Promise.all([
            prisma.mailbox.count({ where }),
            prisma.lead.count({ where }),
            prisma.campaign.count({ where })
        ]);

        return {
            hasMailbox: mailboxCount > 0,
            hasLeads: leadCount > 0,
            hasCampaign: campaignCount > 0,
            completed: mailboxCount > 0 && leadCount > 0 && campaignCount > 0
        };
    }
}
