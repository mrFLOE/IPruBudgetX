# IPruBudEx Deployment Guide

## Complete Production Deployment Instructions

This guide covers deploying the IPruBudEx application to production using Vercel (frontend) and Render (backend).

---

## Prerequisites

- Git repository with the codebase
- Vercel account (for frontend)
- Render account (for backend)
- Gemini API key (for AI features)
- Supabase account (recommended for PostgreSQL)

---

## Backend Deployment (Render)

### Step 1: Create Render Account

1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub/GitLab repository

### Step 2: Deploy Backend Service

1. Click **New +** → **Web Service**
2. Connect your repository
3. Configure settings:
   - **Name**: `iprubudex-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`

### Step 3: Configure Environment Variables

Add the following environment variables in Render dashboard:

```
DATABASE_URL=<your-supabase-or-render-postgres-url>
DB_PROVIDER=postgresql
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=<generate-strong-secret>
JWT_SECRET_KEY=<generate-strong-secret>
PORT=5000
GEMINI_API_KEY=<your-gemini-api-key>
MAX_LOGIN_ATTEMPTS=3
JWT_EXPIRATION_MINUTES=480
CORS_ORIGINS=https://<your-vercel-app>.vercel.app
```

### Step 4: Set Up Database

**Option A: Use Render PostgreSQL**
1. In Render, click **New +** → **PostgreSQL**
2. Name it `iprubudex-db`
3. Copy the **Internal Database URL**
4. Use this as your `DATABASE_URL`

**Option B: Use Supabase (Recommended)**
1. Create a new project in Supabase
2. Copy the PostgreSQL connection string
3. Database schema is automatically applied via migration

### Step 5: Deploy

1. Click **Create Web Service**
2. Render will build and deploy your backend
3. Your API will be available at: `https://iprubudex-backend.onrender.com`

---

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com) and sign up
2. Install Vercel CLI: `npm install -g vercel`

### Step 2: Deploy Frontend

1. Navigate to your project root
2. Run: `cd frontend && npm install`
3. Run: `vercel login`
4. Run: `vercel --prod`

**Or use Vercel Dashboard:**
1. Click **Add New** → **Project**
2. Import your repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Configure Environment Variables

Add in Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://iprubudex-backend.onrender.com
```

### Step 4: Deploy

1. Click **Deploy**
2. Your frontend will be available at: `https://iprubudex.vercel.app`

---

## Database Switching

### Switch to MySQL

1. Update `.env`:
   ```
   DATABASE_URL=mysql://user:password@host:port/database
   DB_PROVIDER=mysql
   ```

2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```

3. Regenerate Prisma client:
   ```bash
   cd backend && npm run prisma:generate
   ```

### Switch to SQL Server

1. Update `.env`:
   ```
   DATABASE_URL=sqlserver://host:port;database=db;user=user;password=pass
   DB_PROVIDER=sqlserver
   ```

2. Update schema provider to `sqlserver`
3. Regenerate Prisma client

### Switch to SQLite

1. Update `.env`:
   ```
   DATABASE_URL=file:./iprubudex.db
   DB_PROVIDER=sqlite
   ```

2. Update schema provider to `sqlite`
3. Regenerate Prisma client

---

## Initial Setup After Deployment

### 1. Create Super Admin User

Use Prisma Studio or direct database access:

```sql
INSERT INTO users (id, name, email, password_hash, role, is_locked, failed_attempts, created_at, updated_at)
VALUES (
  'admin-001',
  'Super Admin',
  'admin@icici.com',
  '<bcrypt-hashed-password>',
  'SUPER_ADMIN',
  false,
  0,
  NOW(),
  NOW()
);
```

**Generate password hash:**
```python
import bcrypt
password = "YourSecurePassword123!"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(hashed.decode('utf-8'))
```

### 2. Create Departments

```sql
INSERT INTO departments (id, name, created_at) VALUES
  ('dept-001', 'Information Technology', NOW()),
  ('dept-002', 'Finance', NOW()),
  ('dept-003', 'Operations', NOW()),
  ('dept-004', 'Marketing', NOW());
```

### 3. Configure Approval Hierarchy

The default hierarchy is:
1. TECH_LEAD
2. DEPT_HEAD
3. FINANCE_ADMIN
4. FPNA
5. PRINCIPAL_FINANCE
6. CFO

Modify via Admin API: `PATCH /admin/hierarchy`

---

## Health Checks

### Backend Health Check

```bash
curl https://iprubudex-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "IPruBudEx API",
  "database": "connected",
  "version": "1.0.0"
}
```

### Frontend Health Check

Visit: `https://iprubudex.vercel.app/status`

---

## Monitoring & Logs

### Render Logs

1. Go to Render dashboard
2. Select your service
3. Click **Logs** tab
4. View real-time logs and errors

### Vercel Logs

1. Go to Vercel dashboard
2. Select your project
3. Click **Deployments**
4. Select deployment → View logs

---

## Troubleshooting

### Backend Not Starting

1. Check environment variables are set correctly
2. Verify DATABASE_URL is accessible
3. Check Render logs for Python errors
4. Ensure all dependencies in requirements.txt

### Database Connection Issues

1. Verify DATABASE_URL format
2. Check database is running and accessible
3. Verify firewall rules allow connection
4. Test connection from Render shell

### CORS Errors

1. Ensure CORS_ORIGINS in backend includes frontend URL
2. Check both URLs use HTTPS in production
3. Verify no trailing slashes in URLs

### Prisma Errors

1. Ensure Prisma client is generated
2. Check schema matches database provider
3. Verify DATABASE_URL format is correct
4. Run migrations if needed

---

## Scaling Considerations

### Backend Scaling

- **Render**: Upgrade to Standard plan for auto-scaling
- Consider Redis for session storage
- Use connection pooling for database

### Database Scaling

- **Supabase**: Automatic scaling included
- **Render**: Upgrade to larger PostgreSQL plan
- Consider read replicas for high traffic

### Frontend Scaling

- Vercel automatically handles scaling
- No configuration needed
- CDN distribution included

---

## Security Checklist

- [ ] Change default SECRET_KEY and JWT_SECRET_KEY
- [ ] Use HTTPS only (enforced by Vercel/Render)
- [ ] Enable database encryption at rest
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting (Render has built-in DDoS protection)
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Monitor audit logs regularly

---

## Cost Estimates

### Free Tier
- Render: Free (with spin-down after inactivity)
- Vercel: Free (100GB bandwidth/month)
- Supabase: Free (500MB database, 50MB file storage)

**Total: $0/month** (with limitations)

### Production Tier
- Render: $7/month (always-on, no spin-down)
- Vercel: Free or Pro $20/month (more bandwidth)
- Supabase: $25/month (8GB database, better performance)

**Total: ~$32-52/month**

---

## Support

For deployment issues:
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs

For application issues:
- Check application logs
- Review audit logs in database
- Test APIs using health endpoints
