# Authenticator App — Backend

A Node.js / Express / MongoDB API that powers a demo authentication system with
email + password signup, OTP verification, TOTP-based 2FA (Google
Authenticator, Authy, Microsoft Authenticator, 2FAS...), a per-user login
history, and a small admin panel for managing users.

> This is a learning / portfolio project, not a production-ready auth
> service. OTPs are returned directly in the API response instead of being
> emailed, so it can be run and demoed without any mail provider.

## Tech Stack

- **Runtime:** Node.js (ESM), Express 5
- **Database:** MongoDB via Mongoose 9
- **Auth:** JSON Web Tokens (access + refresh), bcrypt password hashing
- **2FA:** Speakeasy (TOTP) + `qrcode` for QR code generation
- **Dev tooling:** nodemon

## Project Structure

```
authenticator-app-backend/
├── app.js                 # Express app: middleware + route mounting
├── server.js               # Entry point, starts the HTTP server
├── config/
│   └── dbConfig.js         # MongoDB connection
├── models/                 # Mongoose schemas (User, Admin, History)
├── controllers/            # Route handlers (auth, admin, history, 2FA)
├── routes/                 # Express routers, one per resource
├── middlewares/             # Auth guard + centralized error handler
└── helpers/                 # Password hashing, JWT signing/verification
```

## Getting Started

### Prerequisites

- Node.js 20+
- A MongoDB connection string (e.g. a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### Setup

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev             # starts on http://localhost:5050 with nodemon
```

### Environment Variables

Create a `.env` file in the project root:

```env
# "development" or "production" — controls which Mongo URL is used and the listening port
NODE_ENV=development

# MongoDB connection strings
MONGODB_URL_DEV=<your MongoDB connection string for local/dev>
MONGODB_URL_PROD=<your MongoDB connection string for production>

# Secret used to sign access & refresh JWTs
JWT_SECRET=<a long random string>
```

The server listens on port `5050` in development and `5000` in production
(see `server.js`).

### Scripts

| Command       | Description                              |
| ------------- | ----------------------------------------- |
| `npm run dev` | Start the server with nodemon (auto-restart on changes) |
| `npm start`   | Start the server with plain `node`        |

## API Reference

All routes are prefixed with `/api/v1`.

### Auth — `/api/v1/auth`

| Method | Route                     | Auth | Description |
| ------ | -------------------------- | ---- | ----------- |
| POST   | `/send-otp?auth=signup`    | —    | Create a pending user and generate a signup OTP |
| POST   | `/send-otp?auth=login`     | —    | Generate a login OTP for an existing user |
| POST   | `/check`                    | —    | Check whether a user has completed OTP verification |
| POST   | `/verify-otp`               | —    | Verify a signup or login OTP; returns access & refresh tokens |
| POST   | `/verify-code`              | —    | Log in with a 2FA (TOTP) code instead of an OTP |
| POST   | `/refresh-access`           | —    | Exchange a refresh token for a new access token |
| GET    | `/me`                       | User | Get the current user's profile |

### 2FA — `/api/v1/code`

| Method | Route       | Auth | Description |
| ------ | ----------- | ---- | ----------- |
| POST   | `/generate` | User | Generate a TOTP secret + QR code to link an authenticator app |
| POST   | `/verify`   | User | Verify a TOTP code and mark the account as 2FA-verified |

### Login History — `/api/v1/history`

| Method | Route  | Auth | Description |
| ------ | ------ | ---- | ----------- |
| GET    | `/get` | User | Get the current user's login history (OTP & 2FA logins) |

### Admin — `/api/v1/admin`

| Method | Route     | Auth  | Description |
| ------ | --------- | ----- | ----------- |
| POST   | `/login`  | —     | Admin login |
| GET    | `/users`  | Admin | List all registered users |
| PUT    | `/status` | Admin | Toggle a user's OTP / 2FA verification status |
| DELETE | `/delete` | Admin | Delete a user and their login history |

> There is no self-serve admin signup route — an admin document has to be
> created directly in the `admins` collection (with a bcrypt-hashed password,
> which happens automatically via the `pre('save')` hook if you insert it
> through the `Admin` model rather than raw MongoDB).

## Auth Flow Summary

1. **Signup:** `POST /auth/send-otp?auth=signup` creates the user and returns an OTP → `POST /auth/verify-otp` confirms it and returns tokens.
2. **OTP login:** `POST /auth/send-otp?auth=login` → `POST /auth/verify-otp`.
3. **2FA enrollment:** `POST /code/generate` (authenticated) returns a QR code → scan it in an authenticator app → `POST /code/verify` confirms the first code.
4. **2FA login:** `POST /auth/verify-code` with the current 6-digit code instead of an OTP.

Every successful OTP or 2FA login writes an entry to the `histories`
collection, which is what powers the login timeline on the frontend.
