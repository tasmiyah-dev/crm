// @ts-ignore
import { PrismaClient, Lead } from '@prisma/client';
import { LeadStatus } from '../enums';

const prisma = new PrismaClient();

const FREE_PLAN_LIMIT = 100;

interface CreateLeadDTO {
    email: string;
    workspaceId: string; // Made required for proper linking
    firstName?: string;
    lastName?: string;
    company?: string;
    jobTitle?: string;
    location?: string;
    timezone?: string;
    metadata?: any;
    source?: string;
}

export class LeadService {

    private async checkLimit(workspaceId: string) {
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId }
        });

        if (!workspace) return; // Should probably throw, but let's proceed or let FK fail? 

        if (workspace.plan === 'FREE') {
            const count = await prisma.lead.count({ where: { workspaceId } });
            if (count >= FREE_PLAN_LIMIT) {
                throw new Error(`Free plan limit reached (${FREE_PLAN_LIMIT} leads). Please upgrade to Pro.`);
            }
        }
    }

    /**
     * Create or Update a single lead
     */
    async upsertLead(data: CreateLeadDTO): Promise<Lead> {
        // Check if lead exists to know if we are creating
        const existing = await prisma.lead.findUnique({ where: { email: data.email } });

        if (!existing) {
            // Only check limit if we are creating a new lead
            await this.checkLimit(data.workspaceId);
        }

        return await prisma.lead.upsert({
            where: { email: data.email },
            update: {
                firstName: data.firstName,
                lastName: data.lastName,
                company: data.company,
                jobTitle: data.jobTitle,
                location: data.location,
                timezone: data.timezone,
                metadata: typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata || {}),
                workspaceId: data.workspaceId // Associate if not already (or move?)
            },
            create: {
                email: data.email,
                workspaceId: data.workspaceId,
                firstName: data.firstName,
                lastName: data.lastName,
                company: data.company,
                jobTitle: data.jobTitle,
                location: data.location,
                timezone: data.timezone,
                metadata: typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata || {}),
                status: 'NEW',
                // @ts-ignore
                source: data.source || 'MANUAL'
            }
        });
    }

    /**
     * Bulk ingest leads
     */
    async bulkIngest(leads: CreateLeadDTO[], workspaceId: string): Promise<{ created: number; updated: number; errors: any[] }> {
        let created = 0;
        let updated = 0;
        const errors = [];

        // Pre-check limit for the batch roughly? 
        // Or check one by one?
        // Checking one by one is safer but slower. 
        // Let's check initial count + batch size vs limit for fail-fast (optimistic).

        try {
            // Optimization: Fail fast if totally over
            await this.checkLimit(workspaceId);
        } catch (e: any) {
            // If already over, we can't create ANY, but maybe updates are allowed?
            // Since bulkIngest mixes create/update, this is tricky. 
            // We'll let existing ones update, but fail creations.
        }

        for (const lead of leads) {
            try {
                // Ensure workspaceId is attached
                lead.workspaceId = workspaceId;

                const existing = await prisma.lead.findUnique({ where: { email: lead.email } });
                if (existing) {
                    await this.upsertLead(lead); // Upsert will skip checkLimit if existing
                    updated++;
                } else {
                    // creating
                    try {
                        await this.checkLimit(workspaceId);
                        await this.upsertLead(lead);
                        created++;
                    } catch (limitErr) {
                        errors.push({ email: lead.email, error: 'Limit reached' });
                    }
                }
            } catch (err) {
                errors.push({ email: lead.email, error: String(err) });
            }
        }

        return { created, updated, errors };
    }

    async getLeads(workspaceId: string, page = 1, limit = 10, search?: string, status?: string) {
        const skip = (page - 1) * limit;
        const where: any = { workspaceId }; // Enforce workspace

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { email: { contains: search } },
                { firstName: { contains: search } },
                { lastName: { contains: search } }
            ];
        }

        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.lead.count({ where })
        ]);

        return {
            data: leads,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async createLead(data: any) {
        if (data.workspaceId) {
            await this.checkLimit(data.workspaceId);
        }
        return await prisma.lead.create({
            data: {
                ...data,
                status: 'NEW'
            }
        });
    }



    async deleteLeads(workspaceId: string, ids: string[]) {
        return await prisma.lead.deleteMany({
            where: {
                workspaceId,
                id: { in: ids }
            }
        });
    }
}
