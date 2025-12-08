# API Documentation

Complete REST API endpoints for Airtable Form Builder backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication

#### 1. Get OAuth Login URL

```
GET /auth/oauth-url
```

Returns the Airtable OAuth login URL.

**Response:**

```json
{
  "oauthUrl": "https://airtable.com/oauth2/v1/authorize?..."
}
```

#### 2. OAuth Callback

```
GET /auth/airtable/callback?code=<auth_code>
```

Airtable redirects here after user authorizes. Redirects to frontend with JWT token.

**Redirect to:**

```
{FRONTEND_URL}/auth/success?token=<jwt_token>
```

#### 3. Get Current User

```
GET /auth/me
Authorization: Bearer <jwt_token>
```

Returns the authenticated user's profile.

**Response:**

```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "airtableUserId": "airtable_user_id",
  "name": "User Name",
  "profileImage": "...",
  "loginTimestamp": "2024-12-08T10:00:00Z",
  "createdAt": "2024-12-08T10:00:00Z",
  "updatedAt": "2024-12-08T10:00:00Z"
}
```

#### 4. Logout

```
POST /auth/logout
Authorization: Bearer <jwt_token>
```

Logs out the user (token should be deleted on frontend).

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

---

### Forms

#### 5. Get Airtable Bases

```
GET /forms/airtable/bases
Authorization: Bearer <jwt_token>
```

Returns all Airtable bases accessible by the user.

**Response:**

```json
{
  "bases": [
    {
      "id": "appXXX",
      "name": "Base Name",
      "permissionLevel": "owner"
    }
  ]
}
```

#### 6. Get Tables in Base

```
GET /forms/airtable/bases/:baseId/tables
Authorization: Bearer <jwt_token>
```

Returns all tables in an Airtable base.

**Response:**

```json
{
  "tables": [
    {
      "id": "tblXXX",
      "name": "Table Name",
      "primaryFieldId": "fldXXX"
    }
  ]
}
```

#### 7. Get Fields in Table

```
GET /forms/airtable/bases/:baseId/tables/:tableId/fields
Authorization: Bearer <jwt_token>
```

Returns only supported field types (singleLineText, multilineText, singleSelect, multipleSelect, attachment).

**Response:**

```json
{
  "fields": [
    {
      "id": "fldXXX",
      "name": "Field Name",
      "type": "singleLineText"
    },
    {
      "id": "fldYYY",
      "name": "Status",
      "type": "singleSelect",
      "options": {
        "choices": [
          { "id": "selX", "name": "Active" },
          { "id": "selY", "name": "Inactive" }
        ]
      }
    }
  ]
}
```

#### 8. Create Form

```
POST /forms
Authorization: Bearer <jwt_token>

{
  "name": "Contact Form",
  "description": "Contact form for website",
  "airtableBaseId": "appXXX",
  "airtableTableId": "tblXXX",
  "baseName": "Base Name",
  "tableName": "Table Name",
  "questions": [
    {
      "questionKey": "name",
      "fieldId": "fldXXX",
      "label": "Full Name",
      "type": "singleLineText",
      "required": true,
      "conditionalRules": null
    },
    {
      "questionKey": "email",
      "fieldId": "fldYYY",
      "label": "Email",
      "type": "singleLineText",
      "required": true,
      "conditionalRules": null
    },
    {
      "questionKey": "role",
      "fieldId": "fldZZZ",
      "label": "Role",
      "type": "singleSelect",
      "required": true,
      "selectOptions": ["Engineer", "Designer", "Manager"],
      "conditionalRules": null
    },
    {
      "questionKey": "githubUrl",
      "fieldId": "fldAAA",
      "label": "GitHub URL",
      "type": "singleLineText",
      "required": false,
      "conditionalRules": {
        "logic": "AND",
        "conditions": [
          {
            "questionKey": "role",
            "operator": "equals",
            "value": "Engineer"
          }
        ]
      }
    }
  ]
}
```

**Response:**

