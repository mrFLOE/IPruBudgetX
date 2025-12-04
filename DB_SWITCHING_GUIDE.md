# 🔄 IpruBudgetX - Database Switching Guide

## Seamless Multi-Database Support via Prisma

IpruBudgetX supports **instant database switching** without any code changes. Switch between PostgreSQL, MySQL, SQL Server, and SQLite in under 1 minute!

---

## 🎯 Supported Databases

| Database | Provider Code | Use Case |
|----------|--------------|----------|
| **PostgreSQL** | `postgresql` | Production (Supabase recommended) |
| **MySQL** | `mysql` | Alternative production/enterprise |
| **SQL Server** | `sqlserver` | Enterprise/Microsoft environments |
| **SQLite** | `sqlite` | Local development/testing |

---

## ⚡ Quick Switch (Under 1 Minute)

### Current Setup
Default: **PostgreSQL (Supabase)**

### Switch to Any Database

**Step 1:** Edit `.env` file
```bash
# Change these two lines:
DB_PROVIDER=<new-provider>
DATABASE_URL=<new-connection-string>
```

**Step 2:** Regenerate Prisma Client
```bash
npx prisma generate
```

**Step 3:** Apply Schema
```bash
npx prisma migrate dev --name init_<dbname>
```

**Done!** No code changes required.

---

## 📝 Database-Specific Configuration

### 1️⃣ PostgreSQL (Default - Supabase)

**When to use:**
- Production deployment
- Cloud-hosted (Supabase, AWS RDS, etc.)
- Best for scalability

**.env Configuration:**
```bash
DB_PROVIDER=postgresql
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

**Supabase Example:**
```bash
DB_PROVIDER=postgresql
DATABASE_URL="postgresql://postgres:yourpassword@db.yourproject.supabase.co:5432/postgres"
```

**Setup Commands:**
```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name init_postgresql

# Verify connection
npx prisma studio
```

---

### 2️⃣ MySQL

**When to use:**
- Existing MySQL infrastructure
- Shared hosting environments
- Alternative to PostgreSQL

**.env Configuration:**
```bash
DB_PROVIDER=mysql
DATABASE_URL="mysql://user:password@host:port/database"
```

**Local MySQL Example:**
```bash
DB_PROVIDER=mysql
DATABASE_URL="mysql://root:password@localhost:3306/iprubudgetx"
```

**Cloud MySQL Example (AWS RDS):**
```bash
DB_PROVIDER=mysql
DATABASE_URL="mysql://admin:password@mydb.region.rds.amazonaws.com:3306/iprubudgetx"
```

**Setup Commands:**
```bash
# 1. Create database in MySQL
mysql -u root -p
CREATE DATABASE iprubudgetx;
EXIT;

# 2. Update .env with MySQL settings

# 3. Generate Prisma client
npx prisma generate

# 4. Create and apply migration
npx prisma migrate dev --name init_mysql

# 5. Verify
npx prisma studio
```

---

### 3️⃣ Microsoft SQL Server

**When to use:**
- Enterprise Microsoft environments
- Integration with existing MSSQL infrastructure
- Windows server environments

**.env Configuration:**
```bash
DB_PROVIDER=sqlserver
DATABASE_URL="sqlserver://host:port;database=dbname;user=username;password=password;encrypt=true"
```

**Local SQL Server Example:**
```bash
DB_PROVIDER=sqlserver
DATABASE_URL="sqlserver://localhost:1433;database=iprubudgetx;user=sa;password=YourStrong!Pass;encrypt=true"
```

**Azure SQL Example:**
```bash
DB_PROVIDER=sqlserver
DATABASE_URL="sqlserver://yourserver.database.windows.net:1433;database=iprubudgetx;user=admin;password=Pass123!;encrypt=true"
```

**Setup Commands:**
```bash
# 1. Create database in SQL Server
sqlcmd -S localhost -U sa -P YourPassword
CREATE DATABASE iprubudgetx;
GO
EXIT

# 2. Update .env with SQL Server settings

# 3. Generate Prisma client
npx prisma generate

# 4. Create and apply migration
npx prisma migrate dev --name init_sqlserver

# 5. Verify
npx prisma studio
```

---

### 4️⃣ SQLite (Local Development)

**When to use:**
- Local development
- Testing without server setup
- Quick prototyping

**.env Configuration:**
```bash
DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
```

**Example:**
```bash
DB_PROVIDER=sqlite
DATABASE_URL="file:./iprubudgetx.db"
```

**Setup Commands:**
```bash
# 1. Update .env with SQLite settings

# 2. Generate Prisma client
npx prisma generate

# 3. Create and apply migration
npx prisma migrate dev --name init_sqlite

# 4. Database file created automatically at ./iprubudgetx.db

# 5. Verify
npx prisma studio
```

**Note:** SQLite creates the database file automatically. No server installation needed!

---

## 🔧 Complete Switching Example

### Scenario: Switch from PostgreSQL (Supabase) to MySQL

**Before (PostgreSQL):**
```bash
DB_PROVIDER=postgresql
DATABASE_URL="postgresql://postgres:pass@db.supabase.co:5432/postgres"
```

**After (MySQL):**
```bash
DB_PROVIDER=mysql
DATABASE_URL="mysql://root:password@localhost:3306/iprubudgetx"
```

**Steps:**
```bash
# 1. Stop your application
# (Press Ctrl+C if running)

# 2. Update .env file
# Change DB_PROVIDER and DATABASE_URL as shown above

# 3. Regenerate Prisma client
npx prisma generate

# 4. Apply schema to new database
npx prisma migrate dev --name switch_to_mysql

# 5. Start application
cd backend && python app.py    # Terminal 1
cd frontend && npm run dev      # Terminal 2

