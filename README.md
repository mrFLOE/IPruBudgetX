# IPruBudEx - Integrated Prudent Budget Exchange

## Phase 1: Base Architecture

This repository contains the foundational architecture for IPruBudEx, a budget management and approval system.

**Current Phase**: Phase 1 - Database Schema & Multi-DB Support
**Status**: Foundation Only - No Business Logic Implemented

---

## Project Overview

IPruBudEx is being built in phases:

- **Phase 1** (Current): Base architecture, Prisma ORM, database schema, and multi-database switching
- **Phase 2+** (Future): Business logic, authentication, UI, workflows, and full features

---

## Architecture

```
/iprubudex
├── /frontend          # Next.js application (placeholder)
├── /backend           # Flask API + Database layer (placeholder)
├── /prisma            # Prisma schema and migrations
├── /infra             # Deployment configurations
├── /docs              # Documentation (placeholder)
├── .env.example       # Environment variable template
└── README.md          # This file
```

---

## Database Models (Phase 1)

The following base models are defined in `prisma/schema.prisma`:

### User
Stores system users with authentication and role information.
- `id`: Unique identifier (cuid)
- `name`: User's full name
- `email`: Unique email address
- `passwordHash`: Hashed password
- `role`: User role
- `department`: Optional department assignment
- `createdAt`: Account creation timestamp

### Department
Organizational departments for user assignment.
- `id`: Unique identifier (cuid)
- `name`: Unique department name

### AuditLog
System-wide audit trail for all actions.
- `id`: Unique identifier (cuid)
- `userId`: User who performed the action
- `action`: Description of action
- `metadata`: JSON metadata (optional)
- `timestamp`: When the action occurred

### SystemConfig
Key-value store for system configuration.
- `key`: Configuration key (primary key)
- `value`: Configuration value

---

## Multi-Database Support

IPruBudEx supports multiple database providers via Prisma ORM:

- **PostgreSQL** (Default - Supabase)
- **MySQL**
- **Microsoft SQL Server**
- **SQLite**

### Switching Databases

To switch databases, follow these steps:

**Step 1**: Edit `prisma/schema.prisma` and change the provider:

```prisma
datasource db {
  provider = "postgresql"  // Change to: mysql, sqlserver, or sqlite
  url      = env("DATABASE_URL")
}
```

**Step 2**: Update `.env` with the appropriate DATABASE_URL format:

```env
# For PostgreSQL (Default)
DATABASE_URL="postgresql://user:password@host:port/database"

# For MySQL
DATABASE_URL="mysql://user:password@host:port/database"

# For SQL Server
DATABASE_URL="sqlserver://host:port;database=mydb;user=user;password=pass"

# For SQLite
DATABASE_URL="file:./dev.db"
```

**Step 3**: Regenerate Prisma Client:

```bash
cd backend
npm run prisma:generate
```

---

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Database server (PostgreSQL/MySQL/MSSQL) or SQLite

### Step 1: Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd iprubudex

# Install backend dependencies (includes Prisma)
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and set your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/iprubudex"
```

### Step 3: Initialize Database

```bash
# Generate Prisma Client
cd backend
npm run prisma:generate

# Push schema to database (creates tables)
npm run prisma:push

# OR run migrations (for production)
npm run prisma:migrate
```

### Step 4: Verify Setup

```bash
# Open Prisma Studio to view database
npm run prisma:studio
```

---

## Available Scripts

### Backend (Database Layer)

```bash
cd backend

# Generate Prisma Client after schema changes
npm run prisma:generate

# Push schema changes to database (dev)
npm run prisma:push

# Create and run migrations (production)
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

### Frontend (Placeholder)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend API (Placeholder)

```bash
cd backend

# Run Flask development server
python app.py
```

---

## What's NOT Included (Phase 1)

The following are intentionally **not implemented** in Phase 1:

- UI pages and routes
- Authentication and authorization
- Budget management features
- Approval workflows
- Notifications
- Super Admin features
- Business logic and services
- API endpoints (except health check)

These will be implemented in subsequent phases.

---

## Database Client Usage

The Prisma client is available at `backend/src/db/prismaClient.ts`:

```typescript
import { prisma } from './db/prismaClient';

// Example usage (future implementation)
const users = await prisma.user.findMany();
const user = await prisma.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: 'hashed_password',
    role: 'user'
  }
});
```

---

## Deployment (Placeholder)

Deployment configurations are prepared but not active:

- **Frontend**: Vercel (`infra/vercel.json`)
- **Backend**: Render.com (`infra/render.yaml`)

Actual deployment will be configured in future phases.

---

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Python Flask
- **Database**: Prisma ORM (multi-database support)
- **Default DB**: Supabase PostgreSQL

---

## Project Status

**Phase 1 Complete**: Base architecture, Prisma schema, and database switching mechanism are ready.

**Next Steps (Phase 2)**:
- Implement authentication system
- Create user management APIs
- Build frontend UI components
- Add budget models and logic

---

## Contributing

This is Phase 1. No business logic should be added yet. Contributions should focus on:
- Database schema improvements
- Documentation updates
- Build and deployment configuration

---

## License

[Add your license here]

---

## Contact

[Add contact information here]
