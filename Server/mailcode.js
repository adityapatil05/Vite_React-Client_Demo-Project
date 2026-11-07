const nodemailer = require('nodemailer');
let transporter;

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
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
        from: MAIL_FROM,
    };
};

async function sendEmail(to, subject, html) {
    const mailConfig = getMailConfig();
    if (!transporter) {
        transporter = nodemailer.createTransport(mailConfig);
    }

    const message = {
        from: {
            name: 'Avengers',
            address: mailConfig.from,
        },
        to,
        subject,
        html,
    };

    try {
        return await transporter.sendMail(message);
    } catch (error) {
        transporter.close();
        transporter = nodemailer.createTransport(mailConfig);
        return transporter.sendMail(message);
    }
}

module.exports = { sendEmail };
