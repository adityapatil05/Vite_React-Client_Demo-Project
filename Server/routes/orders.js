const express = require('express');
const mysql = require('mysql2/promise');
const { getConnectionDetails } = require('../db');
const { ensureBusinessSchema } = require('../schema');

const app = express.Router();
const database = () => mysql.createConnection(getConnectionDetails());

app.get('/products', async (request, response) => {
    try {
        await ensureBusinessSchema();
        const db = await database();
        const [products] = await db.execute(
            `SELECT id, name, price, total_stock, available_stock, image_url, owner_username
             FROM Products ORDER BY id DESC`
        );
        await db.end();
        response.send(products);
    } catch (error) {
        console.error('Product catalogue failed:', error.message);
        response.status(500).send({ message: 'Could not load products.' });
    }
});

app.post('/', async (request, response) => {
    if (request.user.role !== 'customer') {
        response.status(403).send({ message: 'Customer access required.' });
        return;
    }
    const { productId, quantity, paymentMethod, deliveryAddress, contact } = request.body;
    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0 ||
        !['online', 'cod'].includes(paymentMethod) || !deliveryAddress || !contact) {
        response.status(400).send({ message: 'Complete order details are required.' });
        return;
    }
    const db = await database();
    try {
        await db.beginTransaction();
        const [products] = await db.execute(
            'SELECT * FROM Products WHERE id = ? FOR UPDATE',
            [productId]
        );
        const product = products[0];
        if (!product || product.available_stock < Number(quantity)) {
            await db.rollback();
            response.status(400).send({ message: 'Insufficient stock.' });
            return;
        }
        const total = Number(product.price) * Number(quantity);
        await db.execute(
            'UPDATE Products SET available_stock = available_stock - ? WHERE id = ?',
            [quantity, productId]
        );
        await db.execute(
            `INSERT INTO Orders
             (customer_username, retailer_username, product_id, product_name, quantity,
              unit_price, total_amount, payment_method, payment_status,
              delivery_address, contact)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                request.user.username, product.owner_username, product.id, product.name,
                quantity, product.price, total, paymentMethod,
                paymentMethod === 'online' ? 'recorded' : 'pending',
                deliveryAddress, contact,
            ]
        );
        await db.execute(
            `INSERT INTO Finance
             (direction, party_name, amount, due_date, status, notes, owner_username)
             VALUES ('receivable', ?, ?, CURRENT_DATE(), ?, ?, ?)`,
            [
                request.user.username, total,
                paymentMethod === 'online' ? 'paid' : 'pending',
                `Order payment: ${paymentMethod}`,
                product.owner_username,
            ]
        );
        await db.commit();
        response.send({ message: 'Order placed successfully.' });
    } catch (error) {
        await db.rollback();
        console.error('Order creation failed:', error.message);
        response.status(500).send({ message: 'Could not place order.' });
    } finally {
        await db.end();
    }
});

app.get('/mine', async (request, response) => {
    if (request.user.role !== 'customer') {
        response.status(403).send({ message: 'Customer access required.' });
        return;
    }
    const db = await database();
    const [orders] = await db.execute(
        'SELECT * FROM Orders WHERE customer_username = ? ORDER BY created_at DESC',
        [request.user.username]
    );
    await db.end();
    response.send(orders);
});

app.get('/incoming', async (request, response) => {
    if (!['retailer', 'admin', 'user'].includes(request.user.role)) {
        response.status(403).send({ message: 'Retailer access required.' });
        return;
    }
    const db = await database();
    const query = request.user.role === 'admin'
        ? 'SELECT * FROM Orders ORDER BY created_at DESC'
        : 'SELECT * FROM Orders WHERE retailer_username = ? ORDER BY created_at DESC';
    const [orders] = await db.execute(query, request.user.role === 'admin' ? [] : [request.user.username]);
    await db.end();
    response.send(orders);
});

app.patch('/:id/status', async (request, response) => {
    if (!['retailer', 'admin', 'user'].includes(request.user.role)) {
        response.status(403).send({ message: 'Retailer access required.' });
        return;
    }
    const db = await database();
    const [result] = await db.execute(
        request.user.role === 'admin'
            ? 'UPDATE Orders SET status = ? WHERE id = ?'
            : 'UPDATE Orders SET status = ? WHERE id = ? AND retailer_username = ?',
        request.user.role === 'admin'
            ? [request.body.status, request.params.id]
            : [request.body.status, request.params.id, request.user.username]
    );
    await db.end();
    response.send(result);
});

module.exports = app;
