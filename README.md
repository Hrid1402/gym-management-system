# Gym Management System (Backend MVP)

This is the Node.js and Express backend for the Gym Management System, featuring role-based access control, delegated Supabase authentication, and comprehensive client/membership management.

## Prerequisites
- **Node.js** installed
- **Docker** & **Docker Compose** installed
- A **Supabase** project (for authentication keys)

## Getting Started

**1. Install Dependencies**
```bash
npm install

```

**2. Set Up Environment Variables**
Create your environment file from the template:

```bash
cp .env.example .env

```

*(Open `.env` and ensure `DATABASE_URL` matches your local Docker setup, and add your Supabase `SUPABASE_URL` and `SUPABASE_ANON_KEY` credentials).*

**3. Start the Database**
Boot up the local PostgreSQL instance in the background using Docker:

```bash
docker compose up -d

```

**4. Initialize the Database Schema & Mock Data**
If this is your first time starting the project, or if your Docker volume was wiped/not yet created, you must generate the tables and seed the system with the initial synced Supabase accounts.

Run these scripts sequentially:

```bash
# 1. Build tables, relations, and ENUMs
node src/db/schema.js

# 2. Populate mock plans and permanent Staff/Client accounts
node src/db/seed.js

```

**5. Start the Development Server**
Launch the Express application:

```bash
npm run dev

```

---

## 🚀 API Reference

All protected routes require a JSON Web Token (JWT) to be passed in the headers:
`Authorization: Bearer <your_token_here>`

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/login` | Public | Authenticates Staff/Clients and returns JWT. |
| `POST` | `/register` | Public | Registers a new web client. |
| `POST` | `/password-recovery` | Public | Sends a password reset email. |
| `POST` | `/update-password` | Recovery Token | Updates password using recovery token. |
| `POST` | `/logout` | Authenticated | Logs out and invalidates token. |
| `GET` | `/me` | Authenticated | Returns current authenticated user profile. |

### 2. Client Management (`/api/clients`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Admin, Recep. | Lists all clients. Use `?search=name` to filter. |
| `GET` | `/:id` | Admin, Recep. | Views client profile and current active membership. |
| `PUT` | `/:id` | Admin, Recep. | Updates client data (name, phone, etc.). |
| `DELETE` | `/:id` | Admin | Permanently deletes a client. |

### 3. Membership Plans (`/api/plans`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Authenticated | Lists available plans. |
| `GET` | `/:id` | Authenticated | Views details of a specific plan. |
| `POST` | `/` | Admin | Creates a new membership plan. |
| `PUT` | `/:id` | Admin | Edits a plan's name, price, or duration. |
| `PATCH` | `/:id/status` | Admin | Activates or deactivates a plan. |

### 4. Memberships (`/api/memberships`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Authenticated | Lists memberships (Clients see their own; Staff see all). |
| `POST` | `/staff-register` | Admin, Recep. | Registers a client to a plan with a custom start date. |
| `POST` | `/web-register` | Client | Client self-registration (start date defaults to today). |
| `PATCH` | `/:id/cancel` | Authenticated | Cancels an active or pending membership. |

---

## Useful Links

* **Local Server:** http://localhost:3000
* **Database Connection Test:** http://localhost:3000/api/test-db
