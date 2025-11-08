# Space Sheeps Interledger

This is the code for the hackathon, featuring a comprehensive Open Payments API integration.

## 🚀 Quick Start

### Installation

```bash
cd backend
pnpm install
```

### Configuration

Configure your wallet credentials in your API calls:

```javascript
const config = {
  walletAddressUrl: "https://ilp.interledger-test.dev/your-wallet",
  privateKeyPath: "private.key",
  keyId: "your-key-id"
};
```

## 📚 API Documentation

We've created a complete set of modular API endpoints for Open Payments:

### Available Modules

- **`backend/api/walletAddress.js`** - Wallet information & validation
- **`backend/api/grants.js`** - Authorization & permission management
- **`backend/api/incomingPayment.js`** - Receiving payments
- **`backend/api/quotes.js`** - Payment cost estimation
- **`backend/api/outgoingPayment.js`** - Sending payments
- **`backend/api/tokens.js`** - Token lifecycle management
- **`backend/api/utils.js`** - Helper utilities
- **`backend/api/examples.js`** - Working code examples

### Documentation Files

- **[OPEN_PAYMENTS_API_GUIDE.md](./OPEN_PAYMENTS_API_GUIDE.md)** - Quick overview and getting started
- **[backend/api/README.md](./backend/api/README.md)** - API module reference
- **[backend/api/API_DOCUMENTATION.md](./backend/api/API_DOCUMENTATION.md)** - Complete API documentation

## 💡 Quick Example

```javascript
import { getWalletAddressInfo } from './backend/api/walletAddress.js';
import { requestIncomingPaymentGrant } from './backend/api/grants.js';
import { createIncomingPayment } from './backend/api/incomingPayment.js';

// Get wallet information
const wallet = await getWalletAddressInfo(walletUrl, config);

// Request authorization
const grant = await requestIncomingPaymentGrant(wallet.data.authServer, config);

// Create a payment request
const payment = await createIncomingPayment(
  wallet.data.resourceServer,
  grant.data.access_token.value,
  {
    walletAddress: wallet.data.id,
    incomingAmount: { assetCode: "USD", assetScale: 2, value: "5000" }
  },
  config
);
```

## 🔗 Resources

- [Open Payments Documentation](https://openpayments.dev/)
- [Interledger Test Wallet](https://ilp.interledger-test.dev)
- [Interledger Protocol](https://interledger.org/)

## 🏗️ Project Structure

```
space_sheeps_interledger/
├── backend/
│   ├── api/
│   │   ├── walletAddress.js       # Wallet operations
│   │   ├── grants.js              # Authorization
│   │   ├── incomingPayment.js     # Receive payments
│   │   ├── quotes.js              # Cost estimates
│   │   ├── outgoingPayment.js     # Send payments
│   │   ├── tokens.js              # Token management
│   │   ├── utils.js               # Utilities
│   │   ├── examples.js            # Examples
│   │   ├── payment.js             # Original implementation
│   │   ├── README.md              # API reference
│   │   └── API_DOCUMENTATION.md   # Full docs
│   ├── server.js
│   └── package.json
├── OPEN_PAYMENTS_API_GUIDE.md     # Getting started guide
└── README.md                      # This file
```

## 🎯 Features

- ✅ Complete Open Payments API integration
- ✅ Modular, reusable API functions
- ✅ Comprehensive documentation
- ✅ Working examples
- ✅ Utility helpers
- ✅ Error handling
- ✅ TypeScript-friendly JSDoc comments

## 🛠️ Development

### Run Examples

```bash
cd backend
node -e "import('./api/examples.js').then(m => m.runAllExamples())"
```

### Using the APIs

All API functions follow a consistent pattern:

```javascript
const result = await apiFunction(params, config);

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

## 📖 Learn More

Start with [OPEN_PAYMENTS_API_GUIDE.md](./OPEN_PAYMENTS_API_GUIDE.md) for a comprehensive introduction to the API modules.

---

**Hackathon Project** | **Powered by Open Payments & Interledger**
