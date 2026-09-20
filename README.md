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
ADMIN_EMAIL=admin@gym.com
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_NAME=Genesis Manager
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

All protected routes require an `Authorization` header with a valid JWT Bearer token:
`Authorization: Bearer <your_token_here>`

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Public | Authenticates Client or Staff and returns JWT. |
| `POST` | `/register` | Public | Registers a new Client account. |
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
| `POST` | `/` | Admin | Silently creates a new staff account (Admin, Receptionist) via Supabase Admin API. |
| `PUT` | `/:id` | Admin | Modifies staff name, role, or active status (`is_active`). |

### 3. Client Management (`/api/clients`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Admin, Receptionist | Lists all clients. Optional `?search=` filter. |
| `GET` | `/:id` | Admin, Receptionist | Views client profile and active membership status. |
| `PUT` | `/:id` | Admin, Receptionist | Updates client information. |
| `DELETE` | `/:id` | Admin | Permanently deletes a client profile. |

### 4. Membership Plans (`/api/plans`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Authenticated | Lists available membership plans. |
| `GET` | `/:id` | Authenticated | Views specific plan details. |
| `POST` | `/` | Admin | Creates a new membership plan. |
| `PUT` | `/:id` | Admin | Updates plan details. |
| `PATCH` | `/:id/status` | Admin | Toggles plan active status. |

### 5. Memberships (`/api/memberships`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Authenticated | Lists memberships (Client sees own; Staff sees all). |
| `POST` | `/staff-register` | Admin, Receptionist | Registers client membership with custom start date. |
| `POST` | `/web-register` | Client | Self-service membership acquisition. |
| `PATCH` | `/cancel` | Client | Self-service membership cancellation. |
| `PATCH` | `/:id/cancel` | Admin, Receptionist | Staff-initiated membership cancellation. |

---

## 👥 Roles & Permissions

- **CLIENT**: Access to dashboard (`/client`), plan browsing, acquiring/cancelling memberships, and profile settings (`/client/profile`).
- **RECEPTIONIST**: Access to receptionist dashboard (`/reception`), client directory, client registration, membership management, and profile settings (`/reception/profile`).
- **ADMIN (Manager)**: Full system access including staff user management (`/admin/users`), staff detail views, membership plans CRUD, client management, all system memberships, and profile settings (`/admin/profile`).
