# Backend Setup Guide

Complete setup instructions for the Airtable Form Builder backend.

## Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas)
- Airtable account with developer access

## Step 1: Environment Setup

### Create .env file

```bash
cp .env.example .env
```

### Fill in your values

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/airtable-form-builder
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/airtable-form-builder?retryWrites=true&w=majority

# Airtable OAuth (get from https://airtable.com/developers)
AIRTABLE_CLIENT_ID=your_client_id_here
AIRTABLE_CLIENT_SECRET=your_client_secret_here
AIRTABLE_OAUTH_REDIRECT_URI=http://localhost:5000/api/auth/airtable/callback

# Server
PORT=5000
NODE_ENV=development
BACKEND_URL=http://localhost:5000

# Frontend URL
FRONTEND_URL=http://localhost:5173

# JWT Secret (generated or use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=8f3e9d2c1b4a7f6e5d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0

# Airtable Webhooks (optional - fill after creating webhook)
AIRTABLE_WEBHOOK_ID=achXXXXXXXXXXXXXX
AIRTABLE_WEBHOOK_MAC_SECRET=your_webhook_mac_secret_here
```

## Step 2: Airtable OAuth Configuration

### 1. Create a Personal App

1. Go to [Airtable Developer Dashboard](https://airtable.com/developers)
2. Click **Create new app**
3. Choose **Create custom app** → **Build custom app**
4. Give your app a name: "Form Builder"

### 2. Configure OAuth Settings

1. In your app settings, go to **OAuth** tab
2. Set **Scopes** to:

   - `data.records:read`
   - `data.records:write`
   - `webhook:manage`
   - `schema.bases:read`

3. Set **Redirect URL**:

   ```
   http://localhost:5000/api/auth/airtable/callback
   ```

4. Save and copy:
   - **Client ID** → `AIRTABLE_CLIENT_ID`
   - **Client Secret** → `AIRTABLE_CLIENT_SECRET`

### 3. Add to .env

```env
AIRTABLE_CLIENT_ID=your_client_id_here
AIRTABLE_CLIENT_SECRET=your_client_secret_here
AIRTABLE_OAUTH_REDIRECT_URI=http://localhost:5000/api/auth/airtable/callback
```

## Step 3: MongoDB Setup

### Option A: Local MongoDB

#### macOS (using Homebrew)

```bash
brew install mongodb-community
brew services start mongodb-community

# Test connection
mongosh
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

#### Windows

Download from [mongodb.com](https://www.mongodb.com/try/download/community)

### Option B: MongoDB Atlas (Cloud)

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Create a database user with username and password
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/airtable-form-builder?retryWrites=true&w=majority`
6. Add to .env:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/airtable-form-builder?retryWrites=true&w=majority
```

**Note:** Whitelist your IP address in MongoDB Atlas security settings

## Step 4: Install Dependencies

```bash
cd backend
npm install
```

## Step 5: Run the Server

### Development Mode (with hot reload)

```bash
npm run dev
```

Server will start at `http://localhost:5000`

### Production Mode

```bash
npm start
```

## Step 6: Verify Setup

### Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "OK",
  "timestamp": "2024-12-08T10:00:00.000Z"
}
```

### Test OAuth Flow

1. Get OAuth URL:

```bash
curl http://localhost:5000/api/auth/oauth-url
```

2. Open the returned URL in browser
3. Authorize the app
4. You should be redirected to `http://localhost:5173/auth/success?token=...`

## Step 7: Configure Webhooks (Optional but Recommended)

Webhooks allow real-time synchronization between Airtable and your database.

### For Local Development with ngrok:

1. Install ngrok:

```bash
brew install ngrok  # macOS
# Or download from https://ngrok.com
```

2. Start ngrok:

```bash
ngrok http 5000
```

3. Update .env:

```env
BACKEND_URL=https://your-ngrok-url.ngrok.io
```

4. Create webhook via API:

```bash
curl -X POST http://localhost:5000/api/webhooks/create \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"baseId": "appXXXXXX"}'
```

5. Copy the returned `AIRTABLE_WEBHOOK_MAC_SECRET` to .env:

```env
AIRTABLE_WEBHOOK_ID=achXXXXXXXX
AIRTABLE_WEBHOOK_MAC_SECRET=your_mac_secret_here
```

### For Production Deployment:

1. Deploy backend to Render/Railway (get your public URL)
2. Update `.env`:

```env
BACKEND_URL=https://your-production-domain.com
```

3. Create webhook via API using production backend URL

## Common Issues & Solutions

### MongoDB Connection Fails

**Error:** `MongooseError: Cannot connect to MongoDB`

**Solutions:**

- Ensure MongoDB is running: `brew services list` (macOS)
- Check connection string in .env
- For MongoDB Atlas, whitelist your IP
- Verify database exists

### OAuth Fails

**Error:** `Invalid client ID or secret`

**Solutions:**

- Verify credentials in Airtable Developer Dashboard
- Ensure redirect URI matches exactly
- Check that scopes are properly configured

### CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS`

**Solutions:**

- Verify `FRONTEND_URL` in .env matches your frontend domain
- For local dev: `FRONTEND_URL=http://localhost:5173`
- For production: `FRONTEND_URL=https://your-frontend-domain.com`

### Webhook Signature Verification Fails

**Error:** `Webhook signature verification failed`

**Solutions:**

- Verify `AIRTABLE_WEBHOOK_MAC_SECRET` is correct
- Ensure raw body is being sent to webhook endpoint
- In production, use `NODE_ENV=production` to enforce strict verification

## Testing with cURL

### Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <jwt_token>"
```

### Get Airtable Bases

```bash
curl -X GET http://localhost:5000/api/forms/airtable/bases \
  -H "Authorization: Bearer <jwt_token>"
```

### Create a Form

```bash
curl -X POST http://localhost:5000/api/forms \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Form",
    "description": "Test",
    "airtableBaseId": "appXXX",
    "airtableTableId": "tblXXX",
    "baseName": "Base",
    "tableName": "Table",
    "questions": []
  }'
```

### Submit Form Response

```bash
curl -X POST http://localhost:5000/api/forms/<formId>/submit \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }'
```

## Running Tests

```bash
npm test
```

This runs tests for the conditional logic evaluator.

## Next Steps

1. ✅ Backend setup complete
2. → Build React frontend (see frontend README)
3. → Deploy backend to Render/Railway
4. → Deploy frontend to Vercel/Netlify
5. → Configure webhooks in production

## Support

For issues or questions:

- Check API_DOCUMENTATION.md for endpoint details
- Review logs for error messages
- Verify all environment variables are set
- Check Airtable API status
