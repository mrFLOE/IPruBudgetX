# IPruBudEx API Documentation

Complete REST API reference for the IPruBudEx backend system.

**Base URL**: `http://localhost:5000` (development)
**Production**: `https://iprubudex-backend.onrender.com`

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens expire after 8 hours (480 minutes) by default.

---

## API Endpoints

### Health & Status

#### GET /health

Check API and database health.

**Response:**
```json
{
  "status": "healthy",
  "service": "IPruBudEx API",
  "database": "connected",
  "version": "1.0.0"
}
```

#### GET /

Get API information.

**Response:**
```json
{
  "service": "IPruBudEx API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/health",
    "auth": "/auth/*",
    "users": "/admin/users/*",
    "requests": "/requests/*",
    "approvals": "/approvals/*",
    "admin": "/admin/*"
  }
}
```

---

## Authentication Endpoints

### POST /auth/login

Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "REQUESTOR",
    "department_id": "dept-001"
  }
}
```

**Errors:**
- 401: Invalid credentials
- 401: Account locked

### POST /auth/unlock

Unlock a locked user account (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "user_id": "user-123"
}
```

**Response:**
```json
{
  "message": "User account unlocked successfully"
}
```

### GET /auth/me

Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "user-123",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "REQUESTOR",
  "department_id": "dept-001",
  "is_locked": false
}
```

---

## User Management Endpoints

### GET /admin/users

Get all users (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "user-123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "REQUESTOR",
    "department_id": "dept-001",
    "is_locked": false,
    "failed_attempts": 0,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### POST /admin/users

Create a new user (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "role": "TECH_LEAD",
  "department_id": "dept-001"
}
```

**Response:**
```json
{
  "id": "user-124",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "TECH_LEAD",
  "department_id": "dept-001",
  "is_locked": false,
  "created_at": "2024-01-15T11:00:00Z"
}
```

### GET /admin/users/:user_id

