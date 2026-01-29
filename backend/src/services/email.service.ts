import nodemailer from 'nodemailer';
// @ts-ignore
import { Mailbox } from '@prisma/client';

export class EmailService {

    private createTransporter(mailbox: Mailbox) {
        return nodemailer.createTransport({
            host: mailbox.smtpHost,
            port: mailbox.smtpPort,
            secure: mailbox.smtpPort === 465, // true for 465, false for other ports
            auth: {
                user: mailbox.smtpUser,
                pass: mailbox.smtpPass,
            },
        });
    }

    async sendEmail(
        mailbox: Mailbox,
        to: string,
        subject: string,
        html: string,
        replyTo?: string
    ): Promise<{ messageId: string }> {
        const transporter = this.createTransporter(mailbox);

        try {
            const info = await transporter.sendMail({
                from: `"${mailbox.fromName || mailbox.name || mailbox.email}" <${mailbox.email}>`, // sender address
                to,
                subject,
                html,
                replyTo: replyTo || undefined
            });

            console.log(`Email sent: ${info.messageId}`);
            return { messageId: info.messageId };
        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }
}
