# Airtable Form Builder - MERN Stack

A full-stack application for creating dynamic forms connected to Airtable with OAuth authentication, conditional logic, and real-time webhook synchronization.

## 📋 Project Overview

Build custom forms from Airtable tables with support for:

- ✅ Airtable OAuth 2.0 authentication
- ✅ Dynamic form builder from Airtable fields
- ✅ Conditional visibility rules (AND/OR logic)
- ✅ Form submission to Airtable & MongoDB
- ✅ Real-time sync via Airtable webhooks
- ✅ Response management & viewing

## 🏗️ Project Structure

```
internproj/
├── backend/                    (Express + MongoDB)
│   ├── src/
│   │   ├── controllers/       (Business logic)
│   │   ├── models/            (MongoDB schemas)
│   │   ├── routes/            (API endpoints)
│   │   ├── middleware/        (Auth)
│   │   ├── utils/             (Helpers)
│   │   └── index.js           (Server)
│   ├── SETUP_GUIDE.md         (Setup instructions)
│   ├── API_DOCUMENTATION.md   (All endpoints)
│   ├── BACKEND_COMPLETE.md    (Summary)
│   └── package.json
│
└── frontend/                   (React + Vite)
    ├── src/
    │   ├── pages/             (Route pages)
    │   ├── components/        (UI components)
    │   ├── hooks/             (Custom hooks)
    │   ├── utils/             (Helpers)
    │   └── App.jsx            (Main app)
    └── package.json
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env and add:
# - AIRTABLE_CLIENT_ID
# - AIRTABLE_CLIENT_SECRET
# - MongoDB connection string
# - JWT secret (or generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Install dependencies
npm install

# Start development server
npm run dev

# Server runs at http://localhost:5000
```

See `backend/SETUP_GUIDE.md` for detailed setup instructions.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# App runs at http://localhost:5173
```

## 📚 Documentation

### Backend

- **[SETUP_GUIDE.md](./backend/SETUP_GUIDE.md)** - Complete setup instructions
- **[API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)** - All 22 API endpoints
- **[BACKEND_COMPLETE.md](./backend/BACKEND_COMPLETE.md)** - Backend summary
- **[README.md](./backend/README.md)** - Backend overview

### Frontend

- **[README.md](./frontend/README.md)** - Frontend setup & components
- **[FRONTEND_FEATURES.md](./frontend/FRONTEND_FEATURES.md)** - UI/UX details (coming soon)

## 🔑 Key Technologies

### Backend

- **Node.js + Express** - Server framework
- **MongoDB + Mongoose** - Database
- **Airtable API** - Form data source
- **JWT** - Authentication
- **Webhooks** - Real-time sync

### Frontend

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## 🔐 Authentication Flow

```
1. User clicks "Login with Airtable"
   ↓
2. Redirected to Airtable OAuth
   ↓
3. User authorizes app
   ↓
4. Airtable redirects to callback URL
   ↓
5. Backend exchanges code for tokens
   ↓
6. User created/updated in MongoDB
   ↓
7. Frontend receives JWT token
   ↓
8. Token stored in localStorage
   ↓
