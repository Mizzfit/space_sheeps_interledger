# Open Payments API Integration Guide

Welcome to the Space Sheeps Interledger Open Payments API integration! This guide provides a quick overview of the new API modules created for interacting with Open Payments endpoints.

## 📦 What's Been Created

A comprehensive set of modular API files have been created in the `backend/api/` directory to interact with Open Payments endpoints:

### Core API Modules

| File | Purpose | Key Functions |
|------|---------|---------------|
| **`walletAddress.js`** | Wallet information & validation | Get wallet info, validate addresses, get keys |
| **`grants.js`** | Authorization & permissions | Request grants, continue grants, revoke grants |
| **`incomingPayment.js`** | Receive payments | Create, get, list, and complete incoming payments |
| **`quotes.js`** | Payment cost estimation | Create quotes with fixed send/receive amounts |
| **`outgoingPayment.js`** | Send payments | Create, get, and list outgoing payments |
| **`tokens.js`** | Token management | Rotate and revoke access tokens |

### Supporting Files

| File | Purpose |
|------|---------|
| **`utils.js`** | Helper utilities for amount formatting, validation, retries, etc. |
| **`examples.js`** | Working examples demonstrating each API module |
| **`API_DOCUMENTATION.md`** | Complete API documentation with all parameters and use cases |
| **`README.md`** | Quick start guide and API reference |
| **`payment.js`** | Original payment implementation (preserved) |

## 🚀 Quick Start

### 1. Navigate to the API Directory

```bash
cd backend/api
```

### 2. View Documentation

Start with the README for a quick overview:
```bash
cat README.md
```

Or view the complete documentation:
```bash
cat API_DOCUMENTATION.md
```

### 3. Try Examples

```javascript
import { runAllExamples } from './api/examples.js';

// Run all examples
await runAllExamples();
```

## 🎯 Common Use Cases

### Get Wallet Information

```javascript
import { getWalletAddressInfo } from './api/walletAddress.js';

const config = {
  walletAddressUrl: "https://ilp.interledger-test.dev/your-wallet",
  privateKeyPath: "private.key",
  keyId: "your-key-id"
};

const result = await getWalletAddressInfo(
  "https://ilp.interledger-test.dev/alice",
  config
);
```

### Create a Payment Request

```javascript
import { getWalletAddressInfo } from './api/walletAddress.js';
import { requestIncomingPaymentGrant } from './api/grants.js';
import { createIncomingPayment } from './api/incomingPayment.js';

// Get wallet info
const wallet = await getWalletAddressInfo(receiverUrl, config);

// Get authorization
const grant = await requestIncomingPaymentGrant(wallet.data.authServer, config);

// Create payment request
const payment = await createIncomingPayment(
  wallet.data.resourceServer,
  grant.data.access_token.value,
  {
    walletAddress: wallet.data.id,
    incomingAmount: {
      assetCode: "USD",
      assetScale: 2,
      value: "5000" // $50.00
    }
  },
  config
);
```

### Get a Quote

```javascript
import { requestQuoteGrant } from './api/grants.js';
import { createQuote } from './api/quotes.js';

const quoteGrant = await requestQuoteGrant(wallet.data.authServer, config);

const quote = await createQuote(
  wallet.data.resourceServer,
  quoteGrant.data.access_token.value,
  {
    walletAddress: senderWallet.id,
    receiver: incomingPaymentUrl,
    method: "ilp"
  },
  config
);

console.log("You'll pay:", quote.data.debitAmount.value);
console.log("They'll receive:", quote.data.receiveAmount.value);
```

## 📚 Documentation Structure

```
backend/api/
├── README.md                    ← Start here
│   - Quick start guide
│   - Module overview
│   - Basic examples
│
├── API_DOCUMENTATION.md         ← Complete reference
│   - Detailed API documentation
│   - All parameters explained
│   - Complete payment flow
│   - Error handling
│   - Best practices
│
├── examples.js                  ← Working code
│   - 7+ working examples
│   - Run with: runAllExamples()
│
└── [module files]               ← Implementation
    - walletAddress.js
    - grants.js
    - incomingPayment.js
    - quotes.js
    - outgoingPayment.js
    - tokens.js
    - utils.js
```

## 🔑 Key Concepts

### Open Payments Flow

1. **Wallet Address** → Get wallet information
2. **Grant** → Request authorization
3. **Incoming Payment** → Create payment request
4. **Quote** → Get cost estimate
5. **Outgoing Payment** → Execute payment

### Response Format

All functions return:
```javascript
{
  success: true,
  data: { /* result */ }
}
// or
{
  success: false,
  error: "error message"
}
```

### Amount Format

Amounts are in the smallest unit:
```javascript
{
  assetCode: "USD",
  assetScale: 2,
  value: "5000"  // = $50.00
}
```

## 🛠️ Utilities Available

The `utils.js` file provides helpful functions:

- `formatAmount()` - Display amounts nicely
- `parseAmount()` - Convert to smallest unit
- `calculateFee()` - Calculate payment fees
- `isPaymentComplete()` - Check payment status
- `waitForPaymentCompletion()` - Poll for completion
- `retryWithBackoff()` - Automatic retries
- `validateConfig()` - Validate configuration

## 🔗 Official Resources

- **Open Payments Docs**: https://openpayments.dev/
- **SDK Documentation**: https://openpayments.dev/sdk/wallet-get-info/
- **Test Wallet**: https://ilp.interledger-test.dev
- **Interledger**: https://interledger.org/

## 📖 Next Steps

1. **Read** `backend/api/README.md` for quick start
2. **Study** `backend/api/API_DOCUMENTATION.md` for complete reference
3. **Try** examples in `backend/api/examples.js`
4. **Build** your payment flows using the modules

## 🎓 Learning Path

**Beginner** → Start with wallet address operations
```javascript
import { getWalletAddressInfo, validateWalletAddresses } from './api/walletAddress.js';
```

**Intermediate** → Create incoming payments (payment requests)
```javascript
import { requestIncomingPaymentGrant } from './api/grants.js';
import { createIncomingPayment } from './api/incomingPayment.js';
```

**Advanced** → Complete payment flows with quotes
```javascript
import { createQuote } from './api/quotes.js';
import { createOutgoingPayment } from './api/outgoingPayment.js';
```

## 💡 Tips

1. Always check `result.success` before accessing `result.data`
2. Use the test wallet for development
3. Grants may require user authorization
4. Rotate tokens before they expire
5. Use utils.js helpers for common tasks

## 📞 Need Help?

- Check `backend/api/examples.js` for working code
- Read `backend/api/API_DOCUMENTATION.md` for details
- Visit https://openpayments.dev/ for official docs
- Review the original `payment.js` for a complete flow example

---

Happy coding! 🚀

