# Open Payments API Modules

A comprehensive set of Node.js modules for interacting with the Open Payments API, part of the Space Sheeps Interledger project.

## 📁 Project Structure

```
backend/api/
├── payment.js              # Original payment implementation (complete flow)
├── walletAddress.js        # Wallet address operations
├── grants.js               # Grant management (authorization)
├── incomingPayment.js      # Receiving payments
├── quotes.js               # Payment cost estimation
├── outgoingPayment.js      # Sending payments
├── tokens.js               # Token lifecycle management
├── utils.js                # Helper utilities
├── examples.js             # Usage examples
├── API_DOCUMENTATION.md    # Comprehensive API documentation
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Installation

```bash
cd backend
pnpm install
```

### 2. Configuration

Create your configuration object:

```javascript
const config = {
  walletAddressUrl: "https://ilp.interledger-test.dev/your-wallet",
  privateKeyPath: "path/to/private.key",
  keyId: "your-key-id-uuid"
};
```

### 3. Basic Usage

```javascript
import { getWalletAddressInfo } from './api/walletAddress.js';

const result = await getWalletAddressInfo(
  "https://ilp.interledger-test.dev/alice",
  config
);

if (result.success) {
  console.log(result.data);
}
```

## 📚 Available Modules

### Wallet Address (`walletAddress.js`)
Get information about wallet addresses, validate them, and retrieve public keys.

**Key Functions:**
- `getWalletAddressInfo(url, config)` - Get wallet information
- `getWalletAddressKeys(url, config)` - Get public keys
- `validateWalletAddresses(urls[], config)` - Validate multiple wallets

### Grants (`grants.js`)
Manage authorization grants for payments and quotes.

**Key Functions:**
- `requestIncomingPaymentGrant(authServerUrl, config)`
- `requestQuoteGrant(authServerUrl, config)`
- `requestOutgoingPaymentGrant(authServerUrl, walletId, amount, config)`
- `continueGrant(continueUri, token, config)`
- `revokeGrant(grantUrl, token, config)`

### Incoming Payments (`incomingPayment.js`)
Create and manage incoming payments (payment requests).

**Key Functions:**
- `createIncomingPayment(resourceServer, token, details, config)`
- `getIncomingPayment(paymentUrl, token, config)`
- `listIncomingPayments(walletUrl, token, config, pagination)`
- `completeIncomingPayment(paymentUrl, token, config)`

### Quotes (`quotes.js`)
Get payment cost estimates including fees and exchange rates.

**Key Functions:**
- `createQuote(resourceServer, token, details, config)`
- `getQuote(quoteUrl, token, config)`
- `createQuoteWithFixedSend(...)` - Fixed send amount
- `createQuoteWithFixedReceive(...)` - Fixed receive amount

### Outgoing Payments (`outgoingPayment.js`)
Execute payments from your wallet.

**Key Functions:**
- `createOutgoingPayment(resourceServer, token, details, config)`
- `getOutgoingPayment(paymentUrl, token, config)`
- `listOutgoingPayments(walletUrl, token, config, pagination)`

### Tokens (`tokens.js`)
Manage access token lifecycle.

**Key Functions:**
- `rotateAccessToken(managementUrl, token, config)`
- `revokeAccessToken(managementUrl, token, config)`

### Utilities (`utils.js`)
Helper functions for common operations.

**Key Functions:**
- `formatAmount(value, scale, code)` - Format display amounts
- `parseAmount(amount, scale)` - Convert to smallest unit
- `calculateFee(quote)` - Calculate payment fees
- `isPaymentComplete(payment)` - Check completion status
- `waitForPaymentCompletion(getFn, maxAttempts, interval)` - Poll for completion
- `retryWithBackoff(fn, maxRetries, delay)` - Retry with exponential backoff
- `validateConfig(config)` - Validate configuration

## 💡 Examples

See `examples.js` for complete working examples:

```javascript
import { runAllExamples } from './api/examples.js';

// Run all examples
await runAllExamples();

// Or run individual examples
import {
  example1_getWalletInfo,
  example2_validateMultipleWallets,
  example3_createIncomingPayment,
  example4_createQuote,
  example5_listIncomingPayments,
  example7_rotateToken
} from './api/examples.js';

await example1_getWalletInfo();
```

## 🔄 Complete Payment Flow

Here's a simplified payment flow from sender to receiver:

```javascript
import { getWalletAddressInfo } from './api/walletAddress.js';
import { requestIncomingPaymentGrant, requestQuoteGrant, requestOutgoingPaymentGrant, continueGrant } from './api/grants.js';
import { createIncomingPayment } from './api/incomingPayment.js';
import { createQuote } from './api/quotes.js';
import { createOutgoingPayment } from './api/outgoingPayment.js';

