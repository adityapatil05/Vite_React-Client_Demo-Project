const fs = require('fs');
const config = require('config');
const mysql = require('mysql2');

const getConnectionDetails = () => {
    const connectionDetails = { ...config.get('ConnectionDetails') };
    connectionDetails.timezone = '+05:30';
    connectionDetails.dateStrings = ['DATE'];
    const environmentDetails = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    };
    Object.entries(environmentDetails).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            connectionDetails[key] = value;
        }
    });
    const certificatePath = process.env.DB_SSL_CA_PATH;
    const certificateContent = process.env.DB_SSL_CA;

    if (certificatePath) {
        connectionDetails.ssl = {
            ca: fs.readFileSync(certificatePath),
            rejectUnauthorized: true,
        };
    } else if (certificateContent) {
        connectionDetails.ssl = {
            ca: certificateContent,
            rejectUnauthorized: true,
        };
    }

    return connectionDetails;
};

const createConnection = () => mysql.createConnection(getConnectionDetails());

module.exports = { createConnection, getConnectionDetails };
