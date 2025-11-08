# Open Payments API Documentation

This documentation covers the Open Payments API integration modules for the Space Sheeps Interledger project. Each module provides specific functionality for interacting with the Open Payments ecosystem.

## Table of Contents

1. [Setup and Configuration](#setup-and-configuration)
2. [Wallet Address Operations](#wallet-address-operations)
3. [Grant Management](#grant-management)
4. [Incoming Payments](#incoming-payments)
5. [Quotes](#quotes)
6. [Outgoing Payments](#outgoing-payments)
7. [Token Management](#token-management)
8. [Complete Payment Flow Example](#complete-payment-flow-example)
9. [Error Handling](#error-handling)
10. [References](#references)

---

## Setup and Configuration

### Prerequisites

Before using these API modules, ensure you have:

1. **Node.js** installed (v18 or higher recommended)
2. **@interledger/open-payments** package installed
3. A wallet address on an Open Payments-enabled wallet (e.g., [Interledger Test Wallet](https://ilp.interledger-test.dev))
4. A private key and key ID for authentication

### Configuration Object

All API functions require a configuration object with the following structure:

```javascript
const config = {
  walletAddressUrl: "https://ilp.interledger-test.dev/eb37db34",
  privateKeyPath: "private.key",
  keyId: "e2903c1f-a02c-4ee2-aa8d-c2ea0d064180"
};
```

**Your Private Key** (save this as `private.key` in your backend directory):
```
-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIIq7AvSyap022BGGlXzKeIywsxJAwt0m2iP1f4NobVNQ
-----END PRIVATE KEY-----
```

> ⚠️ **Security Note**: This is a test wallet. Never commit private keys to version control or expose them in production environments.

### Installation

```bash
cd backend
pnpm install @interledger/open-payments express
```

---

## Wallet Address Operations

**Module:** `walletAddress.js`

### Get Wallet Address Information

Retrieves public information about a wallet address, including authorization server URL, resource server URL, asset details, and supported payment methods.

```javascript
import { getWalletAddressInfo } from './api/walletAddress.js';

const result = await getWalletAddressInfo(
  "https://ilp.interledger-test.dev/eb37db34",
  config
);

console.log(result.data);
// Returns:
// {
//   id: "https://ilp.interledger-test.dev/alice",
//   authServer: "https://auth.ilp.interledger-test.dev",
//   resourceServer: "https://resource.ilp.interledger-test.dev",
//   assetCode: "USD",
//   assetScale: 2
// }
```

**Use Cases:**
- Validate a wallet address before initiating payment
- Discover authorization and resource server URLs
- Get asset information for amount calculations

### Get Wallet Address Keys

Retrieves the public keys bound to a wallet address for verification purposes.

```javascript
import { getWalletAddressKeys } from './api/walletAddress.js';

const result = await getWalletAddressKeys(
  "https://ilp.interledger-test.dev/eb37db34",
  config
);
```

### Validate Multiple Wallet Addresses

Batch validation of multiple wallet addresses.

```javascript
import { validateWalletAddresses } from './api/walletAddress.js';

const walletAddresses = [
  "https://ilp.interledger-test.dev/alice",
  "https://ilp.interledger-test.dev/bob",
  "https://ilp.interledger-test.dev/charlie"
];

const result = await validateWalletAddresses(walletAddresses, config);
```

---

## Grant Management

**Module:** `grants.js`

Grants are permissions that allow clients to perform operations on behalf of a wallet holder. The Open Payments protocol uses GNAP (Grant Negotiation and Authorization Protocol) for authorization.

### Request Incoming Payment Grant

Requests permission to create incoming payments on a wallet.

```javascript
import { requestIncomingPaymentGrant } from './api/grants.js';

const walletAddress = await getWalletAddressInfo(receiverUrl, config);
const grant = await requestIncomingPaymentGrant(
  walletAddress.data.authServer,
  config
);

if (grant.isFinalized) {
  const accessToken = grant.data.access_token.value;
  // Use this token to create incoming payments
}
```

### Request Quote Grant

Requests permission to create quotes for payment estimates.

```javascript
import { requestQuoteGrant } from './api/grants.js';

const walletAddress = await getWalletAddressInfo(senderUrl, config);
const grant = await requestQuoteGrant(
  walletAddress.data.authServer,
  config
);
```

### Request Outgoing Payment Grant

Requests permission to create outgoing payments with specified limits. This grant typically requires user interaction.

```javascript
import { requestOutgoingPaymentGrant } from './api/grants.js';

const debitAmount = {
  assetCode: "USD",
  assetScale: 2,
  value: "1000" // $10.00
};

const grant = await requestOutgoingPaymentGrant(
  walletAddress.data.authServer,
  walletAddress.data.id,
  debitAmount,
  config,
  true // requireInteraction
);

if (grant.isPending) {
  // User needs to authorize via grant.data.interact.redirect
  console.log("Please authorize at:", grant.data.interact.redirect);
}
```

### Continue Grant (After User Authorization)

After a user authorizes a pending grant, continue to finalize it.

```javascript
import { continueGrant } from './api/grants.js';

const finalizedGrant = await continueGrant(
  grant.data.continue.uri,
  grant.data.continue.access_token.value,
  config
);

const accessToken = finalizedGrant.data.access_token.value;
```

### Revoke Grant

Revoke a grant to remove access permissions.

```javascript
import { revokeGrant } from './api/grants.js';

const result = await revokeGrant(
  grant.data.manage,
  grant.data.access_token.value,
  config
);
```

---

## Incoming Payments

**Module:** `incomingPayment.js`

Incoming payments represent a payment that a wallet address expects to receive.

### Create Incoming Payment

```javascript
import { createIncomingPayment } from './api/incomingPayment.js';

const paymentDetails = {
  walletAddress: receiverWalletAddress.id,
  incomingAmount: {
    assetCode: "USD",
    assetScale: 2,
    value: "5000" // $50.00
  },
  description: "Payment for services",
  externalRef: "ORDER-12345"
};

const result = await createIncomingPayment(
  receiverWalletAddress.resourceServer,
  incomingPaymentAccessToken,
  paymentDetails,
  config
);

console.log(result.data.id); // Use this as receiver in quote
```

### Get Incoming Payment

Retrieve details of a specific incoming payment.

```javascript
import { getIncomingPayment } from './api/incomingPayment.js';

const result = await getIncomingPayment(
  incomingPaymentUrl,
  accessToken,
  config
);

console.log(result.data.receivedAmount); // Amount received so far
```

### List Incoming Payments

List all incoming payments for a wallet address with pagination.

```javascript
import { listIncomingPayments } from './api/incomingPayment.js';

const result = await listIncomingPayments(
  walletAddressUrl,
  accessToken,
  config,
  { first: 10 } // Pagination: get first 10
);

console.log(result.data.result); // Array of incoming payments
```

### Complete Incoming Payment

Mark an incoming payment as complete to prevent further payments.

```javascript
import { completeIncomingPayment } from './api/incomingPayment.js';

const result = await completeIncomingPayment(
  incomingPaymentUrl,
  accessToken,
  config
);
```

---

## Quotes

**Module:** `quotes.js`

Quotes provide estimates for the cost of a payment, including fees and exchange rates.

### Create Quote

Create a quote for a payment. You can specify either a fixed send amount or a fixed receive amount, but not both.

```javascript
import { createQuote } from './api/quotes.js';

const quoteDetails = {
  walletAddress: senderWalletAddress.id,
  receiver: incomingPayment.id, // Incoming payment URL
  method: "ilp",
  receiveAmount: {
    assetCode: "USD",
    assetScale: 2,
    value: "5000" // Receiver gets $50.00
  }
};

const result = await createQuote(
  senderWalletAddress.resourceServer,
  quoteAccessToken,
  quoteDetails,
  config
);

console.log(result.data.debitAmount); // Amount sender will pay (includes fees)
```

### Create Quote with Fixed Send Amount

Helper function for when you know how much the sender wants to send.

```javascript
import { createQuoteWithFixedSend } from './api/quotes.js';

const debitAmount = {
  assetCode: "USD",
  assetScale: 2,
  value: "5500" // Sender pays $55.00
};

const result = await createQuoteWithFixedSend(
  resourceServerUrl,
  accessToken,
  senderWalletAddress.id,
  incomingPayment.id,
  debitAmount,
  config
);

console.log(result.data.receiveAmount); // How much receiver gets after fees
```

### Create Quote with Fixed Receive Amount

Helper function for when you know how much the receiver should receive.

```javascript
import { createQuoteWithFixedReceive } from './api/quotes.js';

const receiveAmount = {
  assetCode: "USD",
  assetScale: 2,
  value: "5000" // Receiver gets $50.00
};

const result = await createQuoteWithFixedReceive(
  resourceServerUrl,
  accessToken,
  senderWalletAddress.id,
  incomingPayment.id,
  receiveAmount,
  config
);

console.log(result.data.debitAmount); // How much sender pays (includes fees)
```

### Get Quote

Retrieve details of a specific quote.

```javascript
import { getQuote } from './api/quotes.js';

const result = await getQuote(quoteUrl, accessToken, config);
```

---

## Outgoing Payments

**Module:** `outgoingPayment.js`

Outgoing payments represent a payment being sent from a wallet address.

### Create Outgoing Payment

Execute a payment based on a previously created quote.

```javascript
import { createOutgoingPayment } from './api/outgoingPayment.js';

const paymentDetails = {
  walletAddress: senderWalletAddress.id,
  quoteId: quote.id,
  metadata: {
    description: "Payment for Order #12345"
  }
};

const result = await createOutgoingPayment(
  senderWalletAddress.resourceServer,
  outgoingPaymentAccessToken,
  paymentDetails,
  config
);

console.log(result.data); // Payment details including status
```

### Get Outgoing Payment

Check the status of an outgoing payment.

```javascript
import { getOutgoingPayment } from './api/outgoingPayment.js';

const result = await getOutgoingPayment(
  outgoingPaymentUrl,
  accessToken,
  config
);

console.log(result.data.sentAmount); // Amount sent so far
console.log(result.data.failed); // Whether payment failed
```

### List Outgoing Payments

List all outgoing payments for a wallet address.

```javascript
import { listOutgoingPayments } from './api/outgoingPayment.js';

const result = await listOutgoingPayments(
  walletAddressUrl,
  accessToken,
  config,
  { first: 20 } // Get first 20 payments
);
```

---

## Token Management

**Module:** `tokens.js`

Manage access token lifecycle including rotation and revocation.

### Rotate Access Token

Rotate a token before it expires to get a new one with fresh expiration.

```javascript
import { rotateAccessToken } from './api/tokens.js';

const result = await rotateAccessToken(
  grant.data.access_token.manage,
  currentAccessToken,
  config
);

const newAccessToken = result.data.access_token.value;
```

### Revoke Access Token

Immediately invalidate an access token.

```javascript
import { revokeAccessToken } from './api/tokens.js';

const result = await revokeAccessToken(
  grant.data.access_token.manage,
  accessToken,
  config
);
```

---

## Complete Payment Flow Example

Here's a complete example showing how to send a payment from Alice to Bob:

```javascript
import { getWalletAddressInfo } from './api/walletAddress.js';
import {
  requestIncomingPaymentGrant,
  requestQuoteGrant,
  requestOutgoingPaymentGrant,
  continueGrant
} from './api/grants.js';
import { createIncomingPayment } from './api/incomingPayment.js';
import { createQuote } from './api/quotes.js';
import { createOutgoingPayment } from './api/outgoingPayment.js';

async function sendPayment(senderUrl, receiverUrl, amount, config) {
  try {
    // 1. Get wallet address information
    const senderWallet = await getWalletAddressInfo(senderUrl, config);
    const receiverWallet = await getWalletAddressInfo(receiverUrl, config);

    // 2. Request incoming payment grant for receiver
    const incomingGrant = await requestIncomingPaymentGrant(
      receiverWallet.data.authServer,
      config
    );

    // 3. Create incoming payment
    const incomingPayment = await createIncomingPayment(
      receiverWallet.data.resourceServer,
      incomingGrant.data.access_token.value,
      {
        walletAddress: receiverWallet.data.id,
        incomingAmount: {
          assetCode: receiverWallet.data.assetCode,
          assetScale: receiverWallet.data.assetScale,
          value: amount
        }
      },
      config
    );

    // 4. Request quote grant for sender
    const quoteGrant = await requestQuoteGrant(
      senderWallet.data.authServer,
      config
    );

    // 5. Create quote
    const quote = await createQuote(
      senderWallet.data.resourceServer,
      quoteGrant.data.access_token.value,
      {
        walletAddress: senderWallet.data.id,
        receiver: incomingPayment.data.id,
        method: "ilp"
      },
      config
    );

    // 6. Request outgoing payment grant
    const outgoingGrant = await requestOutgoingPaymentGrant(
      senderWallet.data.authServer,
      senderWallet.data.id,
      quote.data.debitAmount,
      config,
      true
    );

    // 7. Handle user authorization (if needed)
    if (outgoingGrant.isPending) {
      console.log("Please authorize at:", outgoingGrant.data.interact.redirect);
      // Wait for user authorization...
      // In a web app, redirect user to the URL and handle callback
    }

    // 8. Continue grant after authorization
    const finalizedGrant = await continueGrant(
      outgoingGrant.data.continue.uri,
      outgoingGrant.data.continue.access_token.value,
      config
    );

    // 9. Create outgoing payment
    const outgoingPayment = await createOutgoingPayment(
      senderWallet.data.resourceServer,
      finalizedGrant.data.access_token.value,
      {
        walletAddress: senderWallet.data.id,
        quoteId: quote.data.id
      },
      config
    );

    console.log("Payment completed successfully!");
    return {
      success: true,
      outgoingPayment: outgoingPayment.data,
      incomingPayment: incomingPayment.data
    };

  } catch (error) {
    console.error("Payment failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Usage
const config = {
  walletAddressUrl: "https://ilp.interledger-test.dev/eb37db34",
  privateKeyPath: "private.key",
  keyId: "e2903c1f-a02c-4ee2-aa8d-c2ea0d064180"
};

sendPayment(
  "https://ilp.interledger-test.dev/eb37db34",
  "https://ilp.interledger-test.dev/bob",
  "5000", // $50.00
  config
);
```

---

## Error Handling

All API functions return a consistent response format:

### Success Response

```javascript
{
  success: true,
  data: { /* API response data */ }
}
```

### Error Response

```javascript
{
  success: false,
  error: "Error message describing what went wrong"
}
```

### Best Practices

1. **Always check the `success` field** before accessing `data`
2. **Handle network errors gracefully** - implement retry logic with exponential backoff
3. **Validate wallet addresses** before initiating payments
4. **Check grant status** - some grants require user interaction
5. **Store tokens securely** - never expose access tokens in logs or client-side code
6. **Implement proper token rotation** - rotate tokens before they expire
7. **Use appropriate error messages** - provide user-friendly error messages in production

### Common Error Scenarios

```javascript
// Example error handling pattern
async function safePaymentOperation() {
  const result = await createOutgoingPayment(url, token, details, config);
  
  if (!result.success) {
    if (result.error.includes("insufficient funds")) {
      // Handle insufficient funds
      return { error: "Not enough balance" };
    } else if (result.error.includes("expired")) {
      // Handle expired token
      return { error: "Session expired, please try again" };
    } else {
      // Generic error
      return { error: "Payment failed, please contact support" };
    }
  }
  
  return result;
}
```

---

## References

### Official Documentation

- [Open Payments Documentation](https://openpayments.dev/)
- [Open Payments SDK](https://openpayments.dev/sdk/wallet-get-info/)
- [API Specifications](https://openpayments.dev/api-specifications/)
- [Interledger Foundation](https://interledger.org/)

### Key Concepts

- **Wallet Address**: A unique identifier for a payment account (e.g., `https://ilp.interledger-test.dev/alice`)
- **Grant**: Authorization to perform specific operations on a wallet
- **Quote**: An estimate of payment costs including fees and exchange rates
- **Incoming Payment**: A payment that a wallet expects to receive
- **Outgoing Payment**: A payment being sent from a wallet
- **ILP (Interledger Protocol)**: The underlying protocol for cross-ledger payments
- **GNAP**: Grant Negotiation and Authorization Protocol used for authorization

### Test Wallets

- [Interledger Test Wallet](https://ilp.interledger-test.dev) - Create test accounts with play money

### Asset Information

- **Asset Code**: Currency code (e.g., "USD", "EUR")
- **Asset Scale**: Number of decimal places (e.g., 2 for USD means cents)
- **Value**: Amount in smallest unit (e.g., "5000" with scale 2 = $50.00)

### Support and Community

- [GitHub Discussions](https://github.com/interledger/open-payments/discussions)
- [Slack Community](https://communityinviter.com/apps/interledger/interledger-working-groups-slack)

---

## Module Summary

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| `walletAddress.js` | Wallet validation and discovery | `getWalletAddressInfo`, `getWalletAddressKeys`, `validateWalletAddresses` |
| `grants.js` | Authorization management | `requestIncomingPaymentGrant`, `requestQuoteGrant`, `requestOutgoingPaymentGrant`, `continueGrant`, `revokeGrant` |
| `incomingPayment.js` | Receiving payments | `createIncomingPayment`, `getIncomingPayment`, `listIncomingPayments`, `completeIncomingPayment` |
| `quotes.js` | Payment estimation | `createQuote`, `getQuote`, `createQuoteWithFixedSend`, `createQuoteWithFixedReceive` |
| `outgoingPayment.js` | Sending payments | `createOutgoingPayment`, `getOutgoingPayment`, `listOutgoingPayments` |
| `tokens.js` | Token lifecycle | `rotateAccessToken`, `revokeAccessToken` |
| `payment.js` | Complete payment flow | `initiatePayment` (original implementation) |

---

## Version Information

- **Open Payments SDK Version**: ^7.1.3
- **Node.js Required**: >= 18.0.0
- **Documentation Version**: 1.0.0
- **Last Updated**: November 2025

---

## License

This project uses the Open Payments SDK which is licensed under Apache-2.0.

---

For questions or issues, please refer to the official [Open Payments documentation](https://openpayments.dev/) or create an issue in the project repository.

