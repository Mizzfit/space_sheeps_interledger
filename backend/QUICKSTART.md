# Quick Start Guide

This guide will help you get started with the Open Payments API modules using your configured test wallet.

## 🔑 Your Credentials

Your test wallet is already configured in the codebase:

- **Wallet Address**: `https://ilp.interledger-test.dev/eb37db34`
- **Key ID**: `e2903c1f-a02c-4ee2-aa8d-c2ea0d064180`
- **Private Key**: Located in `backend/private.key` ✅

> ⚠️ **Important**: The `private.key` file is already created. Make sure it's in your `.gitignore` file!

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd backend
pnpm install
```

### Step 2: Test Your Setup

Run a simple test to verify your wallet connection:

```bash
node --input-type=module --eval "
import { getWalletAddressInfo } from './api/walletAddress.js';

const config = {
  walletAddressUrl: 'https://ilp.interledger-test.dev/eb37db34',
  privateKeyPath: 'private.key',
  keyId: 'e2903c1f-a02c-4ee2-aa8d-c2ea0d064180'
};

const result = await getWalletAddressInfo(
  'https://ilp.interledger-test.dev/eb37db34',
  config
);

if (result.success) {
  console.log('✅ Connection successful!');
  console.log('Wallet ID:', result.data.id);
  console.log('Asset:', result.data.assetCode);
} else {
  console.error('❌ Connection failed:', result.error);
}
"
```

### Step 3: Run Examples

```bash
# Run all examples
node --input-type=module --eval "import('./api/examples.js').then(m => m.runAllExamples())"

# Or run individual examples
node --input-type=module --eval "import('./api/examples.js').then(m => m.example1_getWalletInfo())"
node --input-type=module --eval "import('./api/examples.js').then(m => m.example3_createIncomingPayment())"
```

## 📚 Common Operations

### Get Your Wallet Information

```javascript
import { getWalletAddressInfo } from './api/walletAddress.js';

const config = {
  walletAddressUrl: "https://ilp.interledger-test.dev/eb37db34",
  privateKeyPath: "private.key",
  keyId: "e2903c1f-a02c-4ee2-aa8d-c2ea0d064180"
};

const wallet = await getWalletAddressInfo(
  "https://ilp.interledger-test.dev/eb37db34",
  config
);

console.log(wallet.data);
```

### Create a Payment Request

```javascript
import { getWalletAddressInfo } from './api/walletAddress.js';
import { requestIncomingPaymentGrant } from './api/grants.js';
import { createIncomingPayment } from './api/incomingPayment.js';

const config = {
  walletAddressUrl: "https://ilp.interledger-test.dev/eb37db34",
  privateKeyPath: "private.key",
  keyId: "e2903c1f-a02c-4ee2-aa8d-c2ea0d064180"
};

// Get wallet info
const wallet = await getWalletAddressInfo(
  "https://ilp.interledger-test.dev/eb37db34",
  config
);

// Request grant
const grant = await requestIncomingPaymentGrant(
  wallet.data.authServer,
  config
);

// Create payment request for $50.00
const payment = await createIncomingPayment(
  wallet.data.resourceServer,
  grant.data.access_token.value,
  {
    walletAddress: wallet.data.id,
    incomingAmount: {
      assetCode: wallet.data.assetCode,
      assetScale: wallet.data.assetScale,
      value: "5000" // $50.00
    },
    description: "Test payment"
  },
  config
);

console.log("Payment URL:", payment.data.id);
```

## 🎯 Next Steps

1. **Explore Examples**: Check out `api/examples.js` for more working code
2. **Read Documentation**: See `api/API_DOCUMENTATION.md` for complete API reference
3. **Build Your Integration**: Use the modules in `api/` directory

## 📖 Available Modules

| Module | Purpose |
|--------|---------|
| `walletAddress.js` | Get wallet info, validate addresses |
| `grants.js` | Request and manage authorization grants |
| `incomingPayment.js` | Create and manage payment requests |
| `quotes.js` | Get payment cost estimates |
| `outgoingPayment.js` | Send payments |
| `tokens.js` | Rotate and revoke tokens |
| `utils.js` | Helper functions |

## 🔗 Resources

- **Your Test Wallet**: https://ilp.interledger-test.dev/eb37db34
- **API Documentation**: `api/API_DOCUMENTATION.md`
- **Examples**: `api/examples.js`
- **Open Payments Docs**: https://openpayments.dev/

## 💡 Tips

1. All functions return `{success: true, data: {...}}` or `{success: false, error: "..."}`
2. Always check `result.success` before accessing `result.data`
3. Use the examples as templates for your own code
4. The configuration is already set up in all example files

## 🆘 Troubleshooting

### Error: "Cannot find module"
Make sure you're in the `backend` directory and have run `pnpm install`

### Error: "Private key not found"
The `private.key` file should be in the `backend` directory (already created)

### Error: "Invalid credentials"
Verify your credentials at: https://ilp.interledger-test.dev/eb37db34

## ✅ Checklist

- [x] Private key file created (`backend/private.key`)
- [x] Configuration set in all example files
- [x] Dependencies ready to install (`pnpm install`)
- [ ] Run your first test (Step 2 above)
- [ ] Explore the examples
- [ ] Build your integration

---

**You're all set!** 🚀 Start with Step 2 to test your connection.

