import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
// @ts-ignore
import { Mailbox } from '@prisma/client';

export class ImapService {

    async checkReplies(mailbox: Mailbox): Promise<string[]> {
        const config = {
            imap: {
                user: mailbox.imapUser || mailbox.smtpUser,
                password: mailbox.imapPass || mailbox.smtpPass, // Fallback to SMTP pass if not set
                host: mailbox.imapHost || 'imap.gmail.com', // Default or need to guess if missing? Better fail if missing.
                port: mailbox.imapPort || 993,
                tls: true,
                authTimeout: 3000
            }
        };

        if (!config.imap.user || !config.imap.password || !config.imap.host) {
            console.error(`[ImapService] Missing IMAP config for ${mailbox.email}`);
            return [];
        }

        try {
            const connection = await imaps.connect(config);
            await connection.openBox('INBOX');

            // Fetch UNSEEN messages
            const searchCriteria = ['UNSEEN'];
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT'],
                markSeen: false
            };

            const messages = await connection.search(searchCriteria, fetchOptions);
            const senders: string[] = [];

            for (const item of messages) {
                // Parse header to get sender
                // @ts-ignore
                const all = item.parts.find(part => part.which === 'TEXT');
                const id = item.attributes.uid;
                const idHeader = "HEADER";
                // @ts-ignore
                const headerPart = item.parts.find(part => part.which === 'HEADER');

                if (headerPart && headerPart.body && headerPart.body.from) {
                    // imap-simple returns raw headers roughly, usually array 
                    const fromRaw = headerPart.body.from[0]; // "Name <email@example.com>"
                    // Extract email
                    const match = fromRaw.match(/<(.+)>/);
                    const email = match ? match[1] : fromRaw;
                    senders.push(email.toLowerCase());
                }
            }

            connection.end();
            return senders;

        } catch (error) {
            console.error(`[ImapService] Error checking ${mailbox.email}:`, error);
            return [];
        }
    }
}
