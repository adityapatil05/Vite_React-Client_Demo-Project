const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const { getConnectionDetails } = require('../db');
const { sendEmail } = require('../mailcode');

const app = express.Router();
const pendingSignups = new Map();
const pendingLoginOtps = new Map();
const pendingPasswordResets = new Map();
const OTP_LIFETIME_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const ADMIN_USERNAME = 'loki_adii';
const INDIA_TIME_ZONE = 'Asia/Kolkata';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hashPassword = (password) => new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
        if (error) {
            reject(error);
            return;
        }
        resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
});

const verifyPassword = (password, storedPassword) => new Promise((resolve, reject) => {
    const [salt, storedHash] = storedPassword.split(':');
    if (!salt || !storedHash) {
        resolve(false);
        return;
    }

    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
        if (error) {
            reject(error);
            return;
        }
        const expectedHash = Buffer.from(storedHash, 'hex');
        resolve(expectedHash.length === derivedKey.length &&
            crypto.timingSafeEqual(expectedHash, derivedKey));
    });
});

const getDatabase = () => mysql.createConnection(getConnectionDetails());

const ensureUsersTable = async () => {
    const database = await getDatabase();
    try {
        await database.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(200) NOT NULL,
                email_verified BOOLEAN NOT NULL DEFAULT TRUE,
                role VARCHAR(20) NOT NULL DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        const [roleColumns] = await database.query(
            `SELECT COLUMN_NAME
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'users'
               AND COLUMN_NAME = 'role'`
        );
        if (roleColumns.length === 0) {
            await database.execute(
                "ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'"
            );
        }
    } finally {
        await database.end();
    }
};

const createToken = (username, role, request) => jwt.sign({
    username,
    isUserLoggedIn: true,
    whenUserLoggedIn: new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: INDIA_TIME_ZONE,
    }).format(new Date()),
    browserDetails: request.headers['user-agent'],
    role,
}, config.get('jwt.secretKey'));

const createOtpRecord = (otp) => ({
    hash: crypto.createHash('sha256').update(otp).digest('hex'),
    expiresAt: Date.now() + OTP_LIFETIME_MS,
    attempts: 0,
});

const isValidOtp = (record, otp) => {
    if (!record || Date.now() > record.expiresAt) {
        return false;
    }

    record.attempts += 1;
    const expectedHash = Buffer.from(record.hash, 'hex');
    const receivedHash = crypto.createHash('sha256').update(String(otp || '')).digest();
    return crypto.timingSafeEqual(expectedHash, receivedHash);
};

const sendOtp = async (email, subject, username, otp) => sendEmail(
    email,
    subject,
    `<p>Your one-time code for <strong>${username}</strong> is:</p>
     <h2>${otp}</h2>
     <p>This code expires in 5 minutes and can be used only once.</p>`
);

