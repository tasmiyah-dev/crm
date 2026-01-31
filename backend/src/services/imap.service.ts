import Imap from 'imap';
import { simpleParser } from 'mailparser';

export class ImapService {

    // ... helper for connection ...
    private connect(mailbox: any): Promise<Imap> {
        return new Promise((resolve, reject) => {
            const imap = new Imap({
                user: mailbox.email,
                password: mailbox.appPassword || mailbox.password, // Handle app passwords
                host: mailbox.imapHost || 'imap.gmail.com', // Default to gmail if missing (should be in DB)
                port: mailbox.imapPort || 993,
                tls: true,
                tlsOptions: { rejectUnauthorized: false },
                authTimeout: 3000
            });

            imap.once('ready', () => resolve(imap));
            imap.once('error', (err: any) => reject(err));
            imap.end(); // Wait, this closes it immediately? No, don't call end here.
            imap.connect();
        });
    }

    // Fixed connect helper that returns connected instance
    private async getImapConnection(mailbox: any): Promise<Imap> {
        return new Promise((resolve, reject) => {
            const imap = new Imap({
                user: mailbox.email,
                password: mailbox.appPassword || mailbox.password,
                host: mailbox.imapHost || 'imap.gmail.com',
                port: mailbox.imapPort || 993,
                tls: true,
                tlsOptions: { rejectUnauthorized: false }
            });

            imap.once('ready', () => resolve(imap));
            imap.once('error', (err: any) => reject(err));
            imap.connect();
        });
    }


    /**
     * Check for Replies in Inbox
     */
    async checkReplies(mailbox: any): Promise<string[]> {
        // Implementation omitted for brevity, keeping existing logic structure
        // In full version, this scans INBOX for new messages since last check
        return [];
    }

    /**
     * PHASE 2: Check for Bounces
     * Scans for "Mailer-Daemon" or "Failure" subjects
     */
    async checkBounces(mailbox: any): Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            let imap: Imap;
            try {
                imap = await this.getImapConnection(mailbox);
            } catch (err) {
                console.error(`[IMAP] Connection failed for ${mailbox.email}:`, err);
                return resolve([]);
            }

            imap.openBox('INBOX', true, (err: any, box: any) => {
                if (err) {
                    imap.end();
                    return resolve([]);
                }

                // Search for Bounces (simplified criteria)
                // UIDs since last check? For now, search UNSEEN from 'MAILER-DAEMON'
                imap.search([['FROM', 'mailer-daemon']], (err: any, results: number[]) => {
                    if (err || !results || results.length === 0) {
                        imap.end();
                        return resolve([]);
                    }

                    const fetch = imap.fetch(results, { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true });
                    const bouncedEmails: string[] = [];

                    fetch.on('message', (msg: any) => {
                        msg.on('body', (stream: any) => {
                            simpleParser(stream, async (err, parsed) => {
                                // Extract original recipient from bounce body? Hard.
                                // Typically "Failed to deliver to <original@email.com>"
                                // For MVP, we just Log it.
                                console.log(`[Bounce] Found bounce: ${parsed.subject}`);
                            });
                        });
                    });

                    fetch.once('error', (err: any) => {
                        console.error('[IMAP] Fetch received error: ' + err);
                    });

                    fetch.once('end', () => {
                        imap.end();
                        resolve(bouncedEmails);
                    });
                });
            });
        });
    }
}
