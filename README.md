# Scoping Matrix

**Scoping Matrix** is a multi-workspace Customer Relationship Management (CRM) application built with FastAPI, React, TypeScript, PostgreSQL, and SQLAlchemy.

It provides a structured workspace for managing companies, contacts, sales opportunities, activities, team members, ownership, and deal pipelines.

## Tech Stack

### Backend

- Python 3.13
- FastAPI
- SQLAlchemy 2.x
- PostgreSQL
- Psycopg 3
- Alembic
- JWT authentication
- Pydantic

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- CSS
- Fetch API

### Infrastructure

- PostgreSQL 18
- Docker Compose
- Git
- GitHub

---

## Project Structure

```text
scoping-matrix/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── modules/
│   │   │   ├── crm/
│   │   │   └── identity/
│   │   └── shared/
│   ├── migrations/
│   ├── tests/
│   ├── alembic.ini
│   └── pyproject.toml
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── types/
│   └── package.json
│
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Features

### Authentication

- User registration
- Login
- JWT authentication
- Protected routes
- Logout
- Forgot password
- Password reset
- Authenticated user profile

### Multi-Workspace CRM

Users can belong to multiple CRM workspaces and switch between them.

Workspace roles include:

```text
owner
admin
member
```

Backend authorization enforces workspace isolation, ownership, and role permissions.

### Companies

- Create companies
- Search and sort companies
- Edit and delete companies
- Company detail pages
- Related contacts
- Related deals
- Related activities

### Contacts

- Create contacts
- Search and filter contacts
- Edit and delete contacts
- Contact detail pages
- Related company
- Related deals
- Related activities

### Deals

- Create and manage opportunities
- Deal stages
- Deal filtering and sorting
- Deal details
- Deal stage history
- Pipeline view
- Direct stage changes

Supported stages:

```text
Lead
Qualified
Proposal
Negotiation
Won
Lost
```

### Activities

Supported activity types:

```text
Call
Email
Meeting
Task
Note
```

Activities can be related to companies, contacts, and deals.

Users can also:

- Complete activities
- Reopen activities
- Edit activities
- Delete activities
- Navigate directly to related CRM records

### Dashboard

The workspace dashboard includes:

- Company count
- Contact count
- Deal count
- Pipeline value
- Activity count
- Overdue activities
- CRM overview
- Activity health
- Open pipeline
- Upcoming activities

---

## Record Relationships

```text
Company
├── Contacts
├── Deals
└── Activities

Contact
├── Company
├── Deals
└── Activities

Deal
├── Company
├── Contact
├── Stage History
└── Activities

Activity
├── Company
├── Contact
└── Deal
```

---

## Local Development

Clone the repository:

```bash
git clone https://github.com/YanoObed/scoping-matrix.git
cd scoping-matrix
```

### Start PostgreSQL

```bash
docker compose up -d
```

The development PostgreSQL container exposes the database on:

```text
localhost:55432
```

---

## Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the project dependencies according to `pyproject.toml`.

Create:

```text
backend/.env
```

using:

```text
backend/.env.example
```

as the template.

Run database migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env
```

using:

```text
frontend/.env.example
```

The development configuration should contain:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the application:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Production Build

To verify the frontend production build:

```bash
cd frontend
npm run build
```

The generated production files are placed in:

```text
frontend/dist/
```

The `dist` directory is intentionally excluded from Git.

---

## Environment Security

Real environment files are not committed.

The repository ignores:

```text
.env
backend/.env
frontend/.env
backend/.venv/
frontend/node_modules/
frontend/dist/
__pycache__/
```

Only safe example environment files should be committed.

Never commit:

- Database credentials
- JWT secret keys
- SMTP passwords
- Gmail app passwords
- API keys
- Access tokens

---

## Architecture

Scoping Matrix uses a monorepo:

```text
backend/   FastAPI application
frontend/  React application
```

The backend follows a modular monolith structure with separate CRM and identity modules.

The frontend uses focused reusable components without unnecessary abstraction.

---

## Repository

**Scoping Matrix**

GitHub: `YanoObed/scoping-matrix`

---

## Status

Scoping Matrix is currently under active development.