```json
{
  "_id": "formId",
  "owner": "userId",
  "airtableBaseId": "appXXX",
  "airtableTableId": "tblXXX",
  "baseName": "Base Name",
  "tableName": "Table Name",
  "name": "Contact Form",
  "description": "Contact form for website",
  "questions": [...],
  "isPublished": false,
  "createdAt": "2024-12-08T10:00:00Z",
  "updatedAt": "2024-12-08T10:00:00Z"
}
```

#### 9. Get User's Forms

```
GET /forms
Authorization: Bearer <jwt_token>
```

Returns all forms created by the authenticated user.

**Response:**

```json
{
  "forms": [
    {
      "_id": "formId",
      "name": "Contact Form",
      "description": "...",
      "airtableBaseId": "appXXX",
      "airtableTableId": "tblXXX",
      "createdAt": "2024-12-08T10:00:00Z",
      "updatedAt": "2024-12-08T10:00:00Z"
    }
  ]
}
```

#### 10. Get Form by ID

```
GET /forms/:formId
```

Returns a specific form (no authentication required for public forms).

**Response:**

```json
{
  "_id": "formId",
  "owner": "userId",
  "airtableBaseId": "appXXX",
  "airtableTableId": "tblXXX",
  "baseName": "Base Name",
  "tableName": "Table Name",
  "name": "Contact Form",
  "description": "...",
  "questions": [...],
  "isPublished": true,
  "createdAt": "2024-12-08T10:00:00Z",
  "updatedAt": "2024-12-08T10:00:00Z"
}
```

#### 11. Update Form

```
PUT /forms/:formId
Authorization: Bearer <jwt_token>

{
  "name": "Updated Name",
  "description": "Updated description",
  "questions": [...],
  "isPublished": true
}
```

**Response:** Updated form object

#### 12. Delete Form

```
DELETE /forms/:formId
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "message": "Form deleted successfully"
}
```

---

### Form Responses

#### 13. Submit Form Response

```
POST /forms/:formId/submit

{
  "answers": {
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Engineer",
    "githubUrl": "https://github.com/johndoe"
  }
}
```

Saves response to both Airtable and MongoDB.

**Response:**

```json
{
  "message": "Response submitted successfully",
  "responseId": "responseId",
  "airtableRecordId": "recXXX"
}
```

#### 14. Get Form Responses

```
GET /forms/:formId/responses
```

Returns all responses for a form from MongoDB (not deleted).

**Response:**

```json
{
  "responses": [
    {
      "_id": "responseId",
      "answers": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-12-08T10:00:00Z",
      "status": "submitted",
      "airtableRecordId": "recXXX"
    }
  ]
}
```

#### 15. Get Response Details

```
GET /forms/:formId/responses/:responseId
```

Returns a specific response.

**Response:**

```json
{
  "_id": "responseId",
  "formId": "formId",
  "airtableRecordId": "recXXX",
  "answers": {...},
  "submittedBy": null,
  "status": "submitted",
  "deletedInAirtable": false,
  "createdAt": "2024-12-08T10:00:00Z",
  "updatedAt": "2024-12-08T10:00:00Z"
}
```

#### 16. Evaluate Conditional Logic

```
POST /forms/:formId/evaluate-logic

{
  "answersSoFar": {
    "role": "Engineer",
    "experience": "senior"
  }
}
```

Returns which questions should be visible based on current answers.

**Response:**

```json
{
  "visibleQuestionKeys": ["name", "email", "role", "githubUrl"]
}
```

---

### Webhooks

#### 17. Get Webhook Info

```
GET /webhooks/info
Authorization: Bearer <jwt_token>
```

Returns webhook configuration information.

**Response:**

```json
{
  "webhookUrl": "http://localhost:5000/api/webhooks/airtable",
  "webhookId": "achXXX",
  "configured": true
}
```

#### 18. List Webhooks for Base

```
GET /webhooks/:baseId/list
Authorization: Bearer <jwt_token>
```

Returns all webhooks registered for a base.

**Response:**

```json
{
  "webhooks": [
    {
      "id": "achXXX",
      "name": "Form Builder Webhook",
      "cursorForNextPayload": 0
    }
  ]
}
```

#### 19. Create Webhook

