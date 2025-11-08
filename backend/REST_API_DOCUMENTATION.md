# Space Sheeps Interledger - REST API Documentation

Complete guide to all REST API endpoints for the Space Sheeps Interledger server.

## Table of Contents

1. [Base URL & Setup](#base-url--setup)
2. [Response Format](#response-format)
3. [Authentication](#authentication)
4. [Health & Info Endpoints](#health--info-endpoints)
5. [Wallet Address Endpoints](#wallet-address-endpoints)
6. [Grant Management Endpoints](#grant-management-endpoints)
7. [Incoming Payment Endpoints](#incoming-payment-endpoints)
8. [Quote Endpoints](#quote-endpoints)
9. [Outgoing Payment Endpoints](#outgoing-payment-endpoints)
10. [Token Management Endpoints](#token-management-endpoints)
11. [Legacy Endpoints](#legacy-endpoints)
12. [Error Handling](#error-handling)
13. [Complete Payment Flow Example](#complete-payment-flow-example)

---

## Base URL & Setup

**Default Server URL:** `http://localhost:3000`

**Default Configuration:**
```json
{
  "walletAddressUrl": "https://ilp.interledger-test.dev/eb37db34",
  "privateKeyPath": "private.key",
  "keyId": "e2903c1f-a02c-4ee2-aa8d-c2ea0d064180"
}
```

**Starting the Server:**
```bash
cd backend
node server.js
```

---

## Response Format

All endpoints return JSON responses with a consistent structure.

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data specific to the endpoint
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## Authentication

Most endpoints require Open Payments authentication. You can either:

1. **Use default configuration** (stored on server)
2. **Override configuration** by including a `config` object in your request body

**Configuration Object Structure:**
```json
{
  "config": {
    "walletAddressUrl": "https://ilp.interledger-test.dev/your-wallet",
    "privateKeyPath": "private.key",
    "keyId": "your-key-id"
  }
}
```

---

## Health & Info Endpoints

### 1. Health Check

**Endpoint:** `GET /api/health`

**Description:** Check if the server is running and healthy.

**Request:**
```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T12:34:56.789Z",
  "version": "1.0.0"
}
```

---

### 2. API Information

**Endpoint:** `GET /api/info`

**Description:** Get information about available endpoints and server configuration.

**Request:**
```bash
curl http://localhost:3000/api/info
```

**Response:**
```json
{
  "name": "Space Sheeps Interledger API",
  "version": "1.0.0",
  "description": "Open Payments API Integration",
  "defaultWallet": "https://ilp.interledger-test.dev/eb37db34",
  "endpoints": {
    "walletAddress": ["GET /api/wallet/info", "..."],
    "grants": ["POST /api/grants/incoming-payment", "..."],
    "incomingPayments": ["POST /api/incoming-payments", "..."],
    "quotes": ["POST /api/quotes", "..."],
    "outgoingPayments": ["POST /api/outgoing-payments", "..."],
    "tokens": ["POST /api/tokens/rotate", "..."],
    "legacy": ["POST /api/payment"]
  }
}
```

---

## Wallet Address Endpoints

### 1. Get Wallet Address Information

**Endpoint:** `POST /api/wallet/info`

**Description:** Retrieves public information about a wallet address including authorization server, resource server, and asset details.

**Request Body:**
```json
{
  "walletAddressUrl": "https://ilp.interledger-test.dev/alice",
  "config": {  // Optional, uses default if not provided
    "walletAddressUrl": "https://ilp.interledger-test.dev/eb37db34",
    "privateKeyPath": "private.key",
    "keyId": "e2903c1f-a02c-4ee2-aa8d-c2ea0d064180"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/wallet/info \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddressUrl": "https://ilp.interledger-test.dev/alice"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "https://ilp.interledger-test.dev/alice",
    "authServer": "https://auth.ilp.interledger-test.dev",
    "resourceServer": "https://resource.ilp.interledger-test.dev",
    "assetCode": "USD",
    "assetScale": 2,
    "publicName": "Alice's Wallet"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "walletAddressUrl is required"
}
```

---

### 2. Get Wallet Address Keys

**Endpoint:** `POST /api/wallet/keys`

**Description:** Retrieves the public keys bound to a wallet address for verification purposes.

**Request Body:**
```json
{
  "walletAddressUrl": "https://ilp.interledger-test.dev/alice"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/wallet/keys \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddressUrl": "https://ilp.interledger-test.dev/alice"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "keys": [
      {
        "kid": "key-id-1",
        "kty": "EdDSA",
        "crv": "Ed25519",
        "x": "base64-encoded-public-key"
      }
    ]
  }
}
```

---

### 3. Validate Wallet Addresses

**Endpoint:** `POST /api/wallet/validate`

**Description:** Batch validation of multiple wallet addresses.

**Request Body:**
```json
{
  "walletAddresses": [
    "https://ilp.interledger-test.dev/alice",
    "https://ilp.interledger-test.dev/bob",
    "https://ilp.interledger-test.dev/charlie"
  ]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/wallet/validate \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddresses": [
      "https://ilp.interledger-test.dev/alice",
      "https://ilp.interledger-test.dev/bob"
    ]
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "valid": [
      {
        "url": "https://ilp.interledger-test.dev/alice",
        "valid": true,
        "info": { "assetCode": "USD", "assetScale": 2 }
      },
      {
        "url": "https://ilp.interledger-test.dev/bob",
        "valid": true,
        "info": { "assetCode": "USD", "assetScale": 2 }
      }
    ],
    "invalid": []
  }
}
```

---

## Grant Management Endpoints

### 1. Request Incoming Payment Grant

**Endpoint:** `POST /api/grants/incoming-payment`

**Description:** Requests permission to create incoming payments on a wallet. This grant typically doesn't require user interaction.

**Request Body:**
```json
{
  "authServerUrl": "https://auth.ilp.interledger-test.dev"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/grants/incoming-payment \
  -H "Content-Type: application/json" \
  -d '{
    "authServerUrl": "https://auth.ilp.interledger-test.dev"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "isFinalized": true,
    "isPending": false,
    "data": {
      "access_token": {
        "value": "eyJhbGc...",
        "manage": "https://auth.ilp.interledger-test.dev/token/abc123",
        "expires_in": 3600
      },
      "continue": {
        "access_token": {
          "value": "continue_token_xyz"
        },
        "uri": "https://auth.ilp.interledger-test.dev/continue/def456"
      }
    }
  }
}
```

---

### 2. Request Quote Grant

**Endpoint:** `POST /api/grants/quote`

**Description:** Requests permission to create quotes for payment estimates. Usually auto-approved.

**Request Body:**
```json
{
  "authServerUrl": "https://auth.ilp.interledger-test.dev"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/grants/quote \
  -H "Content-Type: application/json" \
  -d '{
    "authServerUrl": "https://auth.ilp.interledger-test.dev"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "isFinalized": true,
    "isPending": false,
    "data": {
      "access_token": {
        "value": "eyJhbGc...",
        "manage": "https://auth.ilp.interledger-test.dev/token/quote123",
        "expires_in": 3600
      }
    }
  }
}
```

---

### 3. Request Outgoing Payment Grant

**Endpoint:** `POST /api/grants/outgoing-payment`

**Description:** Requests permission to create outgoing payments. **Requires user interaction/approval.**

**Request Body:**
```json
{
  "authServerUrl": "https://auth.ilp.interledger-test.dev",
  "walletAddressId": "https://ilp.interledger-test.dev/alice",
  "debitAmount": {
    "assetCode": "USD",
    "assetScale": 2,
    "value": "5000"
  },
  "requireInteraction": true
}
```

**Field Descriptions:**
- `authServerUrl`: Authorization server URL from wallet info
- `walletAddressId`: The wallet address that will send the payment
- `debitAmount`: Maximum amount to debit (in smallest units, e.g., cents)
- `requireInteraction`: Whether user authorization is required (default: true)

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/grants/outgoing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "authServerUrl": "https://auth.ilp.interledger-test.dev",
    "walletAddressId": "https://ilp.interledger-test.dev/alice",
    "debitAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5000"
    },
    "requireInteraction": true
  }'
```

**Success Response (Pending - Requires User Authorization):**
```json
{
  "success": true,
  "data": {
    "isFinalized": false,
    "isPending": true,
    "data": {
      "interact": {
        "redirect": "https://auth.ilp.interledger-test.dev/grant/authorize?id=xyz",
        "finish": "https://yourapp.com/callback"
      },
      "continue": {
        "access_token": {
          "value": "continue_token_abc"
        },
        "uri": "https://auth.ilp.interledger-test.dev/continue/outgoing123",
        "wait": 30
      }
    }
  }
}
```

**Note:** User must visit the `interact.redirect` URL to authorize the grant. After authorization, use the Continue Grant endpoint.

---

### 4. Continue Grant

**Endpoint:** `POST /api/grants/continue`

**Description:** Finalizes a grant after user authorization.

**Request Body:**
```json
{
  "continueUri": "https://auth.ilp.interledger-test.dev/continue/outgoing123",
  "continueAccessToken": "continue_token_abc"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/grants/continue \
  -H "Content-Type: application/json" \
  -d '{
    "continueUri": "https://auth.ilp.interledger-test.dev/continue/outgoing123",
    "continueAccessToken": "continue_token_abc"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "isFinalized": true,
    "isPending": false,
    "data": {
      "access_token": {
        "value": "eyJhbGc...",
        "manage": "https://auth.ilp.interledger-test.dev/token/final123",
        "expires_in": 3600
      }
    }
  }
}
```

---

### 5. Revoke Grant

**Endpoint:** `DELETE /api/grants/revoke`

**Description:** Revokes a grant to remove access permissions.

**Request Body:**
```json
{
  "grantUrl": "https://auth.ilp.interledger-test.dev/grant/abc123",
  "accessToken": "eyJhbGc..."
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/grants/revoke \
  -H "Content-Type: application/json" \
  -d '{
    "grantUrl": "https://auth.ilp.interledger-test.dev/grant/abc123",
    "accessToken": "eyJhbGc..."
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "revoked": true,
    "message": "Grant successfully revoked"
  }
}
```

---

## Incoming Payment Endpoints

### 1. Create Incoming Payment

**Endpoint:** `POST /api/incoming-payments`

**Description:** Creates an incoming payment request that specifies how much the wallet expects to receive.

**Request Body:**
```json
{
  "resourceServerUrl": "https://resource.ilp.interledger-test.dev",
  "accessToken": "eyJhbGc...",
  "paymentDetails": {
    "walletAddress": "https://ilp.interledger-test.dev/alice",
    "incomingAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5000"
    },
    "description": "Payment for services",
    "externalRef": "ORDER-12345"
  }
}
```

**Field Descriptions:**
- `resourceServerUrl`: Resource server URL from wallet info
- `accessToken`: Access token from incoming payment grant
- `paymentDetails.walletAddress`: Wallet that will receive payment
- `paymentDetails.incomingAmount`: Amount to receive (5000 = $50.00 with scale 2)
- `paymentDetails.description`: Optional description
- `paymentDetails.externalRef`: Optional external reference ID

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/incoming-payments \
  -H "Content-Type: application/json" \
  -d '{
    "resourceServerUrl": "https://resource.ilp.interledger-test.dev",
    "accessToken": "eyJhbGc...",
    "paymentDetails": {
      "walletAddress": "https://ilp.interledger-test.dev/alice",
      "incomingAmount": {
        "assetCode": "USD",
        "assetScale": 2,
        "value": "5000"
      },
      "description": "Payment for Order #12345"
    }
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
    "walletAddress": "https://ilp.interledger-test.dev/alice",
    "incomingAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5000"
    },
    "receivedAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "0"
    },
    "completed": false,
    "createdAt": "2025-11-08T12:34:56.789Z",
    "expiresAt": "2025-11-08T13:34:56.789Z",
    "metadata": {
      "description": "Payment for Order #12345"
    }
  }
}
```

**Note:** Use the returned `id` as the `receiver` when creating a quote.

---

### 2. Get Incoming Payment

**Endpoint:** `POST /api/incoming-payments/get`

**Description:** Retrieves details of a specific incoming payment.

**Request Body:**
```json
{
  "incomingPaymentUrl": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
  "accessToken": "eyJhbGc..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/incoming-payments/get \
  -H "Content-Type: application/json" \
  -d '{
    "incomingPaymentUrl": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
    "accessToken": "eyJhbGc..."
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
    "walletAddress": "https://ilp.interledger-test.dev/alice",
    "incomingAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5000"
    },
    "receivedAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5000"
    },
    "completed": true,
    "createdAt": "2025-11-08T12:34:56.789Z",
    "updatedAt": "2025-11-08T12:36:12.456Z"
  }
}
```

---

### 3. List Incoming Payments

**Endpoint:** `POST /api/incoming-payments/list`

**Description:** Lists all incoming payments for a wallet address with pagination support.

**Request Body:**
```json
{
  "walletAddressUrl": "https://ilp.interledger-test.dev/alice",
  "accessToken": "eyJhbGc...",
  "pagination": {
    "first": 10,
    "after": "cursor_abc"
  }
}
```

**Field Descriptions:**
- `pagination.first`: Number of items to return (optional)
- `pagination.after`: Cursor for pagination (optional)
- `pagination.last`: Get last N items (alternative to first)
- `pagination.before`: Cursor for reverse pagination

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/incoming-payments/list \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddressUrl": "https://ilp.interledger-test.dev/alice",
    "accessToken": "eyJhbGc...",
    "pagination": { "first": 10 }
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "result": [
      {
        "id": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
        "incomingAmount": { "value": "5000", "assetCode": "USD", "assetScale": 2 },
        "receivedAmount": { "value": "5000", "assetCode": "USD", "assetScale": 2 },
        "completed": true
      },
      {
        "id": "https://resource.ilp.interledger-test.dev/incoming-payments/def456",
        "incomingAmount": { "value": "10000", "assetCode": "USD", "assetScale": 2 },
        "receivedAmount": { "value": "0", "assetCode": "USD", "assetScale": 2 },
        "completed": false
      }
    ],
    "pagination": {
      "hasNextPage": true,
      "hasPreviousPage": false,
      "startCursor": "cursor_start",
      "endCursor": "cursor_end"
    }
  }
}
```

---

### 4. Complete Incoming Payment

**Endpoint:** `POST /api/incoming-payments/complete`

**Description:** Marks an incoming payment as complete, preventing further payments to it.

**Request Body:**
```json
{
  "incomingPaymentUrl": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
  "accessToken": "eyJhbGc..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/incoming-payments/complete \
  -H "Content-Type: application/json" \
  -d '{
    "incomingPaymentUrl": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
    "accessToken": "eyJhbGc..."
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
    "completed": true,
    "completedAt": "2025-11-08T12:40:00.000Z"
  }
}
```

---

## Quote Endpoints

### 1. Create Quote

**Endpoint:** `POST /api/quotes`

**Description:** Creates a quote for a payment, providing cost estimates including fees and exchange rates.

**Request Body:**
```json
{
  "resourceServerUrl": "https://resource.ilp.interledger-test.dev",
  "accessToken": "eyJhbGc...",
  "quoteDetails": {
    "walletAddress": "https://ilp.interledger-test.dev/bob",
    "receiver": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
    "method": "ilp"
  }
}
```

**Field Descriptions:**
- `walletAddress`: Sender's wallet address
- `receiver`: Incoming payment URL (from Create Incoming Payment)
- `method`: Payment method (usually "ilp")

**Note:** You can specify either `receiveAmount` (fixed receive) OR `debitAmount` (fixed send) in quoteDetails, but not both.

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "resourceServerUrl": "https://resource.ilp.interledger-test.dev",
    "accessToken": "eyJhbGc...",
    "quoteDetails": {
      "walletAddress": "https://ilp.interledger-test.dev/bob",
      "receiver": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
      "method": "ilp"
    }
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "https://resource.ilp.interledger-test.dev/quotes/quote123",
    "walletAddress": "https://ilp.interledger-test.dev/bob",
    "receiver": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
    "receiveAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5000"
    },
    "debitAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5050"
    },
    "createdAt": "2025-11-08T12:34:56.789Z",
    "expiresAt": "2025-11-08T12:44:56.789Z"
  }
}
```

**Note:** The `debitAmount` includes fees. In this example, sender pays $50.50 and receiver gets $50.00.

---

### 2. Get Quote

**Endpoint:** `POST /api/quotes/get`

**Description:** Retrieves details of a specific quote.

**Request Body:**
```json
{
  "quoteUrl": "https://resource.ilp.interledger-test.dev/quotes/quote123",
  "accessToken": "eyJhbGc..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/quotes/get \
  -H "Content-Type: application/json" \
  -d '{
    "quoteUrl": "https://resource.ilp.interledger-test.dev/quotes/quote123",
    "accessToken": "eyJhbGc..."
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "https://resource.ilp.interledger-test.dev/quotes/quote123",
    "receiveAmount": { "value": "5000", "assetCode": "USD", "assetScale": 2 },
    "debitAmount": { "value": "5050", "assetCode": "USD", "assetScale": 2 },
    "expiresAt": "2025-11-08T12:44:56.789Z"
  }
}
```

---

### 3. Create Quote with Fixed Send Amount

**Endpoint:** `POST /api/quotes/fixed-send`

**Description:** Creates a quote when you know how much the sender wants to send.

**Request Body:**
```json
{
  "resourceServerUrl": "https://resource.ilp.interledger-test.dev",
  "accessToken": "eyJhbGc...",
  "walletAddress": "https://ilp.interledger-test.dev/bob",
  "receiver": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
  "debitAmount": {
    "assetCode": "USD",
    "assetScale": 2,
    "value": "5000"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/quotes/fixed-send \
  -H "Content-Type: application/json" \
  -d '{
    "resourceServerUrl": "https://resource.ilp.interledger-test.dev",
    "accessToken": "eyJhbGc...",
    "walletAddress": "https://ilp.interledger-test.dev/bob",
    "receiver": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
    "debitAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5000"
    }
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "https://resource.ilp.interledger-test.dev/quotes/quote456",
    "debitAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5000"
    },
    "receiveAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "4950"
    }
  }
}
```

**Note:** Sender pays exactly $50.00, receiver gets $49.50 after fees.

---

### 4. Create Quote with Fixed Receive Amount

**Endpoint:** `POST /api/quotes/fixed-receive`

**Description:** Creates a quote when you know how much the receiver should receive.

**Request Body:**
```json
{
  "resourceServerUrl": "https://resource.ilp.interledger-test.dev",
  "accessToken": "eyJhbGc...",
  "walletAddress": "https://ilp.interledger-test.dev/bob",
  "receiver": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
  "receiveAmount": {
    "assetCode": "USD",
    "assetScale": 2,
    "value": "5000"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/quotes/fixed-receive \
  -H "Content-Type: application/json" \
  -d '{
    "resourceServerUrl": "https://resource.ilp.interledger-test.dev",
    "accessToken": "eyJhbGc...",
    "walletAddress": "https://ilp.interledger-test.dev/bob",
    "receiver": "https://resource.ilp.interledger-test.dev/incoming-payments/abc123",
    "receiveAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5000"
    }
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "https://resource.ilp.interledger-test.dev/quotes/quote789",
    "receiveAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5000"
    },
    "debitAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5050"
    }
  }
}
```

**Note:** Receiver gets exactly $50.00, sender pays $50.50 including fees.

---

## Outgoing Payment Endpoints

### 1. Create Outgoing Payment

**Endpoint:** `POST /api/outgoing-payments`

**Description:** Executes a payment based on a previously created quote. This is the final step that actually sends money.

**Request Body:**
```json
{
  "resourceServerUrl": "https://resource.ilp.interledger-test.dev",
  "accessToken": "eyJhbGc...",
  "paymentDetails": {
    "walletAddress": "https://ilp.interledger-test.dev/bob",
    "quoteId": "https://resource.ilp.interledger-test.dev/quotes/quote123",
    "metadata": {
      "description": "Payment for Order #12345"
    }
  }
}
```

**Field Descriptions:**
- `resourceServerUrl`: Resource server URL from sender's wallet info
- `accessToken`: Access token from outgoing payment grant (after user authorization)
- `paymentDetails.walletAddress`: Sender's wallet address
- `paymentDetails.quoteId`: Quote ID from Create Quote
- `paymentDetails.metadata`: Optional metadata object

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/outgoing-payments \
  -H "Content-Type: application/json" \
  -d '{
    "resourceServerUrl": "https://resource.ilp.interledger-test.dev",
    "accessToken": "eyJhbGc...",
    "paymentDetails": {
      "walletAddress": "https://ilp.interledger-test.dev/bob",
      "quoteId": "https://resource.ilp.interledger-test.dev/quotes/quote123",
      "metadata": {
        "description": "Payment for Order #12345"
      }
    }
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "https://resource.ilp.interledger-test.dev/outgoing-payments/pay123",
    "walletAddress": "https://ilp.interledger-test.dev/bob",
    "quoteId": "https://resource.ilp.interledger-test.dev/quotes/quote123",
    "receiveAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5000"
    },
    "debitAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5050"
    },
    "sentAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5050"
    },
    "failed": false,
    "createdAt": "2025-11-08T12:34:56.789Z",
    "metadata": {
      "description": "Payment for Order #12345"
    }
  }
}
```

---

### 2. Get Outgoing Payment

**Endpoint:** `POST /api/outgoing-payments/get`

**Description:** Retrieves the status and details of an outgoing payment.

**Request Body:**
```json
{
  "outgoingPaymentUrl": "https://resource.ilp.interledger-test.dev/outgoing-payments/pay123",
  "accessToken": "eyJhbGc..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/outgoing-payments/get \
  -H "Content-Type: application/json" \
  -d '{
    "outgoingPaymentUrl": "https://resource.ilp.interledger-test.dev/outgoing-payments/pay123",
    "accessToken": "eyJhbGc..."
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "https://resource.ilp.interledger-test.dev/outgoing-payments/pay123",
    "walletAddress": "https://ilp.interledger-test.dev/bob",
    "sentAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5050"
    },
    "receiveAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5000"
    },
    "failed": false,
    "createdAt": "2025-11-08T12:34:56.789Z",
    "updatedAt": "2025-11-08T12:35:10.123Z"
  }
}
```

---

### 3. List Outgoing Payments

**Endpoint:** `POST /api/outgoing-payments/list`

**Description:** Lists all outgoing payments for a wallet address with pagination.

**Request Body:**
```json
{
  "walletAddressUrl": "https://ilp.interledger-test.dev/bob",
  "accessToken": "eyJhbGc...",
  "pagination": {
    "first": 20
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/outgoing-payments/list \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddressUrl": "https://ilp.interledger-test.dev/bob",
    "accessToken": "eyJhbGc...",
    "pagination": { "first": 20 }
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "result": [
      {
        "id": "https://resource.ilp.interledger-test.dev/outgoing-payments/pay123",
        "sentAmount": { "value": "5050", "assetCode": "USD", "assetScale": 2 },
        "receiveAmount": { "value": "5000", "assetCode": "USD", "assetScale": 2 },
        "failed": false,
        "createdAt": "2025-11-08T12:34:56.789Z"
      },
      {
        "id": "https://resource.ilp.interledger-test.dev/outgoing-payments/pay456",
        "sentAmount": { "value": "10100", "assetCode": "USD", "assetScale": 2 },
        "receiveAmount": { "value": "10000", "assetCode": "USD", "assetScale": 2 },
        "failed": false,
        "createdAt": "2025-11-08T10:20:30.456Z"
      }
    ],
    "pagination": {
      "hasNextPage": false,
      "hasPreviousPage": false,
      "startCursor": "cursor_start",
      "endCursor": "cursor_end"
    }
  }
}
```

---

## Token Management Endpoints

### 1. Rotate Access Token

**Endpoint:** `POST /api/tokens/rotate`

**Description:** Rotates an access token before it expires to get a new one with a fresh expiration time.

**Request Body:**
```json
{
  "tokenManagementUrl": "https://auth.ilp.interledger-test.dev/token/abc123",
  "currentAccessToken": "eyJhbGc..."
}
```

**Field Descriptions:**
- `tokenManagementUrl`: The `manage` URL from the grant's access_token
- `currentAccessToken`: Current valid access token

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/tokens/rotate \
  -H "Content-Type: application/json" \
  -d '{
    "tokenManagementUrl": "https://auth.ilp.interledger-test.dev/token/abc123",
    "currentAccessToken": "eyJhbGc..."
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "access_token": {
      "value": "eyJhbGc...new_token",
      "manage": "https://auth.ilp.interledger-test.dev/token/abc123",
      "expires_in": 3600
    }
  }
}
```

