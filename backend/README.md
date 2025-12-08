# Airtable Form Builder - Backend

A Node.js/Express backend for a dynamic form builder connected to Airtable with OAuth authentication, conditional logic, and webhook synchronization.

## Features

- **Airtable OAuth 2.0** - Secure authentication with Airtable
- **Dynamic Form Builder** - Create forms from Airtable tables and fields
- **Conditional Logic** - Show/hide questions based on user answers
- **Form Responses** - Save responses to both Airtable and MongoDB
- **Webhook Sync** - Real-time synchronization when Airtable data changes
- **Field Validation** - Validate responses against form schema

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Airtable API** - Form data source
- **JWT** - Authentication

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```
# MongoDB
MONGODB_URI=mongodb://localhost:27017/airtable-form-builder

# Airtable OAuth
AIRTABLE_CLIENT_ID=your_client_id
AIRTABLE_CLIENT_SECRET=your_client_secret
AIRTABLE_OAUTH_REDIRECT_URI=http://localhost:5000/api/auth/airtable/callback

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=your_jwt_secret_key

# Webhooks
AIRTABLE_WEBHOOK_TOKEN=your_webhook_token
```

### 3. Airtable OAuth Setup

1. Go to [Airtable Developer Dashboard](https://airtable.com/developers)
2. Create a new personal app
3. Configure OAuth settings:
   - Scopes: `data.records:read`, `data.records:write`, `webhook:manage`
   - Redirect URI: `http://localhost:5000/api/auth/airtable/callback`
4. Copy Client ID and Client Secret to `.env`

### 4. MongoDB Setup

Install MongoDB locally or use MongoDB Atlas:

```bash
# Local MongoDB
brew install mongodb-community
brew services start mongodb-community
```

Or use MongoDB Atlas connection string in `.env`.

### 5. Run the Server

**Development mode (with hot reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server will start on `http://localhost:5000`

## API Documentation

### Authentication

#### Get OAuth URL

```
GET /api/auth/oauth-url
```

Returns the Airtable OAuth login URL.

#### OAuth Callback

```
GET /api/auth/airtable/callback?code=<authorization_code>
```

Handles OAuth callback from Airtable. Redirects to frontend with JWT token.

#### Get Current User

```
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### Forms

#### Get Airtable Bases

```
GET /api/forms/airtable/bases
Authorization: Bearer <jwt_token>
```

Returns list of Airtable bases accessible by the user.

#### Get Tables in Base

```
GET /api/forms/airtable/bases/:baseId/tables
Authorization: Bearer <jwt_token>
```

#### Get Fields in Table

```
GET /api/forms/airtable/bases/:baseId/tables/:tableId/fields
Authorization: Bearer <jwt_token>
```

Returns only supported field types.

#### Create Form

```
POST /api/forms
Authorization: Bearer <jwt_token>

{
  "name": "Contact Form",
  "description": "...",
  "airtableBaseId": "appXXX",
  "airtableTableId": "tblXXX",
  "baseName": "...",
  "tableName": "...",
  "questions": [
    {
      "questionKey": "name",
      "fieldId": "fldXXX",
      "label": "Full Name",
      "type": "singleLineText",
      "required": true,
      "conditionalRules": null
    }
  ]
}
```

#### Get User's Forms

```
GET /api/forms
Authorization: Bearer <jwt_token>
```

#### Get Form by ID

```
GET /api/forms/:formId
```

#### Update Form

```
PUT /api/forms/:formId
Authorization: Bearer <jwt_token>
```

#### Delete Form

```
DELETE /api/forms/:formId
Authorization: Bearer <jwt_token>
```

### Form Responses

#### Submit Form Response

```
POST /api/forms/:formId/submit

{
  "answers": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

Creates a record in Airtable and saves response to MongoDB.

#### Get Form Responses

```
GET /api/forms/:formId/responses
```

Returns all responses for a form (from MongoDB only).

#### Get Response Details

```
GET /api/forms/:formId/responses/:responseId
```

#### Evaluate Conditional Logic

```
POST /api/forms/:formId/evaluate-logic

{
  "answersSoFar": {
    "role": "Engineer",
    "experience": "senior"
  }
}
```

Returns which questions should be visible.

## Data Models

### User

```javascript
{
  email: String,
  airtableUserId: String,
  name: String,
  profileImage: String,
  oauthTokens: ObjectId (ref: OAuthToken),
  loginTimestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### OAuthToken

```javascript
{
  userId: ObjectId (ref: User),
  accessToken: String,
  refreshToken: String,
  expiresAt: Date,
  tokenType: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Form

```javascript
{
  owner: ObjectId (ref: User),
  airtableBaseId: String,
  airtableTableId: String,
  baseName: String,
  tableName: String,
  name: String,
  description: String,
  questions: [
    {
      questionKey: String,
      fieldId: String,
      label: String,
      type: String, // singleLineText, multilineText, singleSelect, multipleSelect, attachment
      required: Boolean,
      conditionalRules: {
        logic: String, // AND or OR
        conditions: [
          {
            questionKey: String,
            operator: String, // equals, notEquals, contains
            value: Mixed
          }
        ]
      },
      selectOptions: [String]
    }
  ],
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Response

```javascript
{
  formId: ObjectId (ref: Form),
  airtableRecordId: String,
  answers: Object,
  submittedBy: ObjectId (ref: User),
  status: String, // draft, submitted, deleted
  deletedInAirtable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Conditional Logic

Questions can have visibility rules based on previous answers.

### Rule Structure

```javascript
{
  logic: "AND" | "OR",
  conditions: [
    {
      questionKey: "fieldName",
      operator: "equals" | "notEquals" | "contains",
      value: any
    }
  ]
}
```

### Example

Show GitHub URL field only if role is "Engineer":

```javascript
{
  logic: "AND",
  conditions: [
    {
      questionKey: "role",
      operator: "equals",
      value: "Engineer"
    }
  ]
}
```

## Webhook Synchronization

### Setup

1. The webhook endpoint is available at: `POST /api/webhooks/airtable`
2. Configure Airtable webhooks to point to your backend URL
3. Airtable will send events when records are created, updated, or deleted

### Events Handled

- **Record Created** - Logged (can be extended)
- **Record Updated** - Updates corresponding response in MongoDB
- **Record Deleted** - Marks response as deleted (soft delete)

## Testing

Run tests for conditional logic:

```bash
npm test
```

## Deployment

### Render

1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables in Render dashboard
4. Deploy

### Railway

1. Connect GitHub repository
2. Configure environment variables
3. Deploy from dashboard

### Environment Variables for Production

Ensure these are set in your deployment platform:

- `MONGODB_URI` - Production MongoDB connection
- `AIRTABLE_CLIENT_ID` - OAuth client ID
- `AIRTABLE_CLIENT_SECRET` - OAuth client secret
- `AIRTABLE_OAUTH_REDIRECT_URI` - Updated for production domain
- `JWT_SECRET` - Secure random secret
- `FRONTEND_URL` - Production frontend URL
- `NODE_ENV=production`

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running locally or connection string is correct
- Check firewall rules for MongoDB Atlas

### Airtable OAuth Fails

- Verify CLIENT_ID and CLIENT_SECRET
- Check redirect URI matches in Airtable and `.env`
- Ensure scopes are correct

### CORS Issues

- Check `FRONTEND_URL` matches your frontend domain
- Verify CORS middleware configuration

## License

MIT
