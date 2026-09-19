# Gym Management System

## Backend Setup
Follow these simple steps to get the local development environment running.

## Prerequisites
- **Node.js** installed
- **Docker** & **Docker Compose** installed

## Getting Started

**1. Install Dependencies**
```bash
npm install
```

**2. Set Up Environment Variables**
You need a `.env` file for the app to connect to the database. Create one by copying the example file:
```bash
cp .env.example .env
```
*(Open the new `.env` file and make sure the `DATABASE_URL` matches your local setup if you change any Docker settings).*

**3. Start the Database**
Boot up the local PostgreSQL instance in the background using Docker:
```bash
docker compose up -d
```

**4. Start the Development Server**
Launch the Express application:
```bash
npm run dev
```

## Useful Links
- **Local Server:** http://localhost:3000
- **Database Connection Test:** http://localhost:3000/api/test-db