// 1. Get wallet information
const senderWallet = await getWalletAddressInfo(senderUrl, config);
const receiverWallet = await getWalletAddressInfo(receiverUrl, config);

// 2. Create incoming payment (payment request)
const incomingGrant = await requestIncomingPaymentGrant(receiverWallet.data.authServer, config);
const incomingPayment = await createIncomingPayment(
  receiverWallet.data.resourceServer,
  incomingGrant.data.access_token.value,
  { walletAddress: receiverWallet.data.id, incomingAmount: { /*...*/ } },
  config
);

// 3. Create quote (get payment estimate)
const quoteGrant = await requestQuoteGrant(senderWallet.data.authServer, config);
const quote = await createQuote(
  senderWallet.data.resourceServer,
  quoteGrant.data.access_token.value,
  { walletAddress: senderWallet.data.id, receiver: incomingPayment.data.id, method: "ilp" },
  config
);

// 4. Request outgoing payment grant (requires user authorization)
const outgoingGrant = await requestOutgoingPaymentGrant(
  senderWallet.data.authServer,
  senderWallet.data.id,
  quote.data.debitAmount,
  config,
  true
);

// 5. User authorizes at: outgoingGrant.data.interact.redirect
// After authorization, continue grant:
const finalizedGrant = await continueGrant(
  outgoingGrant.data.continue.uri,
  outgoingGrant.data.continue.access_token.value,
  config
);

// 6. Execute payment
const outgoingPayment = await createOutgoingPayment(
  senderWallet.data.resourceServer,
  finalizedGrant.data.access_token.value,
  { walletAddress: senderWallet.data.id, quoteId: quote.data.id },
  config
);
```

## 🛠️ Response Format

All API functions return a consistent response format:

**Success:**
```javascript
{
  success: true,
  data: { /* API response data */ }
}
```

**Error:**
```javascript
{
  success: false,
  error: "Error message"
}
```

Always check the `success` field before accessing `data`.

## 🧪 Testing

Use the [Interledger Test Wallet](https://ilp.interledger-test.dev) to create test accounts with play money.

### Create a Test Wallet

1. Visit https://ilp.interledger-test.dev
2. Click "Create Account"
3. Note your wallet address URL
4. Generate a key pair in the settings
5. Use the key ID and download the private key

## 📖 Full Documentation

For complete API documentation, see:
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with all parameters and examples
- **[Open Payments Docs](https://openpayments.dev/)** - Official Open Payments documentation

## 🔐 Security Best Practices

1. **Never commit private keys** - Add `*.key` to `.gitignore`
2. **Store tokens securely** - Don't expose access tokens in logs
3. **Rotate tokens regularly** - Use `rotateAccessToken()` before expiration
4. **Validate wallet addresses** - Always validate before payments
5. **Handle errors gracefully** - Implement retry logic with backoff
6. **Use HTTPS only** - All wallet addresses must use HTTPS

## 🐛 Error Handling

```javascript
import { retryWithBackoff } from './api/utils.js';

// Automatic retry with exponential backoff
const result = await retryWithBackoff(
  async () => await createQuote(url, token, details, config),
  3, // max retries
  1000 // initial delay (ms)
);

if (!result.success) {
  console.error("Failed after retries:", result.error);
}
```

## 🔗 Related Resources

- [Open Payments SDK](https://openpayments.dev/sdk/wallet-get-info/)
- [Interledger Protocol](https://interledger.org/)
- [Test Wallet](https://ilp.interledger-test.dev)
- [GitHub Discussions](https://github.com/interledger/open-payments/discussions)

## 📝 License

This project uses the Open Payments SDK which is licensed under Apache-2.0.

## 🤝 Contributing

When adding new API endpoints:

1. Create or update the appropriate module file
2. Add JSDoc comments for all functions
3. Follow the consistent response format
4. Add examples to `examples.js`
5. Update documentation

## ⚡ Quick Reference

| Task | Module | Function |
|------|--------|----------|
| Get wallet info | `walletAddress.js` | `getWalletAddressInfo()` |
| Request payment | `incomingPayment.js` | `createIncomingPayment()` |
| Get quote | `quotes.js` | `createQuote()` |
| Send payment | `outgoingPayment.js` | `createOutgoingPayment()` |
| List payments | `incomingPayment.js` / `outgoingPayment.js` | `listIncomingPayments()` / `listOutgoingPayments()` |
| Manage tokens | `tokens.js` | `rotateAccessToken()` / `revokeAccessToken()` |

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Maintainer:** Space Sheeps Interledger Team