9. Token used for all subsequent requests
```

## 📋 API Overview

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

### Webhooks (5 endpoints)

```
POST /api/webhooks/airtable
GET  /api/webhooks/info
GET  /api/webhooks/:baseId/list
POST /api/webhooks/create
POST /api/webhooks/delete
```

See [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) for complete details.

## 🎯 Core Features

### 1. Airtable OAuth

- Secure login with Airtable
- Automatic token refresh
- User profile storage

### 2. Form Builder

- Select Airtable base & table
- Choose fields to include
- Configure field labels
- Mark fields as required/optional
- Set up conditional visibility rules

### 3. Conditional Logic

- Show/hide questions based on answers
- Support for AND/OR operators
- Support for equals/notEquals/contains
- Real-time evaluation

### 4. Form Viewer

- Display form with conditional logic
- Validate required fields
- Client-side validation

### 5. Form Submission

- Save to Airtable immediately
- Save to MongoDB for history
- Return submission ID
- Validation before submit

### 6. Response Management

- View all form responses
- Submitted timestamp tracking
- Status tracking
- Sync status with Airtable

### 7. Webhook Sync

- Listen for Airtable record changes
- Update MongoDB on changes
- Mark deleted records (soft delete)
- Bidirectional sync

## 📊 Data Model

### User

```javascript
{
  email: String,
  airtableUserId: String,
  name: String,
  profileImage: String,
  oauthTokens: ObjectId,
  loginTimestamp: Date
}
```

### Form

```javascript
{
  owner: ObjectId,
  airtableBaseId: String,
  airtableTableId: String,
  name: String,
  description: String,
  questions: [
    {
      questionKey: String,
      fieldId: String,
      label: String,
      type: String,
      required: Boolean,
      conditionalRules: Object
    }
  ],
  isPublished: Boolean
}
```

### Response

```javascript
{
  formId: ObjectId,
  airtableRecordId: String,
  answers: Object,
  submittedBy: ObjectId,
  status: String,
  deletedInAirtable: Boolean
}
```

## 🧪 Supported Field Types

- `singleLineText` - Text input
- `multilineText` - Textarea
- `singleSelect` - Dropdown
- `multipleSelect` - Checkboxes
- `attachment` - File upload

All other Airtable field types are filtered out automatically.

## 🚢 Deployment

### Backend

Deploy to **Render.com** or **Railway.app**:

1. Push to GitHub
2. Connect repository
3. Set environment variables
4. Deploy from dashboard

### Frontend

Deploy to **Vercel.com** or **Netlify.com**:

1. Push to GitHub
2. Connect repository
3. Build command: `npm run build`
4. Deploy

### Environment Variables

**Backend Production:**

```
NODE_ENV=production
MONGODB_URI=<production_mongodb>
AIRTABLE_CLIENT_ID=<your_id>
AIRTABLE_CLIENT_SECRET=<your_secret>
AIRTABLE_OAUTH_REDIRECT_URI=https://yourdomain.com/api/auth/airtable/callback
JWT_SECRET=<secure_random_secret>
FRONTEND_URL=https://yourfrontend.com
BACKEND_URL=https://yourbackend.com
```

**Frontend Production:**

```
VITE_API_BASE_URL=https://yourbackend.com/api
VITE_FRONTEND_URL=https://yourfrontend.com
```

## 🔄 Development Workflow

### Local Development

Terminal 1 (Backend):

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

Terminal 2 (Frontend):

```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Testing Webhooks Locally

Use ngrok to expose local server:

```bash
ngrok http 5000
```

Update .env:

```
BACKEND_URL=https://your-ngrok-url.ngrok.io
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

Tests for conditional logic evaluator included.

### Manual Testing

See `backend/SETUP_GUIDE.md` for cURL examples.

## 📝 Environment Setup Checklist

### Airtable Setup

- [ ] Create Airtable account
- [ ] Create personal developer app
- [ ] Configure OAuth scopes
- [ ] Get Client ID & Secret
- [ ] Create base & table with test data

### MongoDB Setup

- [ ] Install MongoDB locally OR
- [ ] Create MongoDB Atlas cluster
- [ ] Create database user
- [ ] Get connection string

### Backend Setup

- [ ] Copy .env.example to .env
- [ ] Fill in all environment variables
- [ ] Run npm install
- [ ] Start npm run dev
- [ ] Test health check

### Frontend Setup

- [ ] Copy .env.example to .env
- [ ] Fill in API base URL
- [ ] Run npm install
- [ ] Start npm run dev

## 🐛 Troubleshooting

### Backend Issues

See `backend/SETUP_GUIDE.md`

### Frontend Issues

See `frontend/README.md` (coming soon)

### Common Problems

**OAuth redirect mismatch:**

- Ensure AIRTABLE_OAUTH_REDIRECT_URI matches Airtable settings exactly

**MongoDB connection fails:**

- Verify MongoDB is running or connection string is correct
- For Atlas, whitelist your IP

**CORS errors:**

- Check FRONTEND_URL in backend .env
- Verify frontend is on correct port

**Webhooks not working:**

- Verify AIRTABLE_WEBHOOK_MAC_SECRET
- Check ngrok URL is updated
- Test webhook endpoint directly

## 📞 Support

For issues or questions:

1. Check relevant README in backend/ or frontend/
2. Review API_DOCUMENTATION.md
3. Check SETUP_GUIDE.md
4. Review error logs
5. Verify environment variables

## 📄 License

MIT

## 🎯 Next Steps

1. ✅ Backend complete
2. → Build React frontend
3. → Deploy to Render + Vercel
4. → Configure webhooks in production
5. → Write deployment guide

---

**Ready to build?** Start with the backend setup: `cd backend && npm install && npm run dev`
