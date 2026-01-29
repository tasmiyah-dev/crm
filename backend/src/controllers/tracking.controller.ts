import { Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { PrismaClient } from '@prisma/client';

const eventService = new EventService();
const prisma = new PrismaClient();

export class TrackingController {

    /**
     * Pixel Endpoint: GET /tracking/pixel.png?cid=...&lid=...
     */
    async trackOpen(req: Request, res: Response) {
        const { cid, lid } = req.query; // CampaignId, LeadId

        if (cid && lid) {
            // Log safely without blocking response
            eventService.logEvent('EMAIL_OPENED', String(cid), String(lid), {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            }).catch(console.error);
        }

        // Return 1x1 transparent PNG
        const img = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        });
        res.end(img);
    }

    /**
     * Link Redirect: GET /tracking/click?url=...&cid=...&lid=...
     */
    async trackClick(req: Request, res: Response) {
        const { url, cid, lid } = req.query;

        if (!url) {
            return res.status(400).send("Missing URL");
        }

        if (cid && lid) {
            eventService.logEvent('LINK_CLICKED', String(cid), String(lid), {
                url: String(url),
                ip: req.ip,
                userAgent: req.get('User-Agent')
            }).catch(console.error);
        }

        // Redirect user to destination
        res.redirect(String(url));
    }
}
