const express = require('express');
const mysql = require('mysql2/promise');
const { getConnectionDetails } = require('../db');

const app = express.Router();
let ownershipColumnReady;

const getDatabase = () => mysql.createConnection(getConnectionDetails());

const ensureOwnershipColumn = async () => {
    if (!ownershipColumnReady) {
        ownershipColumnReady = (async () => {
            const database = await getDatabase();
            try {
                const [columns] = await database.execute(
                    `SELECT COLUMN_NAME
                     FROM INFORMATION_SCHEMA.COLUMNS
                     WHERE TABLE_SCHEMA = DATABASE()
                       AND TABLE_NAME = 'Emp'
                       AND COLUMN_NAME = 'owner_username'`
                );
                if (columns.length === 0) {
                    await database.execute(
                        'ALTER TABLE Emp ADD COLUMN owner_username VARCHAR(100) NULL'
                    );
                }
            } finally {
                await database.end();
            }
        })().catch((error) => {
            ownershipColumnReady = undefined;
            throw error;
        });
    }
    return ownershipColumnReady;
};

const executeQuery = async (queryText, parameters, request, response) => {
    try {
        await ensureOwnershipColumn();
        const database = await getDatabase();
        try {
            const [result] = await database.execute(queryText, parameters);
            response.send(result);
        } finally {
            await database.end();
        }
    } catch (error) {
        console.error('Employee query failed:', error.message);
        response.status(500).send({ message: 'Could not access employee records.' });
    }
};

app.get('/', (request, response) => {
    executeQuery(
        'SELECT `No`, Name, Address FROM Emp WHERE owner_username = ?',
        [request.user.username],
        request,
        response
    );
});

app.get('/all', (request, response) => {
    if (request.user.role !== 'admin') {
        response.status(403).send({ message: 'Administrator access required.' });
        return;
    }
    executeQuery(
        'SELECT `No`, Name, Address, owner_username FROM Emp',
        [],
        request,
        response
    );
});

app.post('/', (request, response) => {
    executeQuery(
        'INSERT INTO Emp (Name, Address, owner_username) VALUES (?, ?, ?)',
        [request.body.Name, request.body.Address, request.user.username],
        request,
        response
    );
});

app.put('/:No', (request, response) => {
    const query = request.user.role === 'admin'
        ? 'UPDATE Emp SET Name = ?, Address = ? WHERE `No` = ?'
        : 'UPDATE Emp SET Name = ?, Address = ? WHERE `No` = ? AND owner_username = ?';
    const parameters = request.user.role === 'admin'
        ? [request.body.Name, request.body.Address, request.params.No]
        : [request.body.Name, request.body.Address, request.params.No, request.user.username];
    executeQuery(
        query,
        parameters,
        request,
        response
    );
});

app.delete('/:No', (request, response) => {
    const query = request.user.role === 'admin'
        ? 'DELETE FROM Emp WHERE `No` = ?'
        : 'DELETE FROM Emp WHERE `No` = ? AND owner_username = ?';
    const parameters = request.user.role === 'admin'
        ? [request.params.No]
        : [request.params.No, request.user.username];
    executeQuery(
        query,
        parameters,
        request,
        response
    );
});

module.exports = app;