Get specific user details (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "user-123",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "REQUESTOR",
  "department_id": "dept-001",
  "is_locked": false,
  "failed_attempts": 0,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### PATCH /admin/users/:user_id

Update user details (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "John Updated",
  "role": "TECH_LEAD",
  "department_id": "dept-002"
}
```

### PATCH /admin/users/:user_id/lock

Lock a user account (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "User locked successfully"
}
```

### PATCH /admin/users/:user_id/unlock

Unlock a user account (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "User unlocked successfully"
}
```

### DELETE /admin/users/:user_id

Delete a user (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## Budget Request Endpoints

### POST /requests

Create a new budget request.

**Headers:** `Authorization: Bearer <token>`
**Roles:** REQUESTOR, SUPER_ADMIN

**Request:**
```json
{
  "type": "CAPEX",
  "amount": 50000.00,
  "category": "IT Equipment",
  "justification": "Need new servers for production environment",
  "department_id": "dept-001"
}
```

**Response:**
```json
{
  "id": "req-001",
  "type": "CAPEX",
  "amount": 50000.00,
  "category": "IT Equipment",
  "justification": "Need new servers for production environment",
  "department_id": "dept-001",
  "requester_id": "user-123",
  "status": "DRAFT",
  "created_at": "2024-01-15T12:00:00Z"
}
```

### GET /requests

Get budget requests.

**Headers:** `Authorization: Bearer <token>`

**Behavior:**
- SUPER_ADMIN: Returns all requests
- REQUESTOR: Returns only own requests
- Other roles: Returns all requests (for approval purposes)

**Response:**
```json
[
  {
    "id": "req-001",
    "type": "CAPEX",
    "amount": 50000.00,
    "category": "IT Equipment",
    "justification": "Need new servers",
    "department_id": "dept-001",
    "department_name": "Information Technology",
    "requester_id": "user-123",
    "requester_name": "John Doe",
    "requester_email": "john@example.com",
    "status": "PENDING",
    "created_at": "2024-01-15T12:00:00Z",
    "updated_at": "2024-01-15T12:30:00Z"
  }
]
```

### GET /requests/:request_id

Get specific request details.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "req-001",
  "type": "CAPEX",
  "amount": 50000.00,
  "category": "IT Equipment",
  "justification": "Need new servers",
  "department_id": "dept-001",
  "department_name": "Information Technology",
  "requester_id": "user-123",
  "requester_name": "John Doe",
  "requester_email": "john@example.com",
  "status": "PENDING",
  "created_at": "2024-01-15T12:00:00Z",
  "updated_at": "2024-01-15T12:30:00Z"
}
```

### PATCH /requests/:request_id

Update a budget request (only DRAFT or REWORK status).

**Headers:** `Authorization: Bearer <token>`
**Roles:** REQUESTOR (own requests), SUPER_ADMIN

**Request:**
```json
{
  "amount": 55000.00,
  "justification": "Updated justification with more details"
}
```

### POST /requests/:request_id/submit

Submit a request for approval.

**Headers:** `Authorization: Bearer <token>`
**Roles:** REQUESTOR (own requests), SUPER_ADMIN

**Response:**
```json
{
  "id": "req-001",
  "status": "PENDING",
  "message": "Request submitted for approval"
}
```

### DELETE /requests/:request_id

Delete a draft request.

**Headers:** `Authorization: Bearer <token>`
**Roles:** REQUESTOR (own requests), SUPER_ADMIN

**Response:**
```json
{
  "message": "Request deleted successfully"
}
```

### POST /requests/import/excel

Import budget data from Excel file using Gemini AI.

**Headers:** `Authorization: Bearer <token>`
**Roles:** REQUESTOR, SUPER_ADMIN

**Request:** `multipart/form-data`
- file: Excel file (.xlsx or .xls)

**Response:**
```json
{
  "items": [
    {
      "category": "IT Equipment",
      "amount": 50000,
      "description": "Servers and networking",
      "type": "CAPEX"
    }
  ],
  "total": 50000,
  "summary": "Budget request for IT infrastructure upgrade"
}
```

### GET /requests/:request_id/suggestions

Get AI-generated rationalization suggestions.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "suggestions": [
    "Emphasize ROI and cost savings over 3-year period",
    "Highlight business continuity and disaster recovery benefits",
    "Compare with industry standards and competitor capabilities"
  ]
}
```

---

## Approval Endpoints

### GET /approvals/pending

Get pending approvals for current user's role.

**Headers:** `Authorization: Bearer <token>`
**Roles:** TECH_LEAD, DEPT_HEAD, FINANCE_ADMIN, FPNA, PRINCIPAL_FINANCE, CFO

**Response:**
```json
[
  {
    "id": "req-001",
    "type": "CAPEX",
    "amount": 50000.00,
    "category": "IT Equipment",
    "requester_name": "John Doe",
    "department_name": "Information Technology",
    "status": "PENDING",
    "created_at": "2024-01-15T12:00:00Z"
  }
]
```

### GET /timeline/:request_id

Get approval timeline for a request.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "request": {
    "id": "req-001",
    "type": "CAPEX",
    "amount": 50000.00,
    "status": "PENDING"
  },
  "timeline": [
    {
      "id": "approval-001",
      "request_id": "req-001",
      "approver_id": "user-200",
      "approver_name": "Tech Lead",
      "approver_email": "techlead@example.com",
      "role": "TECH_LEAD",
      "decision": "APPROVED",
      "comments": "Approved - necessary upgrade",
      "timestamp": "2024-01-15T13:00:00Z"
    }
  ]
}
```

### POST /requests/:request_id/approve

Approve a request.

**Headers:** `Authorization: Bearer <token>`
**Roles:** TECH_LEAD, DEPT_HEAD, FINANCE_ADMIN, FPNA, PRINCIPAL_FINANCE, CFO

**Request:**
```json
{
  "comments": "Approved - meets requirements"
}
```

**Response:**
```json
{
  "message": "Request approved and forwarded to next approver",
  "next_role": "DEPT_HEAD",
  "status": "PENDING"
}
```

Or if final approval:
```json
{
  "message": "Request has been fully approved",
  "status": "FINAL_APPROVED"
}
```

### POST /requests/:request_id/reject

