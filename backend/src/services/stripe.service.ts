import Stripe from 'stripe';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-01-27.acacia' as any,
});

export class StripeService {

    // Create a Checkout Session for upgrading to PRO
    async createCheckoutSession(workspaceId: string, userEmail: string) {
        if (!process.env.STRIPE_PRICE_ID) {
            throw new Error('STRIPE_PRICE_ID not configured');
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/billing?success=true`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/billing?canceled=true`,
            customer_email: userEmail,
            metadata: {
                workspaceId: workspaceId
            }
        });

        return { url: session.url };
    }

    // Handle Webhook (e.g. checkout.session.completed)
    async handleWebhook(body: any, signature: string) {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            // In dev without webhook secret, simpler handling or ignore
            console.warn('[Stripe] Missing STRIPE_WEBHOOK_SECRET');
            return;
        }

        let event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err: any) {
            throw new Error(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const workspaceId = session.metadata?.workspaceId;
            const customerId = session.customer as string;

            if (workspaceId) {
                await prisma.workspace.update({
                    where: { id: workspaceId },
                    data: {
                        plan: 'PRO',
                        stripeCustomerId: customerId,
                        subscriptionStatus: 'active'
                    }
                });
                console.log(`[Stripe] Upgraded workspace ${workspaceId} to PRO`);
            }
        }
        // Handle invoice.payment_failed etc. to downgrade?
    }

    // Manual helper for dev testing without real stripe
    async upgradeDev(workspaceId: string) {
        return await prisma.workspace.update({
            where: { id: workspaceId },
            data: { plan: 'PRO', subscriptionStatus: 'active' }
        });
    }
}