---

### 2. Revoke Access Token

**Endpoint:** `DELETE /api/tokens/revoke`

**Description:** Immediately invalidates an access token.

**Request Body:**
```json
{
  "tokenManagementUrl": "https://auth.ilp.interledger-test.dev/token/abc123",
  "accessToken": "eyJhbGc..."
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/tokens/revoke \
  -H "Content-Type: application/json" \
  -d '{
    "tokenManagementUrl": "https://auth.ilp.interledger-test.dev/token/abc123",
    "accessToken": "eyJhbGc..."
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "revoked": true,
    "message": "Token successfully revoked"
  }
}
```

---

## Legacy Endpoints

### 1. Initiate Payment (Legacy)

**Endpoint:** `POST /api/payment`

**Description:** Original implementation that initiates a complete payment flow in one call. **Use the modular endpoints above for production.**

**Request Body:**
```json
{
  "amount": "5000",
  "user": "alice"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "5000",
    "user": "alice"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Payment initiated",
  "result": {
    "paymentId": "payment_abc123",
    "status": "pending",
    "amount": "5000"
  }
}
```

---

## Error Handling

### Common Error Codes

| HTTP Status | Description | Example Response |
|-------------|-------------|------------------|
| 400 | Bad Request - Missing or invalid parameters | `{"success": false, "error": "walletAddressUrl is required"}` |
| 404 | Not Found - Endpoint doesn't exist | `{"success": false, "error": "Endpoint not found"}` |
| 500 | Internal Server Error | `{"success": false, "error": "Internal server error"}` |

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

