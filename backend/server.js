import express from 'express';
import { initiatePayment } from './api/payment.js';

// Import Wallet Address operations
import {
  getWalletAddressInfo,
  getWalletAddressKeys,
  validateWalletAddresses
} from './api/walletAddress.js';

// Import Grant management
import {
  requestIncomingPaymentGrant,
  requestQuoteGrant,
  requestOutgoingPaymentGrant,
  continueGrant,
  revokeGrant
} from './api/grants.js';

// Import Incoming Payment operations
import {
  createIncomingPayment,
  getIncomingPayment,
  listIncomingPayments,
  completeIncomingPayment
} from './api/incomingPayment.js';

// Import Quote operations
import {
  createQuote,
  getQuote,
  createQuoteWithFixedSend,
  createQuoteWithFixedReceive
} from './api/quotes.js';

// Import Outgoing Payment operations
import {
  createOutgoingPayment,
  getOutgoingPayment,
  listOutgoingPayments
} from './api/outgoingPayment.js';

// Import Token management
import {
  rotateAccessToken,
  revokeAccessToken
} from './api/tokens.js';

// Import utilities
import { validateConfig, formatAmount } from './api/utils.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Default configuration (can be overridden in request body)
const defaultConfig = {
  walletAddressUrl: "https://ilp.interledger-test.dev/eb37db34",
  privateKeyPath: "private.key",
  keyId: "e2903c1f-a02c-4ee2-aa8d-c2ea0d064180"
};

// Helper function to get config from request
const getConfig = (req) => {
  return req.body.config || defaultConfig;
};

// ============================================================================
// HEALTH CHECK & INFO ENDPOINTS
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Space Sheeps Interledger API',
    version: '1.0.0',
    description: 'Open Payments API Integration',
    defaultWallet: defaultConfig.walletAddressUrl,
    endpoints: {
      walletAddress: [
        'GET /api/wallet/info',
        'GET /api/wallet/keys',
        'POST /api/wallet/validate'
      ],
      grants: [
        'POST /api/grants/incoming-payment',
        'POST /api/grants/quote',
        'POST /api/grants/outgoing-payment',
        'POST /api/grants/continue',
        'DELETE /api/grants/revoke'
      ],
      incomingPayments: [
        'POST /api/incoming-payments',
        'GET /api/incoming-payments/:id',
        'GET /api/incoming-payments/list',
        'POST /api/incoming-payments/:id/complete'
      ],
      quotes: [
        'POST /api/quotes',
        'GET /api/quotes/:id',
        'POST /api/quotes/fixed-send',
        'POST /api/quotes/fixed-receive'
      ],
      outgoingPayments: [
        'POST /api/outgoing-payments',
        'GET /api/outgoing-payments/:id',
        'GET /api/outgoing-payments/list'
      ],
      tokens: [
        'POST /api/tokens/rotate',
        'DELETE /api/tokens/revoke'
      ],
      legacy: [
        'POST /api/payment'
      ]
    }
  });
});

// ============================================================================
// WALLET ADDRESS ENDPOINTS
// ============================================================================

/**
 * GET /api/wallet/info
 * Get wallet address information
 * Body: { walletAddressUrl: string, config?: object }
 */