```
POST /webhooks/create
Authorization: Bearer <jwt_token>

{
  "baseId": "appXXX"
}
```

Creates a new webhook for the specified base.

**Response:**

```json
{
  "message": "Webhook created successfully",
  "webhookId": "achXXX",
  "webhookUrl": "http://localhost:5000/api/webhooks/airtable",
  "instructions": [
    "Save these values in your .env file:",
    "AIRTABLE_WEBHOOK_ID=achXXX",
    "AIRTABLE_WEBHOOK_MAC_SECRET=..."
  ]
}
```

#### 20. Delete Webhook

```
POST /webhooks/delete
Authorization: Bearer <jwt_token>

{
  "baseId": "appXXX",
  "webhookId": "achXXX"
}
```

**Response:**

```json
{
  "message": "Webhook deleted successfully"
}
```

#### 21. Handle Airtable Webhook

```
POST /webhooks/airtable
Headers:
  X-Airtable-Content-MAC: <mac_signature>
  X-Airtable-Webhook-ID: <webhook_id>

{
  "timestamp": 1234567890,
  "actionMetadata": {
    "sourceMetadata": {
      "user": { "id": "usrXXX" }
    },
    "baseId": "appXXX",
    "tableId": "tblXXX"
  },
  "createdRecordsById": {...},
  "changedRecordsById": {...},
  "destroyedRecordIds": [...]
}
```

This endpoint receives webhook events from Airtable and updates the database accordingly.

**Events handled:**

- **Record Created** - Logged for future processing
- **Record Updated** - Updates corresponding response in MongoDB
- **Record Deleted** - Marks response as deleted (soft delete)

**Response:**

```json
{
  "success": true
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Description of what went wrong"
}
```

### 401 Unauthorized

```json
{
  "error": "Access token required" | "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "error": "Not authorized to perform this action"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "Detailed error message (development only)"
}
```

---

## Conditional Logic Rules

### Supported Operators

- **equals** - Exact match
- **notEquals** - Not equal to value
- **contains** - Value is contained in array or string

### Logic Operators

- **AND** - All conditions must be true
- **OR** - At least one condition must be true

### Example Rules

Show field only if role is Engineer:

```javascript
{
  "logic": "AND",
  "conditions": [
    {
      "questionKey": "role",
      "operator": "equals",
      "value": "Engineer"
    }
  ]
}
```

Show field if role is Engineer OR Manager:

```javascript
{
  "logic": "OR",
  "conditions": [
    {
      "questionKey": "role",
      "operator": "equals",
      "value": "Engineer"
    },
    {
      "questionKey": "role",
      "operator": "equals",
      "value": "Manager"
    }
  ]
}
```

Show field if experience is not junior AND department contains "tech":

```javascript
{
  "logic": "AND",
  "conditions": [
    {
      "questionKey": "experience",
      "operator": "notEquals",
      "value": "junior"
    },
    {
      "questionKey": "department",
      "operator": "contains",
      "value": "tech"
    }
  ]
}
```

---

## Supported Field Types

Only these Airtable field types are supported in forms:

- `singleLineText` - Single line text input
- `multilineText` - Multi-line text input
- `singleSelect` - Dropdown selection
- `multipleSelect` - Multiple checkbox selection
- `attachment` - File upload

All other Airtable field types are automatically filtered out.

---

## Development Notes

### Testing OAuth Flow

1. Get OAuth URL: `GET /api/auth/oauth-url`
2. Open the returned URL in browser
3. Authorize the app
4. Airtable redirects to callback
5. Frontend receives JWT token
6. Use token in subsequent requests

### Testing Webhooks Locally

Use ngrok to expose your local server:

```bash
ngrok http 5000
```

Then update `.env`:

```
BACKEND_URL=https://your-ngrok-url.ngrok.io
AIRTABLE_WEBHOOK_MAC_SECRET=<your-webhook-secret>
```

### Rate Limiting

No rate limiting is currently implemented. Consider adding rate limiting middleware for production.

### CORS

CORS is enabled for the frontend URL specified in `FRONTEND_URL` environment variable.
