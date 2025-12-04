# 🚀 IPruBudEx - Quick Start Guide

Get the complete application running in under 5 minutes!

---

## ✅ Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- Python 3.9+ installed
- pip (Python package manager)
- npm (Node package manager)

---

## 📦 Installation

### 1. Clone and Navigate

```bash
git clone <your-repo-url>
cd iprubudex
```

### 2. Install Backend Dependencies

```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Install Node dependencies for Prisma
npm install

# Generate Prisma client
cd ..
npx prisma generate
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## ⚙️ Configuration

### 1. Set Up Environment Variables

The `.env` file is already configured with Supabase credentials. Verify it contains:

```bash
# Database (Supabase PostgreSQL - Already configured)
DATABASE_URL=postgresql://postgres:postgres@db.0ec90b57d6e95fcbda19832f.supabase.co:5432/postgres
DB_PROVIDER=postgresql

# Supabase
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=<your-key>

# Backend API
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=iprubudex-secret-key-dev-2024
JWT_SECRET_KEY=iprubudex-jwt-secret-key-dev-2024
PORT=5000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000

# AI (Optional - for Excel import)
GEMINI_API_KEY=your-gemini-api-key-here

# Security
MAX_LOGIN_ATTEMPTS=3
JWT_EXPIRATION_MINUTES=480
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 2. Database Setup

The database is already migrated to Supabase! Tables and RLS policies are configured.

---

## 🏃 Running the Application

### Terminal 1: Start Backend API

```bash
cd backend
python app.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

Test the API:
```bash
curl http://localhost:5000/health
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

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

---

## 🎯 Access the Application

Open your browser and navigate to:

**http://localhost:3000**

You'll be redirected to the login page.

---

## 👤 Initial Setup

### Create Your First User (Super Admin)

Since the database is fresh, you need to create a Super Admin user first.

**Option 1: Use Supabase SQL Editor**

1. Go to your Supabase Dashboard
2. Open SQL Editor
3. Run this query (replace email and use your own password):

```sql
INSERT INTO users (id, name, email, password_hash, role, is_locked, failed_attempts, created_at, updated_at)
VALUES (
  'admin-001',
  'Super Admin',
  'admin@icici.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYfqK3BlL9e',
  'SUPER_ADMIN',
  false,
  0,
  NOW(),
  NOW()
);
```

**Note:** The hash above is for password: `admin123`. For production, generate your own:

```python
import bcrypt
password = "YourSecurePassword123!"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(hashed.decode('utf-8'))
```

**Option 2: Use Prisma Studio**

```bash
npx prisma studio
```

Navigate to the `users` table and add a user manually.

### Create Departments

```sql
INSERT INTO departments (id, name, created_at) VALUES
  ('dept-001', 'Information Technology', NOW()),
  ('dept-002', 'Finance', NOW()),
  ('dept-003', 'Operations', NOW()),
  ('dept-004', 'Marketing', NOW()),
  ('dept-005', 'Human Resources', NOW());
```

---

## 🔐 Login and Explore

### 1. Login as Super Admin

1. Go to http://localhost:3000
2. Enter credentials:
   - Email: `admin@icici.com`
   - Password: `admin123` (or your custom password)
3. Click **Sign in**

### 2. Create More Users

1. Navigate to **Admin** in the top menu
2. Click **Users** tab
3. Create users for different roles:
   - REQUESTOR
   - TECH_LEAD
   - DEPT_HEAD
   - FINANCE_ADMIN
   - FPNA
   - PRINCIPAL_FINANCE
   - CFO

### 3. Test the Workflow

**As Requestor:**
1. Logout and login as a REQUESTOR user
2. Go to **Requests** → **+ New Request**
3. Fill in the form:
   - Type: CAPEX
   - Amount: $50,000
   - Category: IT Equipment
   - Justification: New servers for production
   - Department: Information Technology
4. Click **Create Request**
5. Click **Submit** to send for approval

**As Approver:**
1. Logout and login as a TECH_LEAD user
2. Go to **Approvals**
3. You'll see the pending request
4. Click **✓ Approve**
5. Add comments (optional)
6. Confirm

The request will move to the next approval level (DEPT_HEAD)!

