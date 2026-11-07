const express = require('express');
const mysql = require('mysql2/promise');
const { getConnectionDetails } = require('../db');
const { ensureBusinessSchema } = require('../schema');

const app = express.Router();
const resources = {
    products: {
        table: 'Products',
        columns: ['name', 'price', 'total_stock', 'available_stock', 'image_url'],
        dateColumn: 'created_at',
    },
    customers: {
        table: 'Customers',
        columns: ['name', 'contact', 'email', 'bill_date', 'amount_paid', 'amount_pending'],
        dateColumn: 'bill_date',
    },
    suppliers: {
        table: 'Suppliers',
        columns: ['name', 'address', 'contact', 'amount_paid', 'amount_pending'],
        dateColumn: 'created_at',
    },
    finance: {
        table: 'Finance',
        columns: ['direction', 'party_name', 'amount', 'due_date', 'status', 'notes'],
        dateColumn: 'due_date',
    },
    agents: {
        table: 'Emp',
        idColumn: 'No',
        columns: ['Name', 'Address', 'Contact', 'CustomerProvided'],
    },
};

const database = () => mysql.createConnection(getConnectionDetails());

const getResource = (name, response) => {
    const resource = resources[name];
    if (!resource) {
        response.status(404).send({ message: 'Unknown resource.' });
        return null;
    }
    return resource;
};

const ownerFilter = (request) => request.user.role === 'admin'
    ? { clause: '', parameters: [] }
    : { clause: ' WHERE owner_username = ?', parameters: [request.user.username] };

app.get('/finance/summary', async (request, response) => {
    if (request.user.role === 'customer') {
        response.status(403).send({ message: 'Retailer access required.' });
        return;
    }
    try {
        await ensureBusinessSchema();
        const owner = ownerFilter(request);
        const db = await database();
        const summary = new Map();
        const addYearRows = (rows, fields) => rows.forEach((row) => {
            const year = String(row.year);
            const current = summary.get(year) || {
                year,
                inventory_value: 0,
                customer_receivables: 0,
                supplier_payables: 0,
                finance_claims: 0,
                finance_payments: 0,
            };
            Object.entries(fields).forEach(([key, source]) => {
                current[key] = Number(row[source] || 0);
            });
            summary.set(year, current);
        });
        const [products] = await db.execute(
            `SELECT YEAR(created_at) AS year, COALESCE(SUM(price * available_stock), 0) AS value
             FROM Products${owner.clause} GROUP BY YEAR(created_at)`,
            owner.parameters
        );
        const [customers] = await db.execute(
            `SELECT YEAR(COALESCE(bill_date, CURRENT_DATE())) AS year,
                    COALESCE(SUM(amount_pending), 0) AS value
             FROM Customers${owner.clause} GROUP BY YEAR(COALESCE(bill_date, CURRENT_DATE()))`,
            owner.parameters
        );
        const [suppliers] = await db.execute(
            `SELECT YEAR(created_at) AS year, COALESCE(SUM(amount_pending), 0) AS value
             FROM Suppliers${owner.clause} GROUP BY YEAR(created_at)`,
            owner.parameters
        );
        const [finance] = await db.execute(
            `SELECT YEAR(COALESCE(due_date, CURRENT_DATE())) AS year,
                    COALESCE(SUM(CASE WHEN direction = 'receivable' THEN amount ELSE 0 END), 0) AS claims,
                    COALESCE(SUM(CASE WHEN direction = 'payable' THEN amount ELSE 0 END), 0) AS payments
             FROM Finance${owner.clause}
             GROUP BY YEAR(COALESCE(due_date, CURRENT_DATE()))`,
            owner.parameters
        );
        addYearRows(products, { inventory_value: 'value' });
        addYearRows(customers, { customer_receivables: 'value' });
        addYearRows(suppliers, { supplier_payables: 'value' });
        addYearRows(finance, { finance_claims: 'claims', finance_payments: 'payments' });
        const rows = [...summary.values()].map((item) => ({
            ...item,
            amount_to_claim: item.customer_receivables + item.finance_claims,
            amount_to_pay: item.supplier_payables + item.finance_payments,
            net_worth: item.inventory_value +
                item.customer_receivables +
                item.finance_claims -
                item.supplier_payables -
                item.finance_payments,
        })).sort((a, b) => Number(b.year) - Number(a.year));
        await db.end();
        response.send(rows);
    } catch (error) {
        console.error('Finance summary failed:', error.message);
        response.status(500).send({ message: 'Could not load finance summary.' });
    }
});

