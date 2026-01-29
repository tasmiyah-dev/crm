import { Request, Response } from 'express';
import { EventService } from '../services/event.service';

const eventService = new EventService();

export class AnalyticsController {

    async getCampaignStats(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const stats = await eventService.getStats(id as string);
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    }

    async getGlobalStats(req: Request, res: Response) {
        try {
            const stats = await eventService.getStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    }
}
