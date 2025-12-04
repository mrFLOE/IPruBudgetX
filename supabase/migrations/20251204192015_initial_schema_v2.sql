/*
  # IPruBudEx Initial Database Schema
  
  This migration creates the complete database schema for IPruBudEx, a CAPEX/OPEX budget request and approval management system.

  ## New Tables
  
  ### `users`
  - `id` (text, primary key): Unique user identifier
  - `name` (text): User's full name
  - `email` (text, unique): User's email address
  - `password_hash` (text): Hashed password for authentication
  - `role` (text): User role (SUPER_ADMIN, REQUESTOR, TECH_LEAD, DEPT_HEAD, FINANCE_ADMIN, FPNA, PRINCIPAL_FINANCE, CFO)
  - `department_id` (text, nullable, foreign key): Reference to department
  - `is_locked` (boolean, default false): Account lock status after failed login attempts
  - `failed_attempts` (integer, default 0): Count of failed login attempts
  - `created_at` (timestamptz): Account creation timestamp
  - `updated_at` (timestamptz): Last update timestamp
  
  ### `departments`
  - `id` (text, primary key): Unique department identifier
  - `name` (text, unique): Department name
  - `created_at` (timestamptz): Creation timestamp
  
  ### `budget_requests`
  - `id` (text, primary key): Unique request identifier
  - `type` (text): Budget type (CAPEX or OPEX)
  - `amount` (numeric): Requested budget amount
  - `category` (text): Budget category
  - `justification` (text): Detailed justification for the request
  - `department_id` (text, foreign key): Reference to department
  - `requester_id` (text, foreign key): Reference to user who created the request
  - `status` (text, default 'DRAFT'): Request status (DRAFT, PENDING, APPROVED, REWORK, REJECTED, FINAL_APPROVED)
  - `created_at` (timestamptz): Request creation timestamp
  - `updated_at` (timestamptz): Last update timestamp
  
  ### `approval_records`
  - `id` (text, primary key): Unique approval record identifier
  - `request_id` (text, foreign key): Reference to budget request
  - `approver_id` (text, foreign key): Reference to user who approved/rejected
  - `role` (text): Role of the approver at time of approval
  - `decision` (text): Approval decision (APPROVED, REJECTED, REWORK)
  - `comments` (text, nullable): Approver's comments
  - `timestamp` (timestamptz): Timestamp of the approval action
  
  ### `audit_logs`
  - `id` (text, primary key): Unique audit log identifier
  - `user_id` (text, foreign key): Reference to user who performed the action
  - `action` (text): Description of the action
  - `metadata` (jsonb, nullable): Additional metadata about the action
  - `timestamp` (timestamptz): Timestamp of the action
  
  ### `system_config`
  - `key` (text, primary key): Configuration key
  - `value` (text): Configuration value
  - `updated_at` (timestamptz): Last update timestamp

  ## Security
  
  - Enable RLS on all tables
  - Add policies for role-based access control
  - Users can only access data based on their role and department
  - Audit logs are read-only for non-admin users
  - System config is only accessible to SUPER_ADMIN
*/

-- Create departments table first (no dependencies)
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  department_id TEXT REFERENCES departments(id),
  is_locked BOOLEAN DEFAULT false,
  failed_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create budget_requests table
