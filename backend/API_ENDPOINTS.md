# REST API Endpoints Documentation

Complete REST API documentation for the Space Sheeps Interledger server.

## Base URL

```
http://localhost:3000
```

## Default Configuration

The server uses your configured test wallet by default. You can override this by including a `config` object in the request body.

```json
{
  "walletAddressUrl": "https://ilp.interledger-test.dev/eb37db34",
  "privateKeyPath": "private.key",
  "keyId": "e2903c1f-a02c-4ee2-aa8d-c2ea0d064180"
}
```

---

## Health & Info Endpoints

### GET /api/health
Check server health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T15:30:00.000Z",
  "version": "1.0.0"
}
```

**curl Example:**
```bash
curl http://localhost:3000/api/health
```

### GET /api/info
Get API information and available endpoints.

**Response:**
```json
{
  "name": "Space Sheeps Interledger API",
  "version": "1.0.0",
  "description": "Open Payments API Integration",
  "defaultWallet": "https://ilp.interledger-test.dev/eb37db34",
  "endpoints": { /* ... */ }
}
```

**curl Example:**
```bash
curl http://localhost:3000/api/info
```

---

## Wallet Address Endpoints

### POST /api/wallet/info
Get wallet address information.

**Request Body:**
```json
{
  "walletAddressUrl": "https://ilp.interledger-test.dev/eb37db34"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "https://ilp.interledger-test.dev/eb37db34",
    "publicName": "23a8fa78",
    "assetCode": "EUR",
    "assetScale": 2,
    "authServer": "https://auth.interledger-test.dev/...",
    "resourceServer": "https://ilp.interledger-test.dev/..."
  }
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/wallet/info \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddressUrl": "https://ilp.interledger-test.dev/eb37db34"
  }'
```

### POST /api/wallet/keys
Get public keys bound to a wallet address.

**Request Body:**
```json
{
  "walletAddressUrl": "https://ilp.interledger-test.dev/eb37db34"
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/wallet/keys \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddressUrl": "https://ilp.interledger-test.dev/eb37db34"
  }'
```

### POST /api/wallet/validate
Validate multiple wallet addresses.

**Request Body:**
```json
{
  "walletAddresses": [
    "https://ilp.interledger-test.dev/eb37db34",
    "https://ilp.interledger-test.dev/user2test"
  ]
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/wallet/validate \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddresses": [
      "https://ilp.interledger-test.dev/eb37db34",
      "https://ilp.interledger-test.dev/user2test"
    ]
  }'
```

---

## Grant Management Endpoints

### POST /api/grants/incoming-payment
Request an incoming payment grant.

**Request Body:**
```json
{
  "authServerUrl": "https://auth.interledger-test.dev/..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": {
      "value": "token_value",
      "manage": "https://...",
      "expires_in": 3600
    }
  },
  "isFinalized": true
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/grants/incoming-payment \
  -H "Content-Type: application/json" \
  -d '{
    "authServerUrl": "https://auth.interledger-test.dev/..."
  }'
```

### POST /api/grants/quote
Request a quote grant.

**Request Body:**
```json
{
  "authServerUrl": "https://auth.interledger-test.dev/..."
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/grants/quote \
  -H "Content-Type: application/json" \
  -d '{
    "authServerUrl": "https://auth.interledger-test.dev/..."
  }'
```

### POST /api/grants/outgoing-payment
Request an outgoing payment grant.

**Request Body:**
```json
{
  "authServerUrl": "https://auth.interledger-test.dev/...",
  "walletAddressId": "https://ilp.interledger-test.dev/eb37db34",
  "debitAmount": {
    "assetCode": "EUR",
    "assetScale": 2,
    "value": "1000"
  },
  "requireInteraction": true
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/grants/outgoing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "authServerUrl": "https://auth.interledger-test.dev/...",
    "walletAddressId": "https://ilp.interledger-test.dev/eb37db34",
    "debitAmount": {
      "assetCode": "EUR",
      "assetScale": 2,
      "value": "1000"
    }
  }'
```

### POST /api/grants/continue
Continue a pending grant.

**Request Body:**
```json
{
  "continueUri": "https://auth.interledger-test.dev/.../continue",
  "continueAccessToken": "continue_token_value"
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/grants/continue \
  -H "Content-Type: application/json" \
  -d '{
    "continueUri": "https://...",
    "continueAccessToken": "token"
  }'
