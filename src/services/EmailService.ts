import nodemailer from 'nodemailer';
import pug from 'pug';
import { config } from 'src/config';
import { internalError } from 'src/utils/result';
import { Service } from 'typedi';

export type ResetPasswordPayload = {
    username: string;
    redirectUrl: string;
    userEmail: string;
};

@Service()
export class EmailService {
    private createSmtpTransport() {
        const smtpTransport = nodemailer.createTransport({
            service: config.email.provider,
            secure: false,
            auth: {
                user: config.robot.email,
                pass: config.robot.password,
            },
        });

        return smtpTransport;
    }

    async sendResetPasswordMail(payload: ResetPasswordPayload) {
        const transport = this.createSmtpTransport();
        const createHtml = pug.compileFile(`${__dirname}/../templates/reset_password.pug`);
        const html = createHtml({ ...payload });

        try {
            const res = await transport.sendMail({
                to: payload.userEmail,
                from: config.robot.email,
                subject: 'Reset a password!',
                html,
            });
            return res;
        } catch (e) {
            return internalError(e.message, { error: e });
        }
    }
}