### Common Error Scenarios

#### 1. Missing Required Parameters
```json
{
  "success": false,
  "error": "walletAddressUrl is required"
}
```

#### 2. Invalid Wallet Address
```json
{
  "success": false,
  "error": "Invalid wallet address format"
}
```

#### 3. Expired Token
```json
{
  "success": false,
  "error": "Access token has expired"
}
```

#### 4. Insufficient Funds
```json
{
  "success": false,
  "error": "Insufficient balance for payment"
}
```

#### 5. Grant Requires User Authorization
```json
{
  "success": true,
  "data": {
    "isPending": true,
    "isFinalized": false,
    "data": {
      "interact": {
        "redirect": "https://auth.ilp.interledger-test.dev/authorize?id=xyz"
      }
    }
  }
}
```

### Best Practices for Error Handling

1. **Always check the `success` field** before accessing `data`
2. **Handle pending grants** - Check for `isPending: true` and redirect user to authorization URL
3. **Implement retry logic** with exponential backoff for network errors
4. **Validate inputs** before making API calls
5. **Store tokens securely** - Never log or expose access tokens
6. **Handle token expiration** - Implement token rotation before expiry

---

## Complete Payment Flow Example

Here's a step-by-step example of sending $50 from Bob to Alice:

### Step 1: Get Wallet Information