CREATE TABLE IF NOT EXISTS budget_requests (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  justification TEXT NOT NULL,
  department_id TEXT NOT NULL REFERENCES departments(id),
  requester_id TEXT NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create approval_records table
CREATE TABLE IF NOT EXISTS approval_records (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES budget_requests(id) ON DELETE CASCADE,
  approver_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  decision TEXT NOT NULL,
  comments TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Create system_config table
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_budget_requests_status ON budget_requests(status);
CREATE INDEX IF NOT EXISTS idx_budget_requests_requester ON budget_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_budget_requests_department ON budget_requests(department_id);
CREATE INDEX IF NOT EXISTS idx_approval_records_request ON approval_records(request_id);
CREATE INDEX IF NOT EXISTS idx_approval_records_approver ON approval_records(approver_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile and admins can view all" ON users;
  CREATE POLICY "Users can view own profile and admins can view all" 
    ON users FOR SELECT 
    USING (
      id = current_setting('app.current_user_id', true)::text 
      OR current_setting('app.current_user_role', true) = 'SUPER_ADMIN'
    );
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can insert users" ON users;
  CREATE POLICY "Admins can insert users" 
    ON users FOR INSERT 
    WITH CHECK (current_setting('app.current_user_role', true) = 'SUPER_ADMIN');
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own profile, admins can update all" ON users;
  CREATE POLICY "Users can update own profile, admins can update all" 
    ON users FOR UPDATE 
    USING (
      id = current_setting('app.current_user_id', true)::text 
      OR current_setting('app.current_user_role', true) = 'SUPER_ADMIN'
    )
    WITH CHECK (
      id = current_setting('app.current_user_id', true)::text 
      OR current_setting('app.current_user_role', true) = 'SUPER_ADMIN'
    );
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "All authenticated users can view departments" ON departments;
  CREATE POLICY "All authenticated users can view departments" 
    ON departments FOR SELECT 
    USING (true);
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can manage departments" ON departments;
  CREATE POLICY "Admins can manage departments" 
    ON departments FOR ALL 
    USING (current_setting('app.current_user_role', true) = 'SUPER_ADMIN')
    WITH CHECK (current_setting('app.current_user_role', true) = 'SUPER_ADMIN');
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own requests and related approvers" ON budget_requests;
  CREATE POLICY "Users can view own requests and related approvers" 
    ON budget_requests FOR SELECT 
    USING (
      requester_id = current_setting('app.current_user_id', true)::text 
      OR current_setting('app.current_user_role', true) IN ('SUPER_ADMIN', 'TECH_LEAD', 'DEPT_HEAD', 'FINANCE_ADMIN', 'FPNA', 'PRINCIPAL_FINANCE', 'CFO')
    );
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Requestors can create budget requests" ON budget_requests;
  CREATE POLICY "Requestors can create budget requests" 
    ON budget_requests FOR INSERT 
    WITH CHECK (
      requester_id = current_setting('app.current_user_id', true)::text 
      AND current_setting('app.current_user_role', true) IN ('REQUESTOR', 'SUPER_ADMIN')
    );
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Requestors can update own draft requests" ON budget_requests;
  CREATE POLICY "Requestors can update own draft requests" 
    ON budget_requests FOR UPDATE 
    USING (
      requester_id = current_setting('app.current_user_id', true)::text 
      AND status IN ('DRAFT', 'REWORK')
    )
    WITH CHECK (
      requester_id = current_setting('app.current_user_id', true)::text 
      AND status IN ('DRAFT', 'REWORK')
    );
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view approval records for their requests" ON approval_records;
  CREATE POLICY "Users can view approval records for their requests" 
    ON approval_records FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM budget_requests 
        WHERE budget_requests.id = approval_records.request_id 
        AND budget_requests.requester_id = current_setting('app.current_user_id', true)::text
      )
      OR approver_id = current_setting('app.current_user_id', true)::text
      OR current_setting('app.current_user_role', true) = 'SUPER_ADMIN'
    );
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Approvers can create approval records" ON approval_records;
  CREATE POLICY "Approvers can create approval records" 
    ON approval_records FOR INSERT 
    WITH CHECK (
      approver_id = current_setting('app.current_user_id', true)::text 
      AND current_setting('app.current_user_role', true) IN ('TECH_LEAD', 'DEPT_HEAD', 'FINANCE_ADMIN', 'FPNA', 'PRINCIPAL_FINANCE', 'CFO', 'SUPER_ADMIN')
    );
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own audit logs, admins view all" ON audit_logs;
  CREATE POLICY "Users can view own audit logs, admins view all" 
    ON audit_logs FOR SELECT 
    USING (
      user_id = current_setting('app.current_user_id', true)::text 
      OR current_setting('app.current_user_role', true) = 'SUPER_ADMIN'
    );
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
  CREATE POLICY "System can insert audit logs" 
    ON audit_logs FOR INSERT 
    WITH CHECK (true);
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Only admins can access system config" ON system_config;
  CREATE POLICY "Only admins can access system config" 
    ON system_config FOR ALL 
    USING (current_setting('app.current_user_role', true) = 'SUPER_ADMIN')
    WITH CHECK (current_setting('app.current_user_role', true) = 'SUPER_ADMIN');
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Insert default system configuration
INSERT INTO system_config (key, value) VALUES
  ('max_login_attempts', '3'),
  ('approval_hierarchy', '["TECH_LEAD","DEPT_HEAD","FINANCE_ADMIN","FPNA","PRINCIPAL_FINANCE","CFO"]')
ON CONFLICT (key) DO NOTHING;