```

### DELETE /api/grants/revoke
Revoke a grant.

**Request Body:**
```json
{
  "grantUrl": "https://auth.interledger-test.dev/.../grant",
  "accessToken": "access_token_value"
}
```

**curl Example:**
```bash
curl -X DELETE http://localhost:3000/api/grants/revoke \
  -H "Content-Type: application/json" \
  -d '{
    "grantUrl": "https://...",
    "accessToken": "token"
  }'
```

---

## Incoming Payment Endpoints

### POST /api/incoming-payments
Create an incoming payment.

**Request Body:**
```json
{
  "resourceServerUrl": "https://ilp.interledger-test.dev/...",
  "accessToken": "access_token_value",
  "paymentDetails": {
    "walletAddress": "https://ilp.interledger-test.dev/eb37db34",
    "incomingAmount": {
      "assetCode": "EUR",
      "assetScale": 2,
      "value": "5000"
    },
    "description": "Payment for services",
    "externalRef": "ORDER-12345"
  }
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/incoming-payments \
  -H "Content-Type: application/json" \
  -d '{
    "resourceServerUrl": "https://ilp.interledger-test.dev/...",
    "accessToken": "token",
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

### POST /api/incoming-payments/get
Get an incoming payment.

**Request Body:**
```json
{
  "incomingPaymentUrl": "https://ilp.interledger-test.dev/.../incoming-payments/...",
  "accessToken": "access_token_value"
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/incoming-payments/get \
  -H "Content-Type: application/json" \
  -d '{
    "incomingPaymentUrl": "https://...",
    "accessToken": "token"
  }'
```

### POST /api/incoming-payments/list
List incoming payments.

**Request Body:**
```json
{
  "walletAddressUrl": "https://ilp.interledger-test.dev/eb37db34",
  "accessToken": "access_token_value",
  "pagination": {
    "first": 10
  }
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/incoming-payments/list \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddressUrl": "https://ilp.interledger-test.dev/eb37db34",
    "accessToken": "token",
    "pagination": { "first": 10 }
  }'
```

### POST /api/incoming-payments/complete
Complete an incoming payment.

**Request Body:**
```json
{
  "incomingPaymentUrl": "https://ilp.interledger-test.dev/.../incoming-payments/...",
  "accessToken": "access_token_value"
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/incoming-payments/complete \
  -H "Content-Type: application/json" \
  -d '{
    "incomingPaymentUrl": "https://...",
    "accessToken": "token"
  }'
```

---

## Quote Endpoints

### POST /api/quotes
Create a quote.

**Request Body:**
```json
{
  "resourceServerUrl": "https://ilp.interledger-test.dev/...",
  "accessToken": "access_token_value",
  "quoteDetails": {
    "walletAddress": "https://ilp.interledger-test.dev/eb37db34",
    "receiver": "https://ilp.interledger-test.dev/.../incoming-payments/...",
    "method": "ilp"
  }
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "resourceServerUrl": "https://ilp.interledger-test.dev/...",
    "accessToken": "token",
    "quoteDetails": {
      "walletAddress": "https://ilp.interledger-test.dev/eb37db34",
      "receiver": "https://...",
      "method": "ilp"
    }
  }'
```

### POST /api/quotes/get
Get a quote.

**Request Body:**
```json
{
  "quoteUrl": "https://ilp.interledger-test.dev/.../quotes/...",
  "accessToken": "access_token_value"
}
```

### POST /api/quotes/fixed-send
Create a quote with fixed send amount.

**Request Body:**
```json
{
  "resourceServerUrl": "https://ilp.interledger-test.dev/...",
  "accessToken": "access_token_value",
  "walletAddress": "https://ilp.interledger-test.dev/eb37db34",
  "receiver": "https://ilp.interledger-test.dev/.../incoming-payments/...",
  "debitAmount": {
    "assetCode": "EUR",
    "assetScale": 2,
    "value": "5500"
  }
}
```

### POST /api/quotes/fixed-receive
Create a quote with fixed receive amount.

**Request Body:**
```json
{
  "resourceServerUrl": "https://ilp.interledger-test.dev/...",
  "accessToken": "access_token_value",
  "walletAddress": "https://ilp.interledger-test.dev/eb37db34",
  "receiver": "https://ilp.interledger-test.dev/.../incoming-payments/...",
  "receiveAmount": {
    "assetCode": "EUR",
    "assetScale": 2,
    "value": "5000"
  }
}
```

---

## Outgoing Payment Endpoints

### POST /api/outgoing-payments
Create an outgoing payment.

**Request Body:**
```json
{
  "resourceServerUrl": "https://ilp.interledger-test.dev/...",
  "accessToken": "access_token_value",
  "paymentDetails": {
    "walletAddress": "https://ilp.interledger-test.dev/eb37db34",
    "quoteId": "https://ilp.interledger-test.dev/.../quotes/...",
    "metadata": {
      "description": "Payment for Order #12345"
    }
  }
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/outgoing-payments \
  -H "Content-Type: application/json" \
  -d '{
    "resourceServerUrl": "https://ilp.interledger-test.dev/...",
    "accessToken": "token",
    "paymentDetails": {
      "walletAddress": "https://ilp.interledger-test.dev/eb37db34",
      "quoteId": "https://..."
    }
  }'
```

### POST /api/outgoing-payments/get
Get an outgoing payment.

**Request Body:**
```json
{
  "outgoingPaymentUrl": "https://ilp.interledger-test.dev/.../outgoing-payments/...",
  "accessToken": "access_token_value"
}
```

### POST /api/outgoing-payments/list
List outgoing payments.

**Request Body:**
```json
{
  "walletAddressUrl": "https://ilp.interledger-test.dev/eb37db34",
  "accessToken": "access_token_value",
  "pagination": {
    "first": 20
  }
}
```

---

## Token Management Endpoints

### POST /api/tokens/rotate
Rotate an access token.

**Request Body:**
```json
{
  "tokenManagementUrl": "https://auth.interledger-test.dev/.../token",
  "currentAccessToken": "current_token_value"
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/tokens/rotate \
  -H "Content-Type: application/json" \
  -d '{
    "tokenManagementUrl": "https://...",
    "currentAccessToken": "token"
  }'
```

### DELETE /api/tokens/revoke
Revoke an access token.

**Request Body:**
```json
{
  "tokenManagementUrl": "https://auth.interledger-test.dev/.../token",
  "accessToken": "access_token_value"
}
```

**curl Example:**
```bash
curl -X DELETE http://localhost:3000/api/tokens/revoke \
  -H "Content-Type: application/json" \
  -d '{
    "tokenManagementUrl": "https://...",
    "accessToken": "token"
  }'
```

---

## Legacy Endpoint

### POST /api/payment
Initiate a complete payment flow (original implementation).

**Request Body:**
```json
{
  "amount": "5000",
  "user": "https://ilp.interledger-test.dev/user2test"
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "5000",
    "user": "https://ilp.interledger-test.dev/user2test"
  }'
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK` - Successful request
- `400 Bad Request` - Missing or invalid parameters
- `404 Not Found` - Endpoint not found
- `500 Internal Server Error` - Server error

---

## Testing the API

### 1. Start the Server

```bash
cd backend
pnpm start
# or
node server.js
```

### 2. Test Health Endpoint

```bash
curl http://localhost:3000/api/health
```

### 3. Get Your Wallet Info

```bash
curl -X POST http://localhost:3000/api/wallet/info \
  -H "Content-Type: application/json" \
  -d '{"walletAddressUrl": "https://ilp.interledger-test.dev/eb37db34"}'
```

### 4. Use Postman or Thunder Client

Import the endpoints into Postman or use VS Code's Thunder Client extension for easier testing.

---

## Complete Payment Flow Example

Here's a complete payment flow using curl:

```bash
# 1. Get sender wallet info
SENDER_INFO=$(curl -s -X POST http://localhost:3000/api/wallet/info \
  -H "Content-Type: application/json" \
  -d '{"walletAddressUrl": "https://ilp.interledger-test.dev/eb37db34"}')

echo "Sender Info: $SENDER_INFO"

# 2. Get receiver wallet info
RECEIVER_INFO=$(curl -s -X POST http://localhost:3000/api/wallet/info \
  -H "Content-Type: application/json" \
  -d '{"walletAddressUrl": "https://ilp.interledger-test.dev/user2test"}')

echo "Receiver Info: $RECEIVER_INFO"

# 3. Request incoming payment grant
# ... continue with other steps
```

---

## Configuration Override

You can override the default configuration in any request:

```json
{
  "walletAddressUrl": "https://ilp.interledger-test.dev/custom-wallet",
  "config": {
    "walletAddressUrl": "https://ilp.interledger-test.dev/custom-wallet",
    "privateKeyPath": "custom-private.key",
    "keyId": "custom-key-id"
  }
}
```

---

## Notes

- All POST requests require `Content-Type: application/json` header
- The server uses your configured wallet (`eb37db34`) by default
- Access tokens are temporary and need to be obtained through grants
- Grant requests may require user interaction for authorization
- All amounts are in the smallest unit (e.g., cents for EUR)

---

For more information, visit:
- API Info: http://localhost:3000/api/info
- Module Documentation: `api/API_DOCUMENTATION.md`
- Code Examples: `api/examples.js`

