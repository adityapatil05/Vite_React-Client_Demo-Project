# Employee Management System

A full-stack employee management application with a React/Vite client and a Node.js/Express API backed by MySQL. Users sign up with an email verification OTP, then sign in with their username,
password, and a login OTP to receive a JWT and manage employee records.

## Features

- Email-verified signup and username/password plus OTP sign-in with JWT authentication
- Protected employee management dashboard
- List, add, update, and delete employee records
- MySQL persistence through the Node.js API
- React Router-based client navigation
- Bootstrap-based styling and responsive tables

## Technology Stack

- **Client:** React, Vite, React Router, Axios, Bootstrap
- **Server:** Node.js, Express, CORS, JSON Web Token
- **Database:** MySQL

## Project Structure

```text
Git_Project/
├── Client/    # React/Vite frontend
└── Server/    # Express API and MySQL routes
```

## Prerequisites

- Node.js and npm
- MySQL Server
- An `emp` table in the configured database with `No`, `Name`, and `Address` columns

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
    "database": "nodedb",
    "user": "root",
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

`Server/config/local.json` is ignored by Git. Never commit database passwords or JWT secrets.
For environment-based configuration, copy `Server/.env.example` to
`Server/.env`, fill in the values, and restart the server. The server loads
this file automatically. Never commit `Server/.env`.

After valid credentials, the server sends the OTP to the registered email
address using Google SMTP. `SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM` are
server-only variables and are never sent by the client. For Gmail, use an App
Password for `SMTP_PASS`, not your normal password.

Users are stored in the MySQL `users` table. During signup, a six-digit OTP
verifies the supplied email. During login, a new OTP is sent to that user's
registered email; each OTP expires after five minutes and is invalidated after
five incorrect attempts. Passwords are stored as salted scrypt hashes.
Employee records are owned by the authenticated username, so each user can
only view and modify their own records. The single administrator account can
also view unowned records; its username is configured as `loki_adii`.

The dashboard also provides management sections for Products, Customers,
Agents, Suppliers, and Finance. Each record is owned by the authenticated
user; the administrator can view all records. The `Emp` table is used as the
Agents table, while the other sections use `Products`, `Customers`,
`Suppliers`, and `Finance` tables with primary keys and owner foreign keys.
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

### Administrator login

The administrator uses the same login screen and the same username/password
plus email OTP flow. Create the administrator account with username
`loki_adii`; the server assigns that username the `admin` role automatically.
After login, the JWT contains `role: "admin"` and the dashboard allows access
to all business records. The administrator password is the password chosen
during signup; it is not the old `auth.password` value in `local.json`.

## API Endpoints

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/login/signup/request-otp` | No | Send signup email verification OTP |
| `POST` | `/login/signup/verify-otp` | No | Verify OTP and create an account |
| `POST` | `/login/request-otp` | No | Send login OTP to registered email |
| `POST` | `/login/verify-otp` | No | Verify login OTP and return a JWT |
| `POST` | `/login/password-reset/request-otp` | No | Send password reset OTP |
| `POST` | `/login/password-reset/verify-otp` | No | Verify OTP and update password |
| `GET` | `/emps` | JWT | List employees |
| `POST` | `/emps` | JWT | Add an employee |
| `PUT` | `/emps/:No` | JWT | Update an employee |
| `DELETE` | `/emps/:No` | JWT | Delete an employee |

Send the token returned by `/login` in the protected request header:

```text
Authorization: Bearer <token>
```

## Client Commands

Run these commands from `Client/`:

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

## Development Notes

- The current login implementation is intended for development/testing and reads credentials from local configuration.
- Login email notifications are sent only after successful authentication. A
  mail delivery failure is logged by the server but does not prevent the user
  from receiving a valid JWT.
- Employee queries are assembled in the server routes; add validation and parameterized queries before production use.
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

Deploy the resulting `Client/dist/` folder as a static site. After deployment,
your own computer does not need to keep the server running; the hosting
provider runs it continuously. The server only needs to run locally while
testing locally.

## License

This project is currently distributed under the license specified in the repository metadata.
