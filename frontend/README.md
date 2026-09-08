# Scoping Matrix Frontend

Frontend application for **Scoping Matrix**, a multi-workspace CRM for managing companies, contacts, deals, activities, team members, and sales pipelines.

The frontend is built with **React, TypeScript, and Vite** and connects to the Scoping Matrix FastAPI backend.

---

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Native Fetch API
- CSS
- JWT authentication

---

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── activities/
│   │   │   ├── ActivityForm.tsx
│   │   │   └── ActivityTable.tsx
│   │   │
│   │   ├── companies/
│   │   │   ├── CompanyForm.tsx
│   │   │   └── CompanyTable.tsx
│   │   │
│   │   ├── contacts/
│   │   │   ├── ContactForm.tsx
│   │   │   └── ContactTable.tsx
│   │   │
│   │   ├── deals/
│   │   │   ├── DealForm.tsx
│   │   │   ├── DealHistory.tsx
│   │   │   ├── DealPipeline.tsx
│   │   │   └── DealTable.tsx
│   │   │
│   │   └── ui/
│   │       ├── Modal.tsx
│   │       └── Pagination.tsx
│   │
│   ├── hooks/
│   │   └── useWorkspaceMembers.ts
│   │
│   ├── layouts/
│   │   └── AppLayout.tsx
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   └── crm.ts
│   │
│   ├── pages/
│   │   ├── ActivitiesPage.tsx
│   │   ├── CompaniesPage.tsx
│   │   ├── CompanyDetailsPage.tsx
│   │   ├── ContactDetailsPage.tsx
│   │   ├── ContactsPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DealDetailsPage.tsx
│   │   ├── DealsPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MembersPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── types/
│   │   └── crm.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── .env
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Main Features

### Authentication

The application supports:

- User registration
- Login
- JWT authentication
- Logout
- Forgot password
- Password reset
- Current user session loading
- Protected application routes

The access token is stored locally and automatically attached to authenticated API requests.

---

## Workspaces

Scoping Matrix supports multiple CRM workspaces.

Users can:

- Belong to multiple workspaces
- Switch between workspaces
- View their workspace role
- Work only with records belonging to the active workspace

Supported roles:

```text
owner
admin
member
```

### Permissions

Owners and administrators can manage workspace members and record ownership.

Members are restricted to CRM records assigned to them according to backend access rules.

Tenant and permission enforcement remains the responsibility of the backend.

---

## Dashboard

The dashboard provides a live overview of the active workspace.

It includes:

- Company count
- Contact count
- Deal count
- Pipeline value
- Activity count
- Overdue activity count
- CRM overview chart
- Activity health
- Open deals
- Upcoming activities
- Direct links to relevant CRM records

---

## Companies

Users can:

- Create companies
- View companies
- Search companies
- Sort companies
- Edit companies
- Delete companies
- Open company details
- View related contacts
- View related deals
- View related activities

Company Details also provides quick actions for:

- Adding a contact
- Adding a deal
- Adding an activity

---

## Contacts

Users can:

- Create contacts
- Search contacts
- Filter contacts by company
- Sort contacts
- Edit contacts
- Delete contacts
- Open contact details
- View the related company
- View related deals
- View related activities

Contact Details provides quick actions for:

- Adding a deal
- Adding an activity

---

## Deals

Users can:

- Create deals
- Search deals
- Filter deals by stage
- Filter deals by company
- Sort deals
- Edit deals
- Delete deals
- View deal details
- View deal stage history
- Navigate to related companies and contacts

Supported deal stages:

```text
lead
qualified
proposal
negotiation
won
lost
```

---

## Deal Pipeline

Deals can be viewed using either:

- List view
- Pipeline view

The pipeline groups deals by stage:

```text
Lead
Qualified
Proposal
Negotiation
Won
Lost
```

Users can change a deal's stage directly from the pipeline.

Stage changes are sent to the backend using the existing deal update endpoint and are recorded in deal stage history.

---

## Activities

Supported activity types:

```text
call
email
meeting
task
note
```

Users can:

- Create activities
- Search activities
- Filter activities
- Sort activities
- Edit activities
- Delete activities
- Complete activities
- Reopen completed activities

Activities can be related to:

- Companies
- Contacts
- Deals

Related records are clickable directly from the Activities table.

---

## Shared Frontend Utilities

### `src/lib/api.ts`

Central API helper responsible for:

- API base URL
- JWT token handling
- Authorization headers
- JSON requests
- API error parsing
- FastAPI validation error handling
- Automatic token clearing on unauthorized responses

---

### `src/lib/crm.ts`

Contains shared CRM formatting and conversion helpers such as:

- Member names
- Contact names
- Currency formatting
- Date formatting
- Date/time formatting
- Form datetime conversion
- API datetime conversion
- Optional text normalization

---

### `src/types/crm.ts`

Contains shared TypeScript types for:

- Workspace members
- Companies
- Contacts
- Deals
- Deal stages
- Deal stage history
- Activities
- Activity types

---

## Environment Configuration

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://127.0.0.1:8000
```

The frontend will use this URL to communicate with the FastAPI backend.

---

## Installation

From the project root:

```powershell
cd C:\Users\Obadia\crm\frontend
```

Install dependencies:

```powershell
npm install
```

---

## Run Development Server

Start the frontend:

```powershell
npm run dev
```

Vite normally starts the application at:

```text
http://localhost:5173
```

---

## Backend Requirement

The FastAPI backend should also be running.

From:

```text
C:\Users\Obadia\crm\backend
```

start the backend using the project's normal FastAPI development command.

The API should be available at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Production Build

Run:

```powershell
npm run build
```

This performs:

```text
TypeScript compilation
        ↓
Vite production build
        ↓
frontend/dist/
```

A successful build confirms that the TypeScript application compiles correctly.

---

## Preview Production Build

After building:

```powershell
npm run preview
```

---

## Application Routes

### Public

```text
/
 /login
 /register
 /forgot-password
 /reset-password
```

### Protected

```text
/dashboard

/companies
/companies/:companyId

/contacts
/contacts/:contactId

/deals
/deals/:dealId

/activities

/members
/profile
/settings
```

---

## Cross-Record Navigation

CRM records are connected throughout the application.

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

This allows users to move between related CRM records without returning to the main lists.

---

## Development Principles

The frontend intentionally follows a simple architecture.

### Keep page files manageable

Large CRM forms and tables are separated into focused components.

### Avoid unnecessary abstractions

Do not introduce:

- Generic CRUD frameworks
- Repository layers
- Schema-driven form engines
- Unnecessary state libraries
- Duplicate utility functions

unless a clear project requirement justifies them.

### Reuse existing code

Before creating a new component or helper, check:

```text
src/components/
src/hooks/
src/lib/
src/types/
```

### Backend remains authoritative

The frontend must not be relied upon for workspace security or authorization.

The FastAPI backend remains responsible for:

- Authentication
- Tenant isolation
- Role permissions
- Record visibility
- Ownership validation

---

## Brand

Scoping Matrix uses the following primary brand colors:

```text
Red             #E73846
Medium Blue     #467C9E
Orange          #F26522
Dark Blue       #1C3557
Light Turquoise #A9D8DC
Tan             #EAE4DC
Light Blue      #C9D7E4
Grey            #909A9B
```

---

## Project

**Scoping Matrix**

CRM frontend built with React, TypeScript, and Vite.