```bash
# Get sender (Bob) wallet info
curl -X POST http://localhost:3000/api/wallet/info \
  -H "Content-Type: application/json" \
  -d '{"walletAddressUrl": "https://ilp.interledger-test.dev/bob"}'

# Get receiver (Alice) wallet info
curl -X POST http://localhost:3000/api/wallet/info \
  -H "Content-Type: application/json" \
  -d '{"walletAddressUrl": "https://ilp.interledger-test.dev/alice"}'
```

### Step 2: Request Incoming Payment Grant (Alice)

```bash
curl -X POST http://localhost:3000/api/grants/incoming-payment \
  -H "Content-Type: application/json" \
  -d '{"authServerUrl": "https://auth.ilp.interledger-test.dev"}'
```

**Save the `access_token.value` from the response.**

### Step 3: Create Incoming Payment (Alice receives)

```bash
curl -X POST http://localhost:3000/api/incoming-payments \
  -H "Content-Type: application/json" \
  -d '{
    "resourceServerUrl": "https://resource.ilp.interledger-test.dev",
    "accessToken": "INCOMING_PAYMENT_TOKEN",
    "paymentDetails": {
      "walletAddress": "https://ilp.interledger-test.dev/alice",
      "incomingAmount": {
        "assetCode": "USD",
        "assetScale": 2,
        "value": "5000"
      },
      "description": "Payment from Bob to Alice"
    }
  }'
```