# Done! Application now uses MySQL
```

**Verification:**
```bash
# Open Prisma Studio to see your data
npx prisma studio

# Check backend health endpoint
curl http://localhost:5000/health
```

---

## 📊 Database Schema

All databases use the same schema (managed by Prisma):

### Models:
1. **User** - Authentication, roles, preferences (including theme)
2. **Department** - Organizational structure
3. **BudgetRequest** - CAPEX/OPEX requests
4. **ApprovalRecord** - Approval workflow tracking
5. **AuditLog** - Complete audit trail
6. **SystemConfig** - System-wide configuration

### Key Features:
- ✅ All relationships preserved
- ✅ Indexes optimized per database
- ✅ Data types adapted automatically
- ✅ Constraints maintained

---

## 🚨 Important Notes

### Data Migration Between Databases

When switching databases, **data is NOT automatically transferred**.

**To migrate data:**

1. **Export from current database:**
   ```bash
   # Using Prisma Studio
   npx prisma studio
   # Manually export data

   # OR using database-specific tools
   # PostgreSQL: pg_dump
   # MySQL: mysqldump
   # SQL Server: SSMS export
   ```

2. **Switch database** (follow steps above)

3. **Import to new database:**
   ```bash
   # Use database-specific import tools
   # Or recreate data manually
   ```

### Environment-Specific Settings

**Development:**
```bash
DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
```

**Staging:**
```bash
DB_PROVIDER=postgresql
DATABASE_URL="postgresql://user:pass@staging.db.com:5432/iprubudgetx_staging"
```

**Production:**
```bash
DB_PROVIDER=postgresql
DATABASE_URL="postgresql://user:pass@prod.db.com:5432/iprubudgetx_prod"
```

### Prisma Migrate vs Push

**Development (use migrate):**
```bash
npx prisma migrate dev --name <migration_name>
```
- Creates migration history
- Safe for production
- Tracks schema changes

**Prototyping (use push):**
```bash
npx prisma db push
```
- No migration files
- Quick iteration
- Don't use in production

---

## 🧪 Testing Database Switch

### Quick Test Script

```bash
#!/bin/bash

echo "Testing database switching..."

# Test PostgreSQL
echo "1. Testing PostgreSQL..."
export DB_PROVIDER=postgresql
export DATABASE_URL="postgresql://localhost:5432/test"
npx prisma generate
echo "✓ PostgreSQL works"

# Test MySQL
echo "2. Testing MySQL..."
export DB_PROVIDER=mysql
export DATABASE_URL="mysql://localhost:3306/test"
npx prisma generate
echo "✓ MySQL works"

# Test SQL Server
echo "3. Testing SQL Server..."
export DB_PROVIDER=sqlserver
export DATABASE_URL="sqlserver://localhost:1433;database=test"
npx prisma generate
echo "✓ SQL Server works"

# Test SQLite
echo "4. Testing SQLite..."
export DB_PROVIDER=sqlite
export DATABASE_URL="file:./test.db"
npx prisma generate
echo "✓ SQLite works"

echo "All database providers work correctly!"
```

---

## 📚 Additional Resources

### Prisma Documentation
- **Prisma Migrate:** https://www.prisma.io/docs/concepts/components/prisma-migrate
- **Database Connectors:** https://www.prisma.io/docs/concepts/database-connectors
- **Connection URLs:** https://www.prisma.io/docs/reference/database-reference/connection-urls

### Database-Specific Guides
- **PostgreSQL:** https://www.postgresql.org/docs/
- **MySQL:** https://dev.mysql.com/doc/
- **SQL Server:** https://docs.microsoft.com/en-us/sql/
- **SQLite:** https://www.sqlite.org/docs.html

### Supabase
- **Documentation:** https://supabase.com/docs
- **Connection Strings:** https://supabase.com/docs/guides/database/connecting-to-postgres

---

## ❓ Troubleshooting

### Error: "Provider not found"

**Solution:** Check `DB_PROVIDER` spelling in `.env`
```bash
# Correct values:
postgresql  (not postgres)
mysql       (not mariadb)
sqlserver   (not mssql)
sqlite      (not sqlite3)
```

### Error: "Connection failed"

**Solution:** Verify `DATABASE_URL` format matches provider
```bash
# Each database has specific URL format
# Check examples above for your database
```

### Error: "Migration failed"

**Solution:** Database may not exist
```bash
# Create database first, then run migration
# PostgreSQL: CREATE DATABASE iprubudgetx;
# MySQL: CREATE DATABASE iprubudgetx;
# SQL Server: CREATE DATABASE iprubudgetx;
```

### Error: "Schema drift detected"

**Solution:** Reset and reapply migrations
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

---

## ✅ Best Practices

1. **Use PostgreSQL for Production**
   - Best performance
   - Advanced features
   - Excellent Prisma support

2. **Use SQLite for Local Development**
   - No server setup needed
   - Fast iteration
   - Easy to reset

3. **Keep .env in .gitignore**
   - Never commit database credentials
   - Use .env.example as template

4. **Test After Switching**
   - Run `npx prisma studio` to verify
   - Check application health endpoint
   - Test key workflows

5. **Document Your Choice**
   - Note which database is used in each environment
   - Keep connection strings secure
   - Update deployment documentation

---

## 🎯 Summary

**Switching databases with IpruBudgetX is simple:**

1. Edit `.env` (2 lines: DB_PROVIDER + DATABASE_URL)
2. Run `npx prisma generate`
3. Run `npx prisma migrate dev`
4. Done! (Under 1 minute)

**No code changes required. Zero downtime possible with proper planning.**

---

**Version:** 1.0.0
**Last Updated:** January 2024
**Application:** IpruBudgetX - Budget Management System