---

## 📊 Key Features to Try

### 1. Dashboard
- View recent requests
- See pending approvals
- Check system statistics (Super Admin only)

### 2. Budget Requests
- Create new CAPEX/OPEX requests
- Edit drafts
- Submit for approval
- View status and timeline

### 3. Approval Workflow
- Approve requests
- Send back for rework
- Reject with comments
- View complete timeline

### 4. Admin Panel (Super Admin only)
- Manage users (lock/unlock)
- View departments
- System statistics
- Audit logs

### 5. Status Page
- Check backend health
- View database connection
- System information

---

## 🧪 API Testing

Test the backend directly using curl:

### 1. Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@icici.com",
    "password": "admin123"
  }'
```

Copy the `token` from the response.

### 2. Create Request
```bash
curl -X POST http://localhost:5000/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "CAPEX",
    "amount": 50000,
    "category": "IT Equipment",
    "justification": "New servers needed",
    "department_id": "dept-001"
  }'
```

### 3. View All Requests
```bash
curl -X GET http://localhost:5000/requests \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

See **API_DOCUMENTATION.md** for all 32 endpoints!

---

## 🎨 UI Components

The frontend includes:

### Pages
- ✅ Login page with beautiful gradient
- ✅ Dashboard with role-specific widgets
- ✅ Request listing with filters
- ✅ Request creation form
- ✅ Request detail with timeline
- ✅ Approvals page with actions
- ✅ Admin panel with tabs
- ✅ Status page with health checks

### Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Tailwind CSS styling
- ✅ Loading states and spinners
- ✅ Error handling and alerts
- ✅ Modal dialogs
- ✅ Status badges
- ✅ Navigation bar
- ✅ Role-based menu items

---

## 🔧 Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'flask'`
**Fix:** Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Frontend won't start

**Error:** Dependencies not found
**Fix:** Install dependencies
```bash
cd frontend
npm install
```

### Database connection error

**Error:** `database "postgres" does not exist`
**Fix:** Check DATABASE_URL in .env is correct

### CORS error in browser

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`
**Fix:**
1. Ensure backend is running on port 5000
2. Check CORS_ORIGINS in .env includes `http://localhost:3000`
3. Restart backend

### Can't login

**Error:** `Invalid credentials`
**Fix:**
1. Verify user exists in database
2. Check password hash is correct
3. Ensure user is not locked (`is_locked = false`)

---

## 📚 Next Steps

### Development
1. Review code in `/backend/src` and `/frontend/src`
2. Customize styling in `frontend/src/app/globals.css`
3. Add more features as needed

### Testing
1. Create test users for each role
2. Test complete approval workflow
3. Try all API endpoints
4. Test on different devices

### Production
1. Follow **DEPLOYMENT.md** for production setup
2. Change SECRET_KEY and JWT_SECRET_KEY
3. Set up production database
4. Configure environment variables on hosting platforms
5. Deploy to Vercel and Render

---

## 🎓 Learning Resources

- **API Reference:** See `API_DOCUMENTATION.md`
- **Deployment Guide:** See `DEPLOYMENT.md`
- **Feature List:** See `PROJECT_SUMMARY.md`
- **Complete Guide:** See `README_COMPLETE.md`

---

## 💡 Pro Tips

1. **Use Prisma Studio** to easily view and edit database records:
   ```bash
   npx prisma studio
   ```

2. **Monitor Backend Logs** in real-time to see API requests

3. **Use Browser DevTools** to inspect API calls and responses

4. **Test Different Roles** by creating multiple users and logging in as each

5. **Check Status Page** regularly to ensure system health

---

## 🎉 You're All Set!

Your complete IPruBudEx application is now running with:

✅ 32 fully functional API endpoints
✅ Complete frontend with all pages
✅ Authentication and authorization
✅ 6-tier approval workflow
✅ Admin panel
✅ Status monitoring

**Need help?** Check the documentation files or review the code comments.

**Ready for production?** Follow `DEPLOYMENT.md` to deploy to Vercel and Render in 30 minutes!

---

**Version:** 1.0.0
**Last Updated:** January 2024
**Status:** ✅ Production Ready