**Save the incoming payment `id` from the response.**

### Step 4: Request Quote Grant (Bob)

```bash
curl -X POST http://localhost:3000/api/grants/quote \
  -H "Content-Type: application/json" \
  -d '{"authServerUrl": "https://auth.ilp.interledger-test.dev"}'
```

**Save the `access_token.value` from the response.**

### Step 5: Create Quote (Bob estimates cost)

```bash
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "resourceServerUrl": "https://resource.ilp.interledger-test.dev",
    "accessToken": "QUOTE_TOKEN",
    "quoteDetails": {
      "walletAddress": "https://ilp.interledger-test.dev/bob",
      "receiver": "INCOMING_PAYMENT_ID",
      "method": "ilp"
    }
  }'
```

**Save the quote `id` and `debitAmount` from the response.**

### Step 6: Request Outgoing Payment Grant (Bob)

```bash
curl -X POST http://localhost:3000/api/grants/outgoing-payment \
  -H "Content-Type: application/json" \
  -d '{
    "authServerUrl": "https://auth.ilp.interledger-test.dev",
    "walletAddressId": "https://ilp.interledger-test.dev/bob",
    "debitAmount": {
      "assetCode": "USD",
      "assetScale": 2,
      "value": "5050"
    },
    "requireInteraction": true
  }'
```

