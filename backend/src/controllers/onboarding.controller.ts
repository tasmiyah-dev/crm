import { Request, Response } from 'express';
import { OnboardingService } from '../services/onboarding.service';
import { AuthRequest } from '../middleware/auth.middleware';

const service = new OnboardingService();

export class OnboardingController {
    async getStatus(req: Request, res: Response) {
        try {
            const user = (req as AuthRequest).user;
            // If no user (should be protected), return error or empty
            if (!user) return res.status(401).json({ error: 'Unauthorized' });

            const status = await service.getStatus(user.workspaceId);
            res.json(status);
        } catch (error) {
            res.status(500).json({ error: String(error) });
        }
    }
}
