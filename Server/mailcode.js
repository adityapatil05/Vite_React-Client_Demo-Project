const nodemailer = require('nodemailer');

const getMailConfig = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
        throw new Error(
            'SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and MAIL_FROM must be configured.'
        );
    }

    const port = Number(SMTP_PORT);
    if (!Number.isInteger(port) || port <= 0) {
        throw new Error('SMTP_PORT must be a positive integer.');
    }

    return {
        host: SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
        from: MAIL_FROM,
    };
};

async function sendEmail(to, subject, html) {
    const mailConfig = getMailConfig();
    const transporter = nodemailer.createTransport({
        host: mailConfig.host,
        port: mailConfig.port,
        secure: mailConfig.secure,
        auth: mailConfig.auth,
    });

    return transporter.sendMail({
        from: mailConfig.from,
        to,
        subject,
        html,
    });
}

module.exports = { sendEmail };
