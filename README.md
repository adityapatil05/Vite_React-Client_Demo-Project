# Employee Management System

A full-stack employee management application with a React/Vite client and a Node.js/Express API backed by MySQL. Users sign in to receive a JWT, then manage employee records from the protected dashboard.

## Features

- Username/password sign-in with JWT authentication
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
For environment-based configuration, set the variables listed in
`Server/.env.example` in the shell before starting the server.

The development login uses the `auth.username` and `auth.password` values in
`Server/config/local.json`. These values are local-only and must not be committed.

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

The client expects the API at `http://127.0.0.1:9999`.

Use the development username and password configured in `Server/config/local.json`
to sign in. If you change either value, restart the server before logging in.

## API Endpoints

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/login` | No | Authenticate and return a JWT |
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
- Employee queries are assembled in the server routes; add validation and parameterized queries before production use.
- Configure CORS and authentication secrets appropriately for a deployed environment.

## License

This project is currently distributed under the license specified in the repository metadata.
