# Retail Business Management Platform

A full-stack retail and business management platform with a React/Vite client
and a Node.js/Express API backed by MySQL. Retailers can manage products,
customers, suppliers, agents, inventory, orders, and finances. Customers can
browse products and place delivery orders.

## Features

- Email-verified signup, login OTP, password reset OTP, and JWT authentication
- Customer, retailer, and administrator roles with protected backend routes
- Retailer dashboard for products, customers, suppliers, agents, and finance
- Customer storefront with product cards, images, stock, and order placement
- COD and online-payment recording with delivery address and contact details
- Transactional stock updates that prevent overselling
- Automatic finance receivables generated from customer orders
- Yearly financial summaries, including inventory value and net worth
- MySQL persistence with Indian Standard Time handling
- Responsive Bootstrap-based interface

## Technology Stack

- **Client:** React, Vite, React Router, Axios, Bootstrap
- **Server:** Node.js, Express, CORS, JSON Web Token
- **Database:** MySQL/Aiven MySQL
- **Email:** Nodemailer with Brevo SMTP

## Project Structure

```text
Git_Project/
├── Client/    # React/Vite frontend
└── Server/    # Express API and MySQL routes
```

## Prerequisites

- Node.js and npm
- MySQL Server or an Aiven MySQL instance
- SMTP credentials from Brevo or another compatible provider

## Installation

Clone the repository and install dependencies in both applications:

```bash
git clone <repository-url>
cd Git_Project

cd Server
npm install

cd ../Client
npm install
```

## Server Configuration

The server uses the `config` package. Create or update `Server/config/local.json` with your local MySQL connection details and a strong JWT secret:

```json
{
  "ConnectionDetails": {
    "host": "localhost",
    "port": 3306,
    "database": "database_name",
    "user": "user",
    "password": "your_mysql_password"
  },
  "AppicationPort": 9999,
  "jwt": {
    "secretKey": "replace_with_a_long_random_secret"
  },
  "auth": {
    "username": "replace_with_a_login_username",
    "password": "replace_with_a_strong_login_password"
  }
}
```

After valid credentials, the server sends the OTP to the registered email
address using SMTP. `SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM` are server-only
variables and are never sent by the client. For Brevo, use
`smtp-relay.brevo.com` with port `2525` and the Brevo SMTP key as
`SMTP_PASS`.

Users are stored in the MySQL `users` table. During signup, a six-digit OTP
verifies the supplied email. During login, a new OTP is sent to that user's
registered email; each OTP expires after five minutes and is invalidated after
five incorrect attempts. Passwords are stored as salted scrypt hashes.

The dashboard also provides management sections for Products, Customers,
Agents, Suppliers, and Finance. Each record is owned by the authenticated
user; the administrator can view all records.
Customer records contain contact, email, bill date, paid amount, and pending
amount. Finance also provides a combined overview using product inventory
value, customer pending amounts, supplier pending amounts, and Finance
receivable or payable amounts.
Login display timestamps and MySQL connections use Indian Standard Time
(`Asia/Kolkata`, `+05:30`). Bill dates and due dates are stored as date-only
values, so they display on the same calendar date entered by the user.

## Running the Application

Start the API in one terminal:

```bash
cd Server
npm start
```

Start the client in a second terminal:

```bash
cd Client
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

The client uses `VITE_API_URL` for the API address. If it is not set, it
defaults to `http://127.0.0.1:9999`.

Create an account from the client's **Create an account** link, then sign in
with that username and password. Login credentials are read from the MySQL
`users` table; the legacy `auth` values in `Server/config/local.json` are not
used by the current login flow. If the server is configured for Aiven, make
sure the account was created in that same Aiven database.

## API Endpoints

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/login/signup/request-otp` | No | Send signup email verification OTP |
| `POST` | `/login/signup/verify-otp` | No | Verify OTP and create an account |
| `POST` | `/login/request-otp` | No | Send login OTP to registered email |
| `POST` | `/login/verify-otp` | No | Verify login OTP and return a JWT |
| `POST` | `/login/password-reset/request-otp` | No | Send password reset OTP |
| `POST` | `/login/password-reset/verify-otp` | No | Verify OTP and update password |


Send the token returned by `/login` in the protected request header:


## Client Commands

Run these commands from `Client/`:

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

## Development Notes

- Login email notifications are sent only after successful authentication.
- The server initializes and migrates the required business tables at startup.
- Configure CORS and authentication secrets appropriately for a deployed environment.

## Deployment

Deploy `Server/` as a Node.js service and use `node index.js` (or `npm start`)
as its start command. Configure these environment variables in the hosting
provider; do not commit them: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`,
`DB_PASSWORD`, `DB_SSL_CA`, `JWT_SECRET`, `APP_PORT`, `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM`.
The database environment variables override `Server/config/local.json`, so
the server and all authenticated users use the same database.

Build `Client/` with `VITE_API_URL` set to the deployed server URL:

```bash
VITE_API_URL=https://your-api.example.com npm run build
```

Deploy the resulting `Client/dist/` folder as a static site. 

## License

This project is currently distributed under the license specified in the repository metadata.
