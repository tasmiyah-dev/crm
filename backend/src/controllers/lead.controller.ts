import { Request, Response } from 'express';
import { LeadService } from '../services/lead.service';
import { AuthRequest } from '../middleware/auth.middleware';

const leadService = new LeadService();

export class LeadController {

    async create(req: Request, res: Response) {
        try {
            const user = (req as AuthRequest).user;
            if (!user || !user.workspaceId) return res.status(401).json({ error: 'Unauthorized' });

            const data = { ...req.body, workspaceId: user.workspaceId };
            const lead = await leadService.upsertLead(data);
            res.status(201).json(lead);
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    }

    async bulkCreate(req: Request, res: Response) {
        try {
            const user = (req as AuthRequest).user;
            if (!user || !user.workspaceId) return res.status(401).json({ error: 'Unauthorized' });

            const { leads } = req.body;
            if (!Array.isArray(leads)) {
                return res.status(400).json({ error: "Invalid format. Expected { leads: [] }" });
            }

            // Pass workspaceId to bulkIngest which now expects it as 2nd arg
            // Also ensures the leads are processed for that workspace
            const result = await leadService.bulkIngest(leads, user.workspaceId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    }

    async list(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search as string;
            const status = req.query.status as string;

            // Get user from auth
            const user = (req as AuthRequest).user;
            if (!user || !user.workspaceId) return res.status(401).json({ error: 'Unauthorized' });

            const result = await leadService.getLeads(user.workspaceId, page, limit, search, status);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    }

    async bulkDelete(req: Request, res: Response) {
        try {
            const { ids } = req.body;
            const user = (req as AuthRequest).user;
            if (!user || !user.workspaceId) return res.status(401).json({ error: 'Unauthorized' });

            if (!ids || !Array.isArray(ids)) {
                return res.status(400).json({ error: 'ids array required' });
            }

            await leadService.deleteLeads(user.workspaceId, ids);
            res.json({ success: true, count: ids.length });
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    }
}