**Response will have `isPending: true` with a `redirect` URL for user authorization.**

### Step 7: User Authorization

User (Bob) visits the `interact.redirect` URL and authorizes the payment.

### Step 8: Continue Grant

```bash
curl -X POST http://localhost:3000/api/grants/continue \
  -H "Content-Type: application/json" \
  -d '{
    "continueUri": "CONTINUE_URI",
    "continueAccessToken": "CONTINUE_TOKEN"
  }'
```

**Save the finalized `access_token.value` from the response.**

### Step 9: Create Outgoing Payment (Execute)

```bash
curl -X POST http://localhost:3000/api/outgoing-payments \
  -H "Content-Type: application/json" \
  -d '{
    "resourceServerUrl": "https://resource.ilp.interledger-test.dev",
    "accessToken": "OUTGOING_PAYMENT_TOKEN",
    "paymentDetails": {
      "walletAddress": "https://ilp.interledger-test.dev/bob",
      "quoteId": "QUOTE_ID",
      "metadata": {
        "description": "Payment from Bob to Alice"
      }
    }
  }'
```

**Payment is now complete!**

### Step 10: Verify Payment (Optional)

```bash
# Check outgoing payment status
curl -X POST http://localhost:3000/api/outgoing-payments/get \
  -H "Content-Type: application/json" \
  -d '{
    "outgoingPaymentUrl": "OUTGOING_PAYMENT_ID",
    "accessToken": "OUTGOING_PAYMENT_TOKEN"
  }'

# Check incoming payment status
curl -X POST http://localhost:3000/api/incoming-payments/get \
  -H "Content-Type: application/json" \
  -d '{
    "incomingPaymentUrl": "INCOMING_PAYMENT_ID",
    "accessToken": "INCOMING_PAYMENT_TOKEN"
  }'
```