Reject a request.

**Headers:** `Authorization: Bearer <token>`
**Roles:** TECH_LEAD, DEPT_HEAD, FINANCE_ADMIN, FPNA, PRINCIPAL_FINANCE, CFO

**Request:**
```json
{
  "comments": "Budget not available for this quarter"
}
```

**Response:**
```json
{
  "message": "Request has been rejected",
  "status": "REJECTED"
}
```

### POST /requests/:request_id/rework

Send request back for rework.

**Headers:** `Authorization: Bearer <token>`
**Roles:** TECH_LEAD, DEPT_HEAD, FINANCE_ADMIN, FPNA, PRINCIPAL_FINANCE, CFO

**Request:**
```json
{
  "comments": "Please provide more detailed justification and cost breakdown"
}
```

**Response:**
```json
{
  "message": "Request sent back for rework",
  "status": "REWORK"
}
```

---

## Admin Endpoints

### GET /admin/departments

Get all departments.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "dept-001",
    "name": "Information Technology",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /admin/departments

Create a new department (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Human Resources"
}
```

### PATCH /admin/departments/:dept_id

Update department (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "IT Department"
}
```

### DELETE /admin/departments/:dept_id

Delete department (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

### GET /admin/hierarchy

Get approval hierarchy (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "hierarchy": [
    "TECH_LEAD",
    "DEPT_HEAD",
    "FINANCE_ADMIN",
    "FPNA",
    "PRINCIPAL_FINANCE",
    "CFO"
  ]
}
```

### PATCH /admin/hierarchy

Update approval hierarchy (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "hierarchy": [
    "TECH_LEAD",
    "DEPT_HEAD",
    "CFO"
  ]
}
```

### GET /admin/audit-logs

Get all audit logs (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit`: Number of records (default: 100)

**Response:**
```json
[
  {
    "id": "log-001",
    "user_id": "user-123",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "action": "REQUEST_CREATED",
    "metadata": {
      "request_id": "req-001",
      "type": "CAPEX",
      "amount": 50000
    },
    "timestamp": "2024-01-15T12:00:00Z"
  }
]
```

### GET /admin/audit-logs/:user_id

Get audit logs for specific user (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit`: Number of records (default: 100)

### GET /admin/stats

Get system statistics (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "total_users": 45,
  "total_departments": 5,
  "total_requests": 230,
  "pending_requests": 12,
  "approved_requests": 198,
  "rejected_requests": 20
}
```

---

## User Roles

| Role | Code | Permissions |
|------|------|-------------|
| Super Admin | SUPER_ADMIN | Full system access, user management, configuration |
| Requestor | REQUESTOR | Create and manage budget requests |
| Tech Lead | TECH_LEAD | First-level approval |
| Department Head | DEPT_HEAD | Second-level approval |
| Finance Admin | FINANCE_ADMIN | Third-level approval |
| FP&A | FPNA | Fourth-level approval |
| Principal Finance | PRINCIPAL_FINANCE | Fifth-level approval |
| CFO | CFO | Final approval |

---

## Budget Request Status Flow

```
DRAFT → PENDING → APPROVED → ... → FINAL_APPROVED
        ↓
      REWORK (back to requester)
        ↓
      REJECTED (closed)
```

**Status Codes:**
- `DRAFT`: Initial creation, can be edited
- `PENDING`: Submitted for approval
- `APPROVED`: Approved by one level, forwarded to next
- `REWORK`: Sent back to requester for changes
- `REJECTED`: Rejected and closed
- `FINAL_APPROVED`: Approved by all levels (CFO)

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

---

## Rate Limiting

No rate limiting is currently enforced in development.

Production deployments on Render include DDoS protection and automatic rate limiting.

---

## Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Create Request Example
```bash
curl -X POST http://localhost:5000/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type":"CAPEX",
    "amount":50000,
    "category":"IT Equipment",
    "justification":"New servers needed",
    "department_id":"dept-001"
  }'
```

### Approve Request Example
```bash
curl -X POST http://localhost:5000/requests/req-001/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"comments":"Approved"}'
```
