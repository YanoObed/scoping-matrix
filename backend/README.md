# CRM Backend

Backend API for the CRM application.

Built with:

- FastAPI
- Python 3.13
- SQLAlchemy 2.x
- PostgreSQL 18
- Psycopg 3
- Alembic migrations
- Pydantic
- JWT authentication

The backend follows a modular monolith architecture.

---

# Project Structure

```
backend/
│
├── app/
│   ├── api/
│   │   └── health.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   │
│   ├── modules/
│   │   ├── identity/
│   │   │   ├── models/
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   │   ├── router.py
│   │   │   └── dependencies.py
│   │   │
│   │   └── crm/
│   │       ├── models/
│   │       ├── schemas.py
│   │       ├── service.py
│   │       └── router.py
│   │
│   └── main.py
│
├── migrations/
│
├── .env
├── alembic.ini
├── requirements.txt
└── README.md
```

---

# Requirements

Install:

- Python 3.13+
- Docker Desktop
- PostgreSQL 18 (running through Docker)

---

# Setup

## 1. Navigate to backend

```powershell
cd C:\Users\Obadia\crm\backend
```

---

## 2. Create virtual environment

```powershell
python -m venv .venv
```

---

## 3. Activate virtual environment

PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

---

## 4. Install dependencies

```powershell
pip install -r requirements.txt
```

---

# Environment Configuration

Create:

```
backend/.env
```

Example:

```env
DATABASE_URL=postgresql+psycopg://username:password@localhost:55432/database_name

JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

# Database

PostgreSQL runs through Docker.

Configured host port:

```
55432
```

Container port:

```
5432
```

---

# Database Migrations

## Check migration status

```powershell
alembic current
```

## Create migration

```powershell
alembic revision --autogenerate -m "migration message"
```

## Apply migrations

```powershell
alembic upgrade head
```

## Verify schema matches models

```powershell
alembic check
```

Expected:

```
No new upgrade operations detected.
```

---

# Running the Backend

From:

```
C:\Users\Obadia\crm\backend
```

Activate the environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

Start FastAPI:

```powershell
uvicorn app.main:app --reload
```

Alternative:

```powershell
python -m uvicorn app.main:app --reload
```

---

# API URLs

Root:

```
http://127.0.0.1:8000/
```

Swagger documentation:

```
http://127.0.0.1:8000/docs
```

OpenAPI schema:

```
http://127.0.0.1:8000/openapi.json
```

---

# Authentication

The API uses JWT Bearer authentication.

Flow:

1. Register user

```
POST /auth/register
```

2. Login

```
POST /auth/login
```

3. Use returned access token:

```
Authorization: Bearer <token>
```

---

# Workspace Security

The CRM uses workspace-based tenant isolation.

Rules:

- Users must belong to a workspace.
- Every CRM record belongs to a workspace.
- Requests must verify workspace membership.
- Workspace IDs are never trusted from user input alone.
- Database constraints protect cross-workspace relationships.

---

# Current Modules

## Identity

Completed:

- User registration
- Workspace creation
- Workspace membership
- Roles:
  - owner
  - admin
  - member
- Password hashing
- JWT authentication
- Current user dependency
- Workspace authorization

---

## CRM

Completed:

### Companies

- Create company
- List companies
- Get company
- Update company
- Delete company

### Contacts

- Create contact
- List contacts
- Get contact
- Update contact
- Delete contact

Features:

- Workspace ownership
- Company/contact relationships
- Duplicate email protection
- Tenant-safe queries

---

# Development Rules

Maintain:

- Modular monolith architecture
- SQLAlchemy 2.x style
- Existing database foundation
- UUID primary keys
- Shared timestamps
- Workspace tenant boundaries

Avoid:

- Duplicate database layers
- Unnecessary abstractions
- Breaking module separation
- Trusting client-provided workspace ownership

---

# Testing

Manual API testing can be performed through:

```
http://127.0.0.1:8000/docs
```

Before major releases:

```powershell
alembic check
```

should return:

```
No new upgrade operations detected.
```

---

# Stopping the Server

Press:

```
CTRL + C
```