---

## Quick Reference

### Endpoint Summary

| Category | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| **Health** | GET | `/api/health` | Server health check |
| **Info** | GET | `/api/info` | API information |
| **Wallet** | POST | `/api/wallet/info` | Get wallet details |
| **Wallet** | POST | `/api/wallet/keys` | Get wallet keys |
| **Wallet** | POST | `/api/wallet/validate` | Validate wallets |
| **Grants** | POST | `/api/grants/incoming-payment` | Request incoming grant |
| **Grants** | POST | `/api/grants/quote` | Request quote grant |
| **Grants** | POST | `/api/grants/outgoing-payment` | Request outgoing grant |
| **Grants** | POST | `/api/grants/continue` | Continue pending grant |
| **Grants** | DELETE | `/api/grants/revoke` | Revoke grant |
| **Incoming** | POST | `/api/incoming-payments` | Create incoming payment |
| **Incoming** | POST | `/api/incoming-payments/get` | Get incoming payment |
| **Incoming** | POST | `/api/incoming-payments/list` | List incoming payments |
| **Incoming** | POST | `/api/incoming-payments/complete` | Complete incoming payment |
| **Quotes** | POST | `/api/quotes` | Create quote |
| **Quotes** | POST | `/api/quotes/get` | Get quote |
| **Quotes** | POST | `/api/quotes/fixed-send` | Quote with fixed send |
| **Quotes** | POST | `/api/quotes/fixed-receive` | Quote with fixed receive |
| **Outgoing** | POST | `/api/outgoing-payments` | Create outgoing payment |
| **Outgoing** | POST | `/api/outgoing-payments/get` | Get outgoing payment |
| **Outgoing** | POST | `/api/outgoing-payments/list` | List outgoing payments |
| **Tokens** | POST | `/api/tokens/rotate` | Rotate token |
| **Tokens** | DELETE | `/api/tokens/revoke` | Revoke token |
| **Legacy** | POST | `/api/payment` | Legacy payment flow |

