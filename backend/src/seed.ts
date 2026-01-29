import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const lead = await prisma.lead.create({
            data: {
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                company: 'Example Corp',
                status: 'NEW',
                metadata: JSON.stringify({ source: 'seed' })
            }
        });
        console.log('Created lead:', lead);
    } catch (e) {
        console.error('Error seeding:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
