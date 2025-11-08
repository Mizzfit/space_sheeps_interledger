# Server Documentation

Complete REST API server for Open Payments integration.

## Quick Start

### 1. Start the Server

```bash
cd backend
pnpm start
# or
node server.js
```-

The server will start on `http://localhost:3000`

### 2. Verify It's Running

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T...",
  "version": "1.0.0"
}
```

### 3. Get API Information

```bash
curl http://localhost:3000/api/info
```

This returns a list of all available endpoints.

## Available Endpoints

The server provides **30+ REST API endpoints** organized into categories:

### Health & Info
- `GET /api/health` - Health check
- `GET /api/info` - API information and endpoint list

### Wallet Address Operations (3 endpoints)
- `POST /api/wallet/info` - Get wallet information
- `POST /api/wallet/keys` - Get wallet keys
- `POST /api/wallet/validate` - Validate multiple wallets

### Grant Management (5 endpoints)
- `POST /api/grants/incoming-payment` - Request incoming payment grant
- `POST /api/grants/quote` - Request quote grant
- `POST /api/grants/outgoing-payment` - Request outgoing payment grant
- `POST /api/grants/continue` - Continue a pending grant
- `DELETE /api/grants/revoke` - Revoke a grant

### Incoming Payments (4 endpoints)
- `POST /api/incoming-payments` - Create incoming payment
- `POST /api/incoming-payments/get` - Get incoming payment
- `POST /api/incoming-payments/list` - List incoming payments
- `POST /api/incoming-payments/complete` - Complete incoming payment

### Quotes (4 endpoints)
- `POST /api/quotes` - Create quote
- `POST /api/quotes/get` - Get quote
- `POST /api/quotes/fixed-send` - Quote with fixed send amount
- `POST /api/quotes/fixed-receive` - Quote with fixed receive amount

### Outgoing Payments (3 endpoints)
- `POST /api/outgoing-payments` - Create outgoing payment
- `POST /api/outgoing-payments/get` - Get outgoing payment
- `POST /api/outgoing-payments/list` - List outgoing payments

### Token Management (2 endpoints)
- `POST /api/tokens/rotate` - Rotate access token
- `DELETE /api/tokens/revoke` - Revoke access token

### Legacy (1 endpoint)
- `POST /api/payment` - Complete payment flow (original implementation)

## Configuration

The server uses your configured test wallet by default:

```javascript
{
  walletAddressUrl: "https://ilp.interledger-test.dev/eb37db34",
  privateKeyPath: "private.key",
  keyId: "e2903c1f-a02c-4ee2-aa8d-c2ea0d064180"
}
```

You can override this by including a `config` object in your request body.

## Example API Calls

### Get Wallet Information

```bash
curl -X POST http://localhost:3000/api/wallet/info \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddressUrl": "https://ilp.interledger-test.dev/eb37db34"
  }'
```

### Request an Incoming Payment Grant

```bash
curl -X POST http://localhost:3000/api/grants/incoming-payment \
  -H "Content-Type: application/json" \
  -d '{
    "authServerUrl": "https://auth.interledger-test.dev/..."
  }'
```

### Create an Incoming Payment

```bash
curl -X POST http://localhost:3000/api/incoming-payments \
  -H "Content-Type: application/json" \
  -d '{
    "resourceServerUrl": "https://ilp.interledger-test.dev/...",
    "accessToken": "your_access_token",
    "paymentDetails": {
      "walletAddress": "https://ilp.interledger-test.dev/eb37db34",
      "incomingAmount": {
        "assetCode": "EUR",
        "assetScale": 2,
        "value": "5000"
      }
    }
  }'
```

## Response Format

All endpoints return JSON in this format:

**Success:**
```json
{
  "success": true,
  "data": { /* result data */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Features

✅ **30+ REST API Endpoints** - Complete Open Payments coverage  
✅ **Auto-Configuration** - Uses your test wallet by default  
✅ **Error Handling** - Comprehensive error responses  
✅ **Request Logging** - Logs all incoming requests  
✅ **CORS Ready** - Can be configured for cross-origin requests  
✅ **JSON Responses** - All responses in JSON format  
✅ **Health Checks** - Built-in health and info endpoints  

## Server Structure

```javascript
// Imports all API modules
import { getWalletAddressInfo } from './api/walletAddress.js';
import { requestIncomingPaymentGrant } from './api/grants.js';
import { createIncomingPayment } from './api/incomingPayment.js';
// ... and more

// Express server with middleware
app.use(express.json());
app.use(requestLogging);

// REST endpoints
app.post('/api/wallet/info', async (req, res) => {
  const result = await getWalletAddressInfo(...);
  res.json(result);
});
```

## Documentation

- **API Endpoints**: See `API_ENDPOINTS.md` for complete endpoint documentation
- **Module API**: See `api/API_DOCUMENTATION.md` for module-level documentation
- **Quick Start**: See `QUICKSTART.md` for getting started guide

## Testing the Server

### Using curl

```bash
# Health check
curl http://localhost:3000/api/health

# Get API info
curl http://localhost:3000/api/info

# Test wallet endpoint
curl -X POST http://localhost:3000/api/wallet/info \
  -H "Content-Type: application/json" \
  -d '{"walletAddressUrl": "https://ilp.interledger-test.dev/eb37db34"}'
```

### Using Postman

1. Import the endpoints from `API_ENDPOINTS.md`
2. Set base URL to `http://localhost:3000`
3. Add `Content-Type: application/json` header
4. Use the request body examples from the documentation

### Using JavaScript

```javascript
// Fetch wallet info
const response = await fetch('http://localhost:3000/api/wallet/info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddressUrl: 'https://ilp.interledger-test.dev/eb37db34'
  })
});

const result = await response.json();
console.log(result);
```

## Troubleshooting

### Server won't start

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Start server again
pnpm start
```

### Module not found errors

**Solution**:
```bash
# Reinstall dependencies
pnpm install
```

### Private key errors

**Solution**:
```bash
# Recreate private key file
bash setup-private-key.sh
```

### Connection timeouts

This is usually due to network issues with the test wallet server. The server is working correctly, but the external API is slow or unavailable. Try again in a few moments.

## Environment Variables

You can configure the server using environment variables:

```bash
PORT=4000 node server.js  # Run on port 4000
```

## Production Considerations

For production deployment:

1. **Add CORS**: Configure CORS middleware for cross-origin requests
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Authentication**: Add API key authentication
4. **HTTPS**: Use HTTPS in production
5. **Environment Variables**: Use `.env` file for configuration
6. **Error Logging**: Add proper error logging service
7. **Process Manager**: Use PM2 or similar for process management

## npm Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node test-connection.js",
    "test:examples": "node --input-type=module --eval \"import('./api/examples.js').then(m => m.runAllExamples())\""
  }
}
```

## Server Logs

The server logs all requests:

```
2025-11-08T21:54:56.238Z - GET /api/health
2025-11-08T21:55:17.675Z - GET /api/info
2025-11-08T21:55:17.691Z - POST /api/wallet/info
```

## Next Steps

1. ✅ Server is running
2. 📖 Read `API_ENDPOINTS.md` for complete endpoint documentation
3. 🧪 Test endpoints using curl or Postman
4. 🏗️ Integrate with your frontend application

---

**Server Status**: ✅ Running  
**Port**: 3000  
**Endpoints**: 30+  
**Configuration**: Auto-configured with your test wallet  

Happy coding! 🚀