---

## Testing with Postman

### Import as Postman Collection

You can create a Postman collection with all these endpoints. Here's a sample environment setup:

**Variables:**
```json
{
  "baseUrl": "http://localhost:3000",
  "authServerUrl": "https://auth.ilp.interledger-test.dev",
  "resourceServerUrl": "https://resource.ilp.interledger-test.dev",
  "senderWallet": "https://ilp.interledger-test.dev/bob",
  "receiverWallet": "https://ilp.interledger-test.dev/alice",
  "incomingPaymentToken": "",
  "quoteToken": "",
  "outgoingPaymentToken": "",
  "incomingPaymentId": "",
  "quoteId": ""
}
```

---

## Support

For more information:
- **Server Documentation:** `/backend/SERVER_README.md`
- **API Module Documentation:** `/backend/api/API_DOCUMENTATION.md`
- **Open Payments SDK:** https://openpayments.dev/
- **Interledger Foundation:** https://interledger.org/

---

## Version

- **API Version:** 1.0.0
- **Last Updated:** November 8, 2025
- **Server:** Express.js
- **Open Payments SDK:** ^7.1.3

---

**Note:** This documentation covers all REST API endpoints exposed by the Express server. For information about the underlying Open Payments modules and SDK functions, refer to `/backend/api/API_DOCUMENTATION.md`.