app.post('/api/wallet/info', async (req, res) => {
  try {
    const { walletAddressUrl } = req.body;
    const config = getConfig(req);

    if (!walletAddressUrl) {
      return res.status(400).json({
        success: false,
        error: 'walletAddressUrl is required'
      });
    }

    const result = await getWalletAddressInfo(walletAddressUrl, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/wallet/keys
 * Get wallet address keys
 * Body: { walletAddressUrl: string, config?: object }
 */
app.post('/api/wallet/keys', async (req, res) => {
  try {
    const { walletAddressUrl } = req.body;
    const config = getConfig(req);

    if (!walletAddressUrl) {
      return res.status(400).json({
        success: false,
        error: 'walletAddressUrl is required'
      });
    }

    const result = await getWalletAddressKeys(walletAddressUrl, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/wallet/validate
 * Validate multiple wallet addresses
 * Body: { walletAddresses: string[], config?: object }
 */
app.post('/api/wallet/validate', async (req, res) => {
  try {
    const { walletAddresses } = req.body;
    const config = getConfig(req);

    if (!walletAddresses || !Array.isArray(walletAddresses)) {
      return res.status(400).json({
        success: false,
        error: 'walletAddresses array is required'
      });
    }

    const result = await validateWalletAddresses(walletAddresses, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// GRANT MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * POST /api/grants/incoming-payment
 * Request incoming payment grant
 * Body: { authServerUrl: string, config?: object }
 */
app.post('/api/grants/incoming-payment', async (req, res) => {
  try {
    const { authServerUrl } = req.body;
    const config = getConfig(req);

    if (!authServerUrl) {
      return res.status(400).json({
        success: false,
        error: 'authServerUrl is required'
      });
    }

    const result = await requestIncomingPaymentGrant(authServerUrl, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/grants/quote
 * Request quote grant
 * Body: { authServerUrl: string, config?: object }
 */
app.post('/api/grants/quote', async (req, res) => {
  try {
    const { authServerUrl } = req.body;
    const config = getConfig(req);

    if (!authServerUrl) {
      return res.status(400).json({
        success: false,
        error: 'authServerUrl is required'
      });
    }

    const result = await requestQuoteGrant(authServerUrl, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/grants/outgoing-payment
 * Request outgoing payment grant
 * Body: {
 *   authServerUrl: string,
 *   walletAddressId: string,
 *   debitAmount: object,
 *   requireInteraction?: boolean,
 *   config?: object
 * }
 */
app.post('/api/grants/outgoing-payment', async (req, res) => {
  try {
    const { authServerUrl, walletAddressId, debitAmount, requireInteraction = true } = req.body;
    const config = getConfig(req);

    if (!authServerUrl || !walletAddressId || !debitAmount) {
      return res.status(400).json({
        success: false,
        error: 'authServerUrl, walletAddressId, and debitAmount are required'
      });
    }

    const result = await requestOutgoingPaymentGrant(
      authServerUrl,
      walletAddressId,
      debitAmount,
      config,
      requireInteraction
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/grants/continue
 * Continue a grant request
 * Body: { continueUri: string, continueAccessToken: string, config?: object }
 */
app.post('/api/grants/continue', async (req, res) => {
  try {
    const { continueUri, continueAccessToken } = req.body;
    const config = getConfig(req);

    if (!continueUri || !continueAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'continueUri and continueAccessToken are required'
      });
    }

    const result = await continueGrant(continueUri, continueAccessToken, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/grants/revoke
 * Revoke a grant
 * Body: { grantUrl: string, accessToken: string, config?: object }
 */
app.delete('/api/grants/revoke', async (req, res) => {
  try {
    const { grantUrl, accessToken } = req.body;
    const config = getConfig(req);

    if (!grantUrl || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'grantUrl and accessToken are required'
      });
    }

    const result = await revokeGrant(grantUrl, accessToken, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// INCOMING PAYMENT ENDPOINTS
// ============================================================================

/**
 * POST /api/incoming-payments
 * Create an incoming payment
 * Body: {
 *   resourceServerUrl: string,
 *   accessToken: string,
 *   paymentDetails: object,
 *   config?: object
 * }
 */
app.post('/api/incoming-payments', async (req, res) => {
  try {
    const { resourceServerUrl, accessToken, paymentDetails } = req.body;
    const config = getConfig(req);

    if (!resourceServerUrl || !accessToken || !paymentDetails) {
      return res.status(400).json({
        success: false,
        error: 'resourceServerUrl, accessToken, and paymentDetails are required'
      });
    }

    const result = await createIncomingPayment(
      resourceServerUrl,
      accessToken,
      paymentDetails,
      config
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/incoming-payments/get
 * Get an incoming payment
 * Body: { incomingPaymentUrl: string, accessToken: string, config?: object }
 */
app.post('/api/incoming-payments/get', async (req, res) => {
  try {
    const { incomingPaymentUrl, accessToken } = req.body;
    const config = getConfig(req);

    if (!incomingPaymentUrl || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'incomingPaymentUrl and accessToken are required'
      });
    }

    const result = await getIncomingPayment(incomingPaymentUrl, accessToken, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/incoming-payments/list
 * List incoming payments
 * Body: {
 *   walletAddressUrl: string,
 *   accessToken: string,
 *   pagination?: object,
 *   config?: object
 * }
 */
app.post('/api/incoming-payments/list', async (req, res) => {
  try {
    const { walletAddressUrl, accessToken, pagination = {} } = req.body;
    const config = getConfig(req);

    if (!walletAddressUrl || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'walletAddressUrl and accessToken are required'
      });
    }

    const result = await listIncomingPayments(
      walletAddressUrl,
      accessToken,
      config,
      pagination
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/incoming-payments/complete
 * Complete an incoming payment
 * Body: { incomingPaymentUrl: string, accessToken: string, config?: object }
 */
app.post('/api/incoming-payments/complete', async (req, res) => {
  try {
    const { incomingPaymentUrl, accessToken } = req.body;
    const config = getConfig(req);

    if (!incomingPaymentUrl || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'incomingPaymentUrl and accessToken are required'
      });
    }

    const result = await completeIncomingPayment(incomingPaymentUrl, accessToken, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// QUOTE ENDPOINTS
// ============================================================================

/**
 * POST /api/quotes
 * Create a quote
 * Body: {
 *   resourceServerUrl: string,
 *   accessToken: string,
 *   quoteDetails: object,
 *   config?: object
 * }
 */
app.post('/api/quotes', async (req, res) => {
  try {
    const { resourceServerUrl, accessToken, quoteDetails } = req.body;
    const config = getConfig(req);

    if (!resourceServerUrl || !accessToken || !quoteDetails) {
      return res.status(400).json({
        success: false,
        error: 'resourceServerUrl, accessToken, and quoteDetails are required'
      });
    }

    const result = await createQuote(
      resourceServerUrl,
      accessToken,
      quoteDetails,
      config
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/quotes/get
 * Get a quote
 * Body: { quoteUrl: string, accessToken: string, config?: object }
 */
app.post('/api/quotes/get', async (req, res) => {
  try {
    const { quoteUrl, accessToken } = req.body;
    const config = getConfig(req);

    if (!quoteUrl || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'quoteUrl and accessToken are required'
      });
    }

    const result = await getQuote(quoteUrl, accessToken, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/quotes/fixed-send
 * Create a quote with fixed send amount
 * Body: {
 *   resourceServerUrl: string,
 *   accessToken: string,
 *   walletAddress: string,
 *   receiver: string,
 *   debitAmount: object,
 *   config?: object
 * }
 */
app.post('/api/quotes/fixed-send', async (req, res) => {
  try {
    const { resourceServerUrl, accessToken, walletAddress, receiver, debitAmount } = req.body;
    const config = getConfig(req);

    if (!resourceServerUrl || !accessToken || !walletAddress || !receiver || !debitAmount) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    const result = await createQuoteWithFixedSend(
      resourceServerUrl,
      accessToken,
      walletAddress,
      receiver,
      debitAmount,
      config
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/quotes/fixed-receive
 * Create a quote with fixed receive amount
 * Body: {
 *   resourceServerUrl: string,
 *   accessToken: string,
 *   walletAddress: string,
 *   receiver: string,
 *   receiveAmount: object,
 *   config?: object
 * }
 */
app.post('/api/quotes/fixed-receive', async (req, res) => {
  try {
    const { resourceServerUrl, accessToken, walletAddress, receiver, receiveAmount } = req.body;
    const config = getConfig(req);

    if (!resourceServerUrl || !accessToken || !walletAddress || !receiver || !receiveAmount) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    const result = await createQuoteWithFixedReceive(
      resourceServerUrl,
      accessToken,
      walletAddress,
      receiver,
      receiveAmount,
      config
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// OUTGOING PAYMENT ENDPOINTS
// ============================================================================

/**
 * POST /api/outgoing-payments
 * Create an outgoing payment
 * Body: {
 *   resourceServerUrl: string,
 *   accessToken: string,
 *   paymentDetails: object,
 *   config?: object
 * }
 */
app.post('/api/outgoing-payments', async (req, res) => {
  try {
    const { resourceServerUrl, accessToken, paymentDetails } = req.body;
    const config = getConfig(req);

    if (!resourceServerUrl || !accessToken || !paymentDetails) {
      return res.status(400).json({
        success: false,
        error: 'resourceServerUrl, accessToken, and paymentDetails are required'
      });
    }

    const result = await createOutgoingPayment(
      resourceServerUrl,
      accessToken,
      paymentDetails,
      config
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/outgoing-payments/get
 * Get an outgoing payment
 * Body: { outgoingPaymentUrl: string, accessToken: string, config?: object }
 */
app.post('/api/outgoing-payments/get', async (req, res) => {
  try {
    const { outgoingPaymentUrl, accessToken } = req.body;
    const config = getConfig(req);

    if (!outgoingPaymentUrl || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'outgoingPaymentUrl and accessToken are required'
      });
    }

    const result = await getOutgoingPayment(outgoingPaymentUrl, accessToken, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/outgoing-payments/list
 * List outgoing payments
 * Body: {
 *   walletAddressUrl: string,
 *   accessToken: string,
 *   pagination?: object,
 *   config?: object
 * }
 */
app.post('/api/outgoing-payments/list', async (req, res) => {
  try {
    const { walletAddressUrl, accessToken, pagination = {} } = req.body;
    const config = getConfig(req);

    if (!walletAddressUrl || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'walletAddressUrl and accessToken are required'
      });
    }

    const result = await listOutgoingPayments(
      walletAddressUrl,
      accessToken,
      config,
      pagination
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// TOKEN MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * POST /api/tokens/rotate
 * Rotate an access token
 * Body: { tokenManagementUrl: string, currentAccessToken: string, config?: object }
 */
app.post('/api/tokens/rotate', async (req, res) => {
  try {
    const { tokenManagementUrl, currentAccessToken } = req.body;
    const config = getConfig(req);

    if (!tokenManagementUrl || !currentAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'tokenManagementUrl and currentAccessToken are required'
      });
    }

    const result = await rotateAccessToken(tokenManagementUrl, currentAccessToken, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/tokens/revoke
 * Revoke an access token
 * Body: { tokenManagementUrl: string, accessToken: string, config?: object }
 */
app.delete('/api/tokens/revoke', async (req, res) => {
  try {
    const { tokenManagementUrl, accessToken } = req.body;
    const config = getConfig(req);

    if (!tokenManagementUrl || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'tokenManagementUrl and accessToken are required'
      });
    }

    const result = await revokeAccessToken(tokenManagementUrl, accessToken, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// LEGACY ENDPOINT (Original implementation)
// ============================================================================

/**
 * POST /api/payment
 * Legacy: Initiate a complete payment flow
 * Body: { amount: string, user: string }
 */
app.post('/api/payment', async (req, res) => {
  try {
    const { amount, user } = req.body;

    if (!amount || !user) {
      return res.status(400).json({
        success: false,
        error: 'amount and user are required'
      });
    }

    const result = await initiatePayment(amount, user);
    res.json({
      success: true,
      message: 'Payment initiated',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: 'Visit /api/info for available endpoints'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   Space Sheeps Interledger API Server                 ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API Info: http://localhost:${PORT}/api/info`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`\n📖 Default Wallet: ${defaultConfig.walletAddressUrl}`);
  console.log('\n✨ Ready to handle Open Payments requests!\n');
});
