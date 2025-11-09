# Open Payments API Modules

> A comprehensive set of Node.js modules for interacting with the Open Payments API, part of the Space Sheeps Interledger project.

[![Open Payments](https://img.shields.io/badge/Open_Payments-API-blue)](https://openpayments.dev/)
[![Interledger](https://img.shields.io/badge/Interledger-Protocol-green)](https://interledger.org/)

## Overview

This library provides a complete, modular interface to the Open Payments API, enabling seamless payment operations on the Interledger network. Whether you're building a payment app, integrating wallet functionality, or exploring Interledger, these modules handle the complexity for you.

**Key Features:**
-  Complete grant authorization flow
-  Send and receive payments
-  Real-time quotes with fees and exchange rates
-  Token lifecycle management
-  Built-in security best practices
-  Automatic retry with exponential backoff
-  Consistent error handling


---

##  Quick Start

### 1. Installation

```bash
cd backend
pnpm install
node server.js
```

### 2. Configuration

Create a configuration object with your wallet credentials:

```javascript
const config = {
  walletAddressUrl: "https://ilp.interledger-test.dev/your-wallet",
  privateKeyPath: "path/to/private.key",
  keyId: "your-key-id-uuid"
};
```

> **Need test credentials?** Create a free test wallet at [ilp.interledger-test.dev](https://ilp.interledger-test.dev)

### 3. Your First API Call

```javascript
import { getWalletAddressInfo } from './api/walletAddress.js';

const result = await getWalletAddressInfo(
  "https://ilp.interledger-test.dev/alice",
  config
);

if (result.success) {
  console.log("Wallet info:", result.data);
} else {
  console.error("Error:", result.error);
}
```

---

## 📚 Module Reference

### 🏦 Wallet Address (`walletAddress.js`)
Discover and validate wallet addresses across the network.

```javascript
import { getWalletAddressInfo, validateWalletAddresses } from './api/walletAddress.js';

// Get wallet information
const wallet = await getWalletAddressInfo(walletUrl, config);

// Validate multiple wallets at once
const validation = await validateWalletAddresses([url1, url2, url3], config);
```

**Key Functions:**
- `getWalletAddressInfo()` - Retrieve wallet metadata
- `getWalletAddressKeys()` - Get public keys for verification
- `validateWalletAddresses()` - Batch validate wallet addresses

---

### 🎫 Grants (`grants.js`)
Handle OAuth-style authorization for payment operations.

```javascript
import { requestIncomingPaymentGrant, requestOutgoingPaymentGrant } from './api/grants.js';

// Request permission to receive payments
const grant = await requestIncomingPaymentGrant(authServerUrl, config);

// Request permission to send payments (requires user authorization)
const outgoingGrant = await requestOutgoingPaymentGrant(
  authServerUrl,
  walletId,
  amount,
  config,
  true // interactive
);
```

**Key Functions:**
- `requestIncomingPaymentGrant()` - Authorize receiving payments
- `requestQuoteGrant()` - Authorize quote creation
- `requestOutgoingPaymentGrant()` - Authorize sending payments
- `continueGrant()` - Complete interactive authorization
- `revokeGrant()` - Revoke grant permissions

---

### 📥 Incoming Payments (`incomingPayment.js`)
Create payment requests and track received funds.

```javascript
import { createIncomingPayment, listIncomingPayments } from './api/incomingPayment.js';

// Create a payment request
const payment = await createIncomingPayment(
  resourceServer,
  token,
  {
    walletAddress: receiverWallet,
    incomingAmount: {
      value: "1000",
      assetCode: "USD",
      assetScale: 2
    },
    expiresAt: new Date(Date.now() + 86400000).toISOString() // 24 hours
  },
  config
);

// List all incoming payments
const payments = await listIncomingPayments(walletUrl, token, config);
```

**Key Functions:**
- `createIncomingPayment()` - Generate payment request
- `getIncomingPayment()` - Check payment status
- `listIncomingPayments()` - View payment history
- `completeIncomingPayment()` - Finalize payment request

---

### 💱 Quotes (`quotes.js`)
Calculate payment costs including fees and exchange rates.

```javascript
import { createQuote, calculateFee } from './api/quotes.js';

// Get a quote for sending payment
const quote = await createQuote(
  resourceServer,
  token,
  {
    walletAddress: senderWallet,
    receiver: incomingPaymentUrl,
    method: "ilp"
  },
  config
);

// Calculate the fee
const fee = calculateFee(quote.data);
console.log(`Fee: ${fee.display}`);
```

**Key Functions:**
- `createQuote()` - Get payment estimate
- `getQuote()` - Retrieve existing quote
- `createQuoteWithFixedSend()` - Fix the send amount
- `createQuoteWithFixedReceive()` - Fix the receive amount

---

### 📤 Outgoing Payments (`outgoingPayment.js`)
Execute and monitor sent payments.

```javascript
import { createOutgoingPayment, getOutgoingPayment } from './api/outgoingPayment.js';

// Send a payment
const payment = await createOutgoingPayment(
  resourceServer,
  token,
  {
    walletAddress: senderWallet,
    quoteId: quote.data.id
  },
  config
);

// Check payment status
const status = await getOutgoingPayment(payment.data.id, token, config);
```

**Key Functions:**
- `createOutgoingPayment()` - Execute payment
- `getOutgoingPayment()` - Check status
- `listOutgoingPayments()` - View transaction history

---

### 🎟️ Tokens (`tokens.js`)
Manage access token lifecycle and security.

```javascript
import { rotateAccessToken, revokeAccessToken } from './api/tokens.js';

// Rotate token before expiration
const newToken = await rotateAccessToken(managementUrl, currentToken, config);

// Revoke token when done
await revokeAccessToken(managementUrl, token, config);
```

**Key Functions:**
- `rotateAccessToken()` - Refresh access token
- `revokeAccessToken()` - Invalidate token

---

### 🛠️ Utilities (`utils.js`)
Helper functions for common payment operations.

```javascript
import { formatAmount, retryWithBackoff, waitForPaymentCompletion } from './api/utils.js';

// Format amounts for display
const display = formatAmount("1000", 2, "USD"); // "$10.00"

// Automatic retry with backoff
const result = await retryWithBackoff(apiCall, 3, 1000);

// Poll until payment completes
const completed = await waitForPaymentCompletion(checkPayment, 10, 2000);
```

**Key Functions:**
- `formatAmount()` - Format display amounts
- `parseAmount()` - Convert to smallest unit
- `calculateFee()` - Calculate fees from quotes
- `isPaymentComplete()` - Check completion status
- `waitForPaymentCompletion()` - Poll for completion
- `retryWithBackoff()` - Automatic retry logic
- `validateConfig()` - Validate configuration

---

## 🔄 Complete Payment Flow

Here's how to send a payment from Alice to Bob:

```javascript
// Step 1: Get wallet information
const alice = await getWalletAddressInfo(aliceUrl, config);
const bob = await getWalletAddressInfo(bobUrl, config);

// Step 2: Bob creates a payment request
const incomingGrant = await requestIncomingPaymentGrant(bob.data.authServer, config);
const paymentRequest = await createIncomingPayment(
  bob.data.resourceServer,
  incomingGrant.data.access_token.value,
  {
    walletAddress: bob.data.id,
    incomingAmount: {
      value: "1000",
      assetCode: "USD",
      assetScale: 2
    }
  },
  config
);

// Step 3: Alice gets a quote
const quoteGrant = await requestQuoteGrant(alice.data.authServer, config);
const quote = await createQuote(
  alice.data.resourceServer,
  quoteGrant.data.access_token.value,
  {
    walletAddress: alice.data.id,
    receiver: paymentRequest.data.id,
    method: "ilp"
  },
  config
);

// Step 4: Alice authorizes the payment
const outgoingGrant = await requestOutgoingPaymentGrant(
  alice.data.authServer,
  alice.data.id,
  quote.data.debitAmount,
  config,
  true // interactive authorization required
);

// Alice visits: outgoingGrant.data.interact.redirect
// After authorization, continue the grant:
const authorizedGrant = await continueGrant(
  outgoingGrant.data.continue.uri,
  outgoingGrant.data.continue.access_token.value,
  config
);

// Step 5: Execute the payment
const payment = await createOutgoingPayment(
  alice.data.resourceServer,
  authorizedGrant.data.access_token.value,
  {
    walletAddress: alice.data.id,
    quoteId: quote.data.id
  },
  config
);

console.log("Payment sent!", payment.data);
```

---

## 💡 Working Examples

The `examples.js` file contains complete, runnable examples:

```javascript
import { runAllExamples } from './api/examples.js';

// Run all examples
await runAllExamples();
```

**Available Examples:**
- Example 1: Get wallet information
- Example 2: Validate multiple wallets
- Example 3: Create incoming payment
- Example 4: Create and analyze quote
- Example 5: List incoming payments with pagination
- Example 7: Rotate access token

Each example includes detailed comments and error handling.

---

## 🛡️ Response Format

All API functions return a consistent response structure:

**Success Response:**
```javascript
{
  success: true,
  data: {
    // API response data
    id: "...",
    // ... other fields
  }
}
```

**Error Response:**
```javascript
{
  success: false,
  error: "Descriptive error message"
}
```

**Always check success before accessing data:**
```javascript
const result = await createQuote(url, token, details, config);

if (result.success) {
  console.log("Quote:", result.data);
} else {
  console.error("Failed:", result.error);
}
```

---

## 🧪 Testing & Development

### Set Up Test Environment

1. **Create a test wallet** at [ilp.interledger-test.dev](https://ilp.interledger-test.dev)
2. Click "Create Account" and note your wallet address
3. Navigate to Settings → Generate Key Pair
4. Download your private key (keep it secure!)
5. Copy your Key ID (UUID format)

### Configure Your Test Environment

```javascript
const testConfig = {
  walletAddressUrl: "https://ilp.interledger-test.dev/your-username",
  privateKeyPath: "./keys/private-test.key",
  keyId: "your-key-id-uuid"
};
```

### Run Examples

```bash
node examples.js
```

---

## 🔐 Security Best Practices

| Practice | Implementation |
|----------|----------------|
| **Private Key Security** | Never commit `.key` files. Add `*.key` to `.gitignore` |
| **Token Management** | Store tokens in memory only, never in logs or files |
| **Token Rotation** | Use `rotateAccessToken()` before expiration |
| **Input Validation** | Always validate wallet addresses before operations |
| **Error Handling** | Implement retry logic with `retryWithBackoff()` |
| **HTTPS Only** | All wallet addresses must use HTTPS protocol |
| **Configuration Validation** | Use `validateConfig()` before API calls |

### Example: Secure Token Handling

```javascript
// ✅ Good: Token in memory, rotated regularly
let accessToken = grant.data.access_token.value;

// Rotate before expiration
if (isTokenExpiringSoon(grant.data.access_token.expires_in)) {
  const rotated = await rotateAccessToken(managementUrl, accessToken, config);
  accessToken = rotated.data.access_token.value;
}

// ❌ Bad: Don't log tokens
console.log("Token:", accessToken); // NEVER DO THIS

// ❌ Bad: Don't store in files
fs.writeFileSync("token.txt", accessToken); // NEVER DO THIS
```

---

## 🐛 Error Handling Strategies

### Automatic Retry with Backoff

```javascript
import { retryWithBackoff } from './api/utils.js';

const result = await retryWithBackoff(
  async () => await createQuote(url, token, details, config),
  3,    // max retries
  1000  // initial delay in ms
);

if (!result.success) {
  console.error("Failed after 3 retries:", result.error);
  // Implement fallback logic
}
```

### Wait for Completion

```javascript
import { waitForPaymentCompletion } from './api/utils.js';

const checkPayment = () => getOutgoingPayment(paymentUrl, token, config);

const completed = await waitForPaymentCompletion(
  checkPayment,
  10,   // max attempts
  2000  // interval in ms
);

if (completed.success && completed.data.status === 'COMPLETED') {
  console.log("Payment successful!");
}
```

### Comprehensive Error Handling

```javascript
try {
  const result = await createOutgoingPayment(server, token, details, config);
  
  if (!result.success) {
    // Handle API-level errors
    if (result.error.includes("insufficient funds")) {
      return { error: "INSUFFICIENT_FUNDS", message: result.error };
    }
    return { error: "API_ERROR", message: result.error };
  }
  
  return { success: true, payment: result.data };
  
} catch (error) {
  // Handle network or unexpected errors
  console.error("Unexpected error:", error);
  return { error: "SYSTEM_ERROR", message: error.message };
}
```

---

## ⚡ Quick Reference

| Task | Module | Function |
|------|--------|----------|
| Get wallet info | `walletAddress.js` | `getWalletAddressInfo()` |
| Validate wallets | `walletAddress.js` | `validateWalletAddresses()` |
| Request payment grant | `grants.js` | `requestIncomingPaymentGrant()` |
| Create payment request | `incomingPayment.js` | `createIncomingPayment()` |
| Get payment quote | `quotes.js` | `createQuote()` |
| Send payment | `outgoingPayment.js` | `createOutgoingPayment()` |
| List payments | `incomingPayment.js` / `outgoingPayment.js` | `list*Payments()` |
| Rotate token | `tokens.js` | `rotateAccessToken()` |
| Revoke token | `tokens.js` | `revokeAccessToken()` |
| Retry operation | `utils.js` | `retryWithBackoff()` |
| Format amount | `utils.js` | `formatAmount()` |

---

## 📖 Additional Resources

### Documentation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with parameters and examples
- **[Open Payments Docs](https://openpayments.dev/)** - Official Open Payments documentation
- **[Open Payments SDK](https://openpayments.dev/sdk/wallet-get-info/)** - TypeScript SDK reference

### Community & Support
- **[Interledger Website](https://interledger.org/)** - Learn about the Interledger Protocol
- **[GitHub Discussions](https://github.com/interledger/open-payments/discussions)** - Ask questions and share ideas
- **[Test Wallet](https://ilp.interledger-test.dev)** - Create test accounts with play money

### Tools
- **[Rafiki Admin](https://rafiki.dev/)** - Open-source Interledger backend
- **[Web Monetization](https://webmonetization.org/)** - Monetize your web content

---

## 🤝 Contributing

Contributions are welcome! This is part of the Space Sheeps Interledger project.

---

## 📄 License

Part of the Space Sheeps Interledger project.

---

**Last Updated:** November 2025  
**Maintainer:** Space Sheeps Interledger Team  
**Version:** 1.0.0 