app.post('/signup/request-otp', async (request, response) => {
    const { username, password, passwordConfirmation, email, accountType } = request.body;

    if (!username || !password || !passwordConfirmation || !emailPattern.test(email || '')) {
        return response.status(400).send({ Message: 'Enter username, email, and both password fields.' });
    }
    if (password !== passwordConfirmation) {
        return response.status(400).send({ Message: 'Passwords do not match.' });
    }
    if (password.length < 8) {
        return response.status(400).send({ Message: 'Password must be at least 8 characters.' });
    }
    if (!['customer', 'retailer'].includes(accountType)) {
        return response.status(400).send({ Message: 'Choose a valid account type.' });
    }

    try {
        await ensureUsersTable();
        const database = await getDatabase();
        const [existingUsers] = await database.execute(
            'SELECT username, email FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        await database.end();

        if (existingUsers.length > 0) {
            return response.status(409).send({ Message: 'Username or email is already registered.' });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();
        pendingSignups.set(username, {
            ...createOtpRecord(otp),
            email,
            passwordHash: await hashPassword(password),
            role: accountType,
        });
        await sendOtp(email, 'Verify your account', username, otp);
        return response.send({ Message: 'Verification OTP sent to your email.' });
    } catch (error) {
        pendingSignups.delete(username);
        console.error('Signup OTP could not be sent:', error.message);
        return response.status(502).send({ Message: 'Could not start signup.' });
    }
});

app.post('/signup/verify-otp', async (request, response) => {
    const { username, otp } = request.body;
    const pendingSignup = pendingSignups.get(username);

    if (!isValidOtp(pendingSignup, otp)) {
        if (!pendingSignup || pendingSignup.attempts >= MAX_OTP_ATTEMPTS) {
            pendingSignups.delete(username);
        }
        return response.status(401).send({ Message: 'OTP is invalid or expired.' });
    }

    try {
        await ensureUsersTable();
        const database = await getDatabase();
        await database.execute(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [
                username,
                pendingSignup.email,
                pendingSignup.passwordHash,
                username === ADMIN_USERNAME ? 'admin' : pendingSignup.role,
            ]
        );
        if (pendingSignup.role === 'customer') {
            await database.execute(
                `INSERT INTO Customers
                 (name, email, amount_paid, amount_pending, owner_username)
                 VALUES (?, ?, 0, 0, ?)`,
                [username, pendingSignup.email, username]
            );
        }
        await database.end();
        pendingSignups.delete(username);
        return response.send({ Message: 'Signup successful. You can now log in.' });
    } catch (error) {
        console.error('User could not be created:', error.message);
        return response.status(500).send({ Message: 'Could not create account.' });
    }
});

app.post('/request-otp', async (request, response) => {
    const { username, password } = request.body;

    try {
        await ensureUsersTable();
        const database = await getDatabase();
        const [users] = await database.execute(
            'SELECT password_hash, email, role FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0 || !(await verifyPassword(password || '', users[0].password_hash))) {
            await database.end();
            return response.status(401).send({ Message: 'Invalid Credentials' });
        }

        if (username === ADMIN_USERNAME && users[0].role !== 'admin') {
            await database.execute(
                'UPDATE users SET role = ? WHERE username = ?',
                ['admin', username]
            );
        }
        await database.end();

        const otp = crypto.randomInt(100000, 1000000).toString();
        pendingLoginOtps.set(username, {
            ...createOtpRecord(otp),
            email: users[0].email,
        });
        await sendOtp(users[0].email, 'Your login OTP', username, otp);
        return response.send({ Message: 'Login OTP sent to your registered email.' });
    } catch (error) {
        pendingLoginOtps.delete(username);
        console.error('Login OTP could not be sent:', error.message);
        return response.status(502).send({ Message: 'Could not send login OTP.' });
    }
});

app.post('/password-reset/request-otp', async (request, response) => {
    const { username, email } = request.body;

    try {
        await ensureUsersTable();
        const database = await getDatabase();
        const [users] = await database.execute(
            'SELECT email FROM users WHERE username = ? AND email = ?',
            [username, email]
        );
        await database.end();

        if (users.length > 0) {
            const otp = crypto.randomInt(100000, 1000000).toString();
            pendingPasswordResets.set(username, {
                ...createOtpRecord(otp),
                email: users[0].email,
            });
            await sendOtp(users[0].email, 'Your password reset OTP', username, otp);
        }

        return response.send({
            Message: 'If the username and email match, a password reset OTP was sent.',
        });
    } catch (error) {
        pendingPasswordResets.delete(username);
        console.error('Password reset OTP could not be sent:', error.message);
        return response.status(502).send({ Message: 'Could not start password reset.' });
    }
});

app.post('/password-reset/verify-otp', async (request, response) => {
    const { username, otp, newPassword, passwordConfirmation } = request.body;
    const pendingReset = pendingPasswordResets.get(username);

    if (!newPassword || newPassword.length < 8 || newPassword !== passwordConfirmation) {
        return response.status(400).send({ Message: 'Passwords must match and be at least 8 characters.' });
    }
    if (!isValidOtp(pendingReset, otp)) {
        if (!pendingReset || pendingReset.attempts >= MAX_OTP_ATTEMPTS) {
            pendingPasswordResets.delete(username);
        }
        return response.status(401).send({ Message: 'OTP is invalid or expired.' });
    }
    pendingPasswordResets.delete(username);

    try {
        const database = await getDatabase();
        await database.execute(
            'UPDATE users SET password_hash = ? WHERE username = ? AND email = ?',
            [await hashPassword(newPassword), username, pendingReset.email]
        );
        await database.end();
        return response.send({ Message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        console.error('Password could not be reset:', error.message);
        return response.status(500).send({ Message: 'Could not reset password.' });
    }
});

app.post('/verify-otp', async (request, response) => {
    const { username, otp } = request.body;
    const pendingOtp = pendingLoginOtps.get(username);

    if (!isValidOtp(pendingOtp, otp)) {
        if (!pendingOtp || pendingOtp.attempts >= MAX_OTP_ATTEMPTS) {
            pendingLoginOtps.delete(username);
        }
        return response.status(401).send({ Message: 'OTP is invalid or expired.' });
    }

    pendingLoginOtps.delete(username);
    const database = await getDatabase();
    const [users] = await database.execute(
        'SELECT role FROM users WHERE username = ?',
        [username]
    );
    await database.end();
    return response.send({ jwt: createToken(username, users[0].role, request) });
});

module.exports = app;
