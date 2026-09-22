# Gym Management System

A full-stack Gym Management Web Application built with **React (TypeScript)**, **Vite**, **Node.js (Express)**, **PostgreSQL**, and **Supabase Auth**.

Features role-based access control for **Clients**, **Receptionists**, and **Admins (Managers)**, complete membership plan subscription workflows, self-service profile updates, password recovery, and staff user management.

---

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite, Lucide Icons, React Router
- **Backend**: Node.js, Express, PostgreSQL (`pg` pool)
- **Authentication**: Supabase Auth (JWT & Service Role Key for automated staff provisioning)
- **Infrastructure**: Docker & Docker Compose for PostgreSQL

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **Docker** & **Docker Compose**
- A **Supabase** project (URL, Anon Key, and Service Role Key)

---

### Step-by-Step Setup

#### 1. Backend Setup

```bash
cd backend
npm install
```

Copy the environment template and configure your secrets:

```bash
cp .env.example .env
```

Ensure `.env` contains your database connection string and Supabase credentials:
```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/gym_db
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
INITIAL_ADMIN_EMAIL=admin@gym.com
INITIAL_ADMIN_PASSWORD=your-secure-admin-password
INITIAL_ADMIN_NAME=Genesis Manager
FRONTEND_URL=http://localhost:5173
```

#### 2. Start PostgreSQL via Docker

In the project root or backend directory:
```bash
docker compose up -d
```

#### 3. Initialize Database & Genesis Admin Account

Run the schema build script and the admin initialization script:

```bash
# 1. Build database tables and ENUMs
node src/db/schema.js

# 2. Create the Genesis Admin/Manager account in Supabase & Postgres
node src/db/initAdmin.js
```

#### 4. Start the Backend Development Server

```bash
npm run dev
```

The Express API server will run at `http://localhost:3000`.

---

#### 5. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The React + Vite application will run at `http://localhost:5173`.

---

## 🔐 API Reference

The API base URL is `http://localhost:3000/api`. All protected routes require an `Authorization` header with a valid JWT Bearer token:
`Authorization: Bearer <your_token_here>`

Role-dependent responses are intentional and enforced by the backend:

- `CLIENT` requests to `GET /api/memberships` return only memberships belonging to the authenticated client.
- `ADMIN` and `RECEPTIONIST` requests to `GET /api/memberships` return memberships for all clients.
- `CLIENT` requests to plan endpoints see active plans only. Staff requests can see active and inactive plans.
- `/api/clients` is staff-only. Clients use `/api/auth/me` for their own authenticated profile.

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Public | Authenticates Client or Staff and returns JWT. |
| `POST` | `/register` | Public | Creates a Client account and local client profile. Passwords must contain at least 6 characters. |
| `POST` | `/password-recovery` | Public | Sends a password recovery email via Supabase. |
| `POST` | `/update-password` | Recovery Token | Updates account password using recovery token. |
| `POST` | `/change-password` | Authenticated | Allows logged-in user to change password. |
| `PUT` | `/update-profile` | Authenticated | Updates self-service profile details (Name, Email, Phone, DNI, Date of Birth, Address). |
| `POST` | `/logout` | Authenticated | Signs out active session. |
| `GET` | `/me` | Authenticated | Returns current authenticated profile. |

### 2. Staff Management (`/api/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Admin | Retrieves complete roster of internal staff users. |
| `POST` | `/` | Admin | Silently creates a new staff account via Supabase Admin API. Supported roles are `ADMIN`, `RECEPTIONIST`, and `TRAINER`; passwords must contain at least 6 characters. |
| `PUT` | `/:id` | Admin | Modifies staff name, role, or active status (`is_active`). |

### 3. Client Management (`/api/clients`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Admin, Receptionist | Lists all clients. Optional `?search=` filter. |
| `GET` | `/:id` | Admin, Receptionist | Views client profile and active membership status. |
| `PUT` | `/:id` | Admin, Receptionist | Updates client information. |
| `DELETE` | `/:id` | Admin, Receptionist | Permanently deletes a client profile and cascades local memberships. The associated Supabase Auth account is not currently deleted. |

The receptionist UI currently uses `POST /api/auth/register` when creating a client. There is no separate staff-only client-creation endpoint yet.

### 4. Membership Plans (`/api/plans`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Authenticated | Clients receive active plans only; staff receive all plans, including inactive plans. Results are ordered by price. |
| `GET` | `/:id` | Authenticated | Views a plan. Clients receive `403` for inactive plans; staff can view inactive plans. |
| `POST` | `/` | Admin | Creates a new membership plan. |
| `PUT` | `/:id` | Admin | Updates plan details. |
| `PATCH` | `/:id/status` | Admin | Toggles plan active status. |

### 5. Memberships (`/api/memberships`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Authenticated | Clients receive only their own memberships; Admins and Receptionists receive memberships for all clients. |
| `POST` | `/staff-register` | Admin, Receptionist | Registers a membership for an existing client with a valid `YYYY-MM-DD` start date. The plan must be active. |
| `POST` | `/web-register` | Client | Self-service membership acquisition. |
| `PATCH` | `/cancel` | Authenticated (intended for Client) | Cancels the authenticated user's active or pending membership. The route does not currently explicitly reject staff users. |

There is currently no `PATCH /api/memberships/:id/cancel` endpoint. Staff can register memberships, but staff-initiated cancellation by membership ID has not been implemented.

### 6. Service and Health Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/` | Public | Returns the API status message. |
| `GET` | `http://localhost:3000/test-db` | Public | Executes `SELECT NOW()` and reports database connectivity. |

---

## 👥 Roles & Permissions

- **CLIENT**: Access to dashboard (`/client`), plan browsing, acquiring/cancelling memberships, and profile settings (`/client/profile`).
- **RECEPTIONIST**: Access to receptionist dashboard (`/reception`), client directory, client registration, membership management, and profile settings (`/reception/profile`). Receptionists can currently delete clients because the backend route permits both staff roles.
- **ADMIN (Manager)**: Full system access including staff user management (`/admin/users`), staff detail views, membership plans CRUD, client management, all system memberships, and profile settings (`/admin/profile`).
