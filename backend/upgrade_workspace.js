
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Upgrading Workspaces to PRO...");
    const result = await prisma.workspace.updateMany({
        data: { plan: 'PRO' }
    });
    console.log(`Updated ${result.count} workspaces to PRO.`);
}
main()
    .catch(e => {
        console.error("Error upgrading:", e);
        // Fallback: If no workspace table, maybe verify mailboxes?
        // But mailbox limits are enforced by Workspace check.
    })
    .finally(async () => await prisma.$disconnect());