app.get('/:resource', async (request, response) => {
    const resource = getResource(request.params.resource, response);
    if (!resource) return;
    if (request.user.role === 'customer') {
        response.status(403).send({ message: 'Retailer access required.' });
        return;
    }
    try {
        await ensureBusinessSchema();
        const owner = ownerFilter(request);
        const db = await database();
        const [rows] = await db.execute(
            `SELECT * FROM ${resource.table}${owner.clause}`,
            owner.parameters
        );
        await db.end();
        response.send(rows);
    } catch (error) {
        console.error('Business list failed:', error.message);
        response.status(500).send({ message: 'Could not load records.' });
    }
});

app.post('/:resource', async (request, response) => {
    const resource = getResource(request.params.resource, response);
    if (!resource) return;
    if (request.user.role === 'customer') {
        response.status(403).send({ message: 'Retailer access required.' });
        return;
    }
    try {
        await ensureBusinessSchema();
        const values = resource.columns.map((column) => request.body[column] ?? null);
        const columns = resource.columns.join(', ');
        const placeholders = resource.columns.map(() => '?').join(', ');
        const db = await database();
        const [result] = await db.execute(
            `INSERT INTO ${resource.table} (${columns}, owner_username) VALUES (${placeholders}, ?)`,
            [...values, request.user.username]
        );
        await db.end();
        response.send(result);
    } catch (error) {
        console.error('Business insert failed:', error.message);
        response.status(500).send({ message: 'Could not save record.' });
    }
});

app.put('/:resource/:id', async (request, response) => {
    const resource = getResource(request.params.resource, response);
    if (!resource) return;
    if (request.user.role === 'customer') {
        response.status(403).send({ message: 'Retailer access required.' });
        return;
    }
    try {
        await ensureBusinessSchema();
        const values = resource.columns.map((column) => request.body[column] ?? null);
        const assignments = resource.columns.map((column) => `${column} = ?`).join(', ');
        const owner = ownerFilter(request);
        const idColumn = resource.idColumn || 'id';
        const where = owner.clause
            ? `WHERE ${idColumn} = ? AND owner_username = ?`
            : `WHERE ${idColumn} = ?`;
        const db = await database();
        const [result] = await db.execute(
            `UPDATE ${resource.table} SET ${assignments} ${where}`,
            [...values, request.params.id, ...owner.parameters]
        );
        await db.end();
        response.send(result);
    } catch (error) {
        console.error('Business update failed:', error.message);
        response.status(500).send({ message: 'Could not update record.' });
    }
});

app.delete('/:resource/:id', async (request, response) => {
    const resource = getResource(request.params.resource, response);
    if (!resource) return;
    if (request.user.role === 'customer') {
        response.status(403).send({ message: 'Retailer access required.' });
        return;
    }
    try {
        await ensureBusinessSchema();
        const owner = ownerFilter(request);
        const idColumn = resource.idColumn || 'id';
        const where = owner.clause
            ? `WHERE ${idColumn} = ? AND owner_username = ?`
            : `WHERE ${idColumn} = ?`;
        const db = await database();
        const [result] = await db.execute(
            `DELETE FROM ${resource.table} ${where}`,
            [request.params.id, ...owner.parameters]
        );
        await db.end();
        response.send(result);
    } catch (error) {
        console.error('Business delete failed:', error.message);
        response.status(500).send({ message: 'Could not delete record.' });
    }
});

module.exports = app;
