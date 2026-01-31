
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// Hardcoded secret for now (simple MVP). In production, use process.env.ADMIN_SECRET
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'tasmi-admin-secret';

export const checkAdminSecret = (req: Request, res: Response, next: NextFunction) => {
    const secret = req.headers['x-admin-secret'];
    if (secret !== ADMIN_SECRET) {
        return res.status(403).json({ error: 'Unauthorized: Invalid Admin Secret' });
    }
    next();
};

export const getWorkspaces = async (req: Request, res: Response) => {
    try {
        const workspaces = await prisma.workspace.findMany({
            include: { _count: { select: { users: true, mailboxes: true, campaigns: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(workspaces);
    } catch (error) {
        console.error('Get workspaces error:', error);
        res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
};

export const upgradeWorkspace = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const workspace = await prisma.workspace.update({
            where: { id },
            data: { plan: 'PRO' }
        });
        res.json(workspace);
    } catch (error) {
        console.error('Upgrade workspace error:', error);
        res.status(500).json({ error: 'Failed to upgrade workspace' });
    }
};

export const downgradeWorkspace = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const workspace = await prisma.workspace.update({
            where: { id },
            data: { plan: 'FREE' }
        });
        res.json(workspace);
    } catch (error) {
        console.error('Downgrade workspace error:', error);
        res.status(500).json({ error: 'Failed to downgrade workspace' });
    }
};
