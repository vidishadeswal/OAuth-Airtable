# Airtable Form Builder - MERN Stack

A full-stack application for creating dynamic forms connected to Airtable with OAuth authentication, conditional logic, and real-time webhook synchronization.

## Where to Start

### Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env


# Install dependencies
npm install

# Starting development server
npm run dev


```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev


```

## Authentication Flow

```
1. User clicks "Login with Airtable"

2. Redirected to Airtable OAuth

3. User authorizes app

4. Airtable redirects to callback URL

5. Backend exchanges code for tokens

6. User created/updated in MongoDB

7. Frontend receives JWT token

8. Token stored in localStorage

9. Token used for all subsequent requests
```

## API Overview

### Authentication (4 endpoints)

```
GET  /api/auth/oauth-url
GET  /api/auth/airtable/callback
GET  /api/auth/me
POST /api/auth/logout
```

### Forms (9 endpoints)

```
GET  /api/forms/airtable/bases
GET  /api/forms/airtable/bases/:baseId/tables
GET  /api/forms/airtable/bases/:baseId/tables/:tableId/fields
POST /api/forms
GET  /api/forms
GET  /api/forms/:formId
PUT  /api/forms/:formId
DELETE /api/forms/:formId
POST /api/forms/:formId/evaluate-logic
```

### Responses (4 endpoints)

```
POST /api/forms/:formId/submit
GET  /api/forms/:formId/responses
GET  /api/forms/:formId/responses/:responseId
```
