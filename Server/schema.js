const mysql = require('mysql2/promise');
const { getConnectionDetails } = require('./db');

const getDatabase = () => mysql.createConnection(getConnectionDetails());

async function ensureBusinessSchema() {
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
        await database.execute(`
            CREATE TABLE IF NOT EXISTS Emp (
                No INT AUTO_INCREMENT PRIMARY KEY,
                Name VARCHAR(100) NOT NULL,
                Address VARCHAR(255) NOT NULL,
                Contact VARCHAR(40),
                CustomerProvided VARCHAR(255),
                owner_username VARCHAR(100)
            )
        `);
        const [agentColumns] = await database.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Emp'`
        );
        const existingAgentColumns = agentColumns.map((column) => column.COLUMN_NAME);
        if (!existingAgentColumns.includes('Contact')) {
            await database.execute('ALTER TABLE Emp ADD COLUMN Contact VARCHAR(40)');
        }
        if (!existingAgentColumns.includes('CustomerProvided')) {
            await database.execute('ALTER TABLE Emp ADD COLUMN CustomerProvided VARCHAR(255)');
        }
        if (!existingAgentColumns.includes('owner_username')) {
            await database.execute('ALTER TABLE Emp ADD COLUMN owner_username VARCHAR(100)');
        }
        await database.execute(`
            CREATE TABLE IF NOT EXISTS Products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                price DECIMAL(12,2) NOT NULL,
                total_stock INT NOT NULL,
                available_stock INT NOT NULL,
                image_url VARCHAR(1000),
                created_at DATE NOT NULL DEFAULT (CURRENT_DATE),
                owner_username VARCHAR(100) NOT NULL,
                FOREIGN KEY (owner_username) REFERENCES users(username)
            )
        `);
        const [productColumns] = await database.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Products'`
        );
        if (!productColumns.some((column) => column.COLUMN_NAME === 'image_url')) {
            await database.execute('ALTER TABLE Products ADD COLUMN image_url VARCHAR(1000)');
        }
        await database.execute(`
            CREATE TABLE IF NOT EXISTS Customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                contact VARCHAR(40),
                email VARCHAR(255),
                bill_date DATE,
                service_name VARCHAR(150),
                amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
                amount_pending DECIMAL(12,2) NOT NULL DEFAULT 0,
                created_at DATE NOT NULL DEFAULT (CURRENT_DATE),
                owner_username VARCHAR(100) NOT NULL,
                FOREIGN KEY (owner_username) REFERENCES users(username)
            )
        `);
        const [customerColumns] = await database.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Customers'`
        );
        if (customerColumns.some((column) => column.COLUMN_NAME === 'service_name')) {
            await database.execute('ALTER TABLE Customers DROP COLUMN service_name');
        }
        await database.execute(`
            CREATE TABLE IF NOT EXISTS Suppliers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                address VARCHAR(255),
                contact VARCHAR(40),
                amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
                amount_pending DECIMAL(12,2) NOT NULL DEFAULT 0,
                owner_username VARCHAR(100) NOT NULL,
                FOREIGN KEY (owner_username) REFERENCES users(username)
            )
        `);
        await database.execute(`
            CREATE TABLE IF NOT EXISTS Finance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                direction ENUM('receivable', 'payable') NOT NULL,
                party_name VARCHAR(150) NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                due_date DATE,
                status VARCHAR(40) NOT NULL DEFAULT 'pending',
                notes VARCHAR(500),
                owner_username VARCHAR(100) NOT NULL,
                FOREIGN KEY (owner_username) REFERENCES users(username)
            )
        `);
        await database.execute(`
            CREATE TABLE IF NOT EXISTS Orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_username VARCHAR(100) NOT NULL,
                retailer_username VARCHAR(100) NOT NULL,
                product_id INT NOT NULL,
                product_name VARCHAR(150) NOT NULL,
                quantity INT NOT NULL,
                unit_price DECIMAL(12,2) NOT NULL,
                total_amount DECIMAL(12,2) NOT NULL,
                payment_method ENUM('online', 'cod') NOT NULL,
                payment_status ENUM('pending', 'recorded') NOT NULL DEFAULT 'pending',
                delivery_address VARCHAR(500) NOT NULL,
                contact VARCHAR(40) NOT NULL,
                status VARCHAR(40) NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_username) REFERENCES users(username),
                FOREIGN KEY (retailer_username) REFERENCES users(username),
                FOREIGN KEY (product_id) REFERENCES Products(id)
            )
        `);
        for (const table of ['Products', 'Suppliers']) {
            const [columns] = await database.execute(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
                [table]
            );
            if (!columns.some((column) => column.COLUMN_NAME === 'created_at')) {
                await database.execute(
                    `ALTER TABLE ${table} ADD COLUMN created_at DATE NOT NULL DEFAULT (CURRENT_DATE)`
                );
            }
        }
    } finally {
        await database.end();
    }
}

module.exports = { ensureBusinessSchema };
