import express from 'express';
import cors from 'cors';  // ← Agregar import
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Import Payment Link operations
import { generatePaymentLink } from './api/paymentLink.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Default configuration (can be overridden in request body)
const defaultConfig = {
  walletAddressUrl: "https://ilp.interledger-test.dev/seller_example",
  privateKeyPath: "private.key",
  keyId: "a56111ec-2936-45d7-b17b-9579dc77cfed"
};

// Helper function to get config from request
const getConfig = (req) => {
  if (req.body?.config) {
    return req.body.config;
  }

  if (req.query?.config) {
    if (typeof req.query.config === 'string') {
      try {
        return JSON.parse(req.query.config);
      } catch (error) {
        console.warn('Failed to parse config from query string:', error);
      }
    } else {
      return req.query.config;
    }
  }

  return defaultConfig;
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
      ],
      user: [
        'POST /api/user/login'
      ]
    }
  });
});

// dummy endpoint for login that only returns the same as reciveves
app.post('/api/user/login', (req, res) => {
  res.json({
    success: true,
    data: req.body
  });
});

// get products from products.json, if recieves a query search by title or description
app.post('/api/products', (req, res) => {
  const { query } = req.body;
  const productsPath = path.join(__dirname, 'products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  const filteredProducts = products.filter(product => product.title.includes(query) || product.description.includes(query));
  res.json(filteredProducts);
});

//add a product to products.json
app.post('/api/products/add', (req, res) => {
  try {
    const { product } = req.body;
    const productsPath = path.join(__dirname, 'products.json');
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    // Generate a random image ID from picsum (between 1 and 1084)
    const randomImageId = Math.floor(Math.random() * 1084) + 1;
    const imageUrl = `https://picsum.photos/id/${randomImageId}/400/300`;
    
    // Generate new ID based on existing products
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    
    // Create the new product with image and ID
    const newProduct = {
      id: newId,
      sellerWalletAddress: defaultConfig.walletAddressUrl,
      ...product,
      image: imageUrl
    };
    
    products.push(newProduct);
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
    res.json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// get product by id from products.json
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const productsPath = path.join(__dirname, 'products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  const product = products.find(p => p.id == id);
  res.json(product);
});

//webhook that receives product id and refereral id to referalJson
app.get('/api/referal/webhook', (req, res) => {
  try {
    //    productId   wallet coockie
    const { productId, refereralId } = req.query;
    
    // Validate required parameters
    if (!productId || !refereralId) {
      return res.status(400).json({
        success: false,
        error: 'productId and refereralId are required'
      });
    }
    
    const referalSalesPath = path.join(__dirname, 'referalSales.json');
    
    // Read existing referral sales data
    let referalSales = [];
    try {
      const fileContent = fs.readFileSync(referalSalesPath, 'utf8');
      if (fileContent.trim()) {
        referalSales = JSON.parse(fileContent);
      }
    } catch (error) {
      // File doesn't exist or is invalid JSON, start with empty array
      referalSales = [];
    }
    
    // Check if combination already exists
    const existingEntry = referalSales.find(
      entry => entry.productId === productId && entry.refereralId === refereralId
    );
    
    let currentCount;
    if (existingEntry) {
      // Increment count if entry exists
      existingEntry.count += 1;
      currentCount = existingEntry.count;
    } else {
      // Register new combination with count 1
      const newEntry = {
        productId,
        refereralId,
        count: 1
      };
      referalSales.push(newEntry);
      currentCount = 1;
    }
    
    // Write back to file
    fs.writeFileSync(referalSalesPath, JSON.stringify(referalSales, null, 2));
    
    res.json({
      success: true,
      productId,
      refereralId,
      count: currentCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

//Endpoint that generates a link to buy on openpayment that recieves referer id and product id (takes seller wallet from products.json)
// 95% of the price is the seller's price, 5% is the referral's price
app.get('/api/referal/link', async (req, res) => {
  try {
    const { productId, refererId } = req.query;

    if (!productId || !refererId) {
      return res.status(400).json({
        success: false,
        error: 'productId and refererId are required'
      });
    }

    const config = getConfig(req);

    const productsPath = path.join(__dirname, 'products.json');
    let products;
    try {
      const productsRaw = fs.readFileSync(productsPath, 'utf8');
      products = JSON.parse(productsRaw);
    } catch (error) {
      console.error('Error reading products catalog:', error);
      return res.status(500).json({
        success: false,
        error: 'Unable to load products catalog'
      });
    }

    const product = products.find((item) => String(item.id) === String(productId));
    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product with id ${productId} not found`
      });
    }

    if (!product.sellerWalletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Product does not have a seller wallet configured'
      });
    }

    const price = Number(product.price);
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Product price must be a positive number'
      });
    }

    const [sellerWalletInfo, referrerWalletInfo] = await Promise.all([
      getWalletAddressInfo(product.sellerWalletAddress, config),
      getWalletAddressInfo(refererId, config)
    ]);

    if (!sellerWalletInfo.success) {
      return res.status(502).json({
        success: false,
        error: `Unable to fetch seller wallet info: ${sellerWalletInfo.error || 'Unknown error'}`
      });
    }

    if (!referrerWalletInfo.success) {
      return res.status(502).json({
        success: false,
        error: `Unable to fetch referral wallet info: ${referrerWalletInfo.error || 'Unknown error'}`
      });
    }

    const sellerWallet = sellerWalletInfo.data;
    const refWallet = referrerWalletInfo.data;

    if (!sellerWallet || !refWallet) {
      return res.status(502).json({
        success: false,
        error: 'Wallet information could not be retrieved'
      });
    }

    if (!sellerWallet.assetCode || sellerWallet.assetScale === undefined) {
      return res.status(502).json({
        success: false,
        error: 'Seller wallet asset information is incomplete'
      });
    }

    if (!refWallet.assetCode || refWallet.assetScale === undefined) {
      return res.status(502).json({
        success: false,
        error: 'Referral wallet asset information is incomplete'
      });
    }

    if (
      sellerWallet.assetCode !== refWallet.assetCode ||
      sellerWallet.assetScale !== refWallet.assetScale
    ) {
      return res.status(400).json({
        success: false,
        error: 'Seller and referral wallets must share the same assetCode and assetScale'
      });
    }

    const assetScale = Number(sellerWallet.assetScale);
    if (!Number.isInteger(assetScale) || assetScale < 0) {
      return res.status(500).json({
        success: false,
        error: 'Invalid asset scale returned by wallet information'
      });
    }

    const scaleFactor = Math.pow(10, assetScale);
    const totalMinorAmount = Math.round(price * scaleFactor);
    const sellerMinorAmount = Math.floor(totalMinorAmount * 0.95);
    const referralMinorAmount = totalMinorAmount - sellerMinorAmount;

    if (sellerMinorAmount <= 0 || referralMinorAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Calculated split amounts must be greater than zero'
      });
    }

    const transactionId = `ref_${productId}_${Date.now()}_${crypto.randomBytes(5).toString('hex')}`;

    const sellerGrantResult = await requestIncomingPaymentGrant(sellerWallet.authServer, config);
    if (!sellerGrantResult.success) {
      return res.status(502).json({
        success: false,
        error: `Failed to obtain seller incoming payment grant: ${sellerGrantResult.error || 'Unknown error'}`
      });
    }

    if (!sellerGrantResult.isFinalized) {
      return res.status(409).json({
        success: false,
        error: 'Seller incoming payment grant requires user interaction to finalize',
        grant: sellerGrantResult.data
      });
    }

    const sellerAccessToken = sellerGrantResult.data?.access_token?.value;
    if (!sellerAccessToken) {
      return res.status(502).json({
        success: false,
        error: 'Seller incoming payment grant did not return an access token'
      });
    }

    const referrerGrantResult = await requestIncomingPaymentGrant(refWallet.authServer, config);
    if (!referrerGrantResult.success) {
      return res.status(502).json({
        success: false,
        error: `Failed to obtain referral incoming payment grant: ${referrerGrantResult.error || 'Unknown error'}`
      });
    }

    if (!referrerGrantResult.isFinalized) {
      return res.status(409).json({
        success: false,
        error: 'Referral incoming payment grant requires user interaction to finalize',
        grant: referrerGrantResult.data
      });
    }

    const referrerAccessToken = referrerGrantResult.data?.access_token?.value;
    if (!referrerAccessToken) {
      return res.status(502).json({
        success: false,
        error: 'Referral incoming payment grant did not return an access token'
      });
    }

    const sellerIncomingPaymentResult = await createIncomingPayment(
      sellerWallet.resourceServer,
      sellerAccessToken,
      {
        walletAddress: sellerWallet.id,
        incomingAmount: {
          value: sellerMinorAmount.toString(),
          assetCode: sellerWallet.assetCode,
          assetScale
        },
        description: `Sale of ${product.title} (seller share)`
      },
      config
    );

    if (!sellerIncomingPaymentResult.success) {
      return res.status(502).json({
        success: false,
        error: `Failed to create seller incoming payment: ${sellerIncomingPaymentResult.error || 'Unknown error'}`
      });
    }

    const referrerIncomingPaymentResult = await createIncomingPayment(
      refWallet.resourceServer,
      referrerAccessToken,
      {
        walletAddress: refWallet.id,
        incomingAmount: {
          value: referralMinorAmount.toString(),
          assetCode: refWallet.assetCode,
          assetScale
        },
        description: `Referral reward for product ${product.title}`
      },
      config
    );

    if (!referrerIncomingPaymentResult.success) {
      return res.status(502).json({
        success: false,
        error: `Failed to create referral incoming payment: ${referrerIncomingPaymentResult.error || 'Unknown error'}`
      });
    }

    const sellerIncomingPayment = sellerIncomingPaymentResult.data;
    const referrerIncomingPayment = referrerIncomingPaymentResult.data;

    const [sellerPaymentLinks, referrerPaymentLinks] = await Promise.all([
      generatePaymentLink(sellerMinorAmount.toString(), undefined, sellerIncomingPayment.id, config),
      generatePaymentLink(referralMinorAmount.toString(), undefined, referrerIncomingPayment.id, config)
    ]);

    const referralTransaction = {
      transactionId,
      productId: String(productId),
      product: {
        id: product.id,
        title: product.title,
        price: product.price
      },
      seller: {
        walletAddress: sellerWallet.id,
        amount: sellerMinorAmount,
        assetCode: sellerWallet.assetCode,
        assetScale
      },
      referral: {
        walletAddress: refWallet.id,
        amount: referralMinorAmount,
        assetCode: refWallet.assetCode,
        assetScale
      },
      refererId,
      split: {
        total: totalMinorAmount,
        sellerPercentage: 95,
        referralPercentage: 5
      },
      createdAt: new Date().toISOString(),
      paymentLinks: {
        seller: sellerPaymentLinks,
        referral: referrerPaymentLinks
      },
      accessTokens: {
        seller: sellerAccessToken,
        referral: referrerAccessToken
      },
      incomingPayments: {
        seller: sellerIncomingPayment.id,
        referral: referrerIncomingPayment.id
      }
    };

    const transactionsPath = path.join(__dirname, 'referalTransactions.json');
    let transactions = [];
    try {
      const existingTransactions = fs.readFileSync(transactionsPath, 'utf8');
      if (existingTransactions.trim()) {
        transactions = JSON.parse(existingTransactions);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('Unable to read existing referalTransactions.json file:', error);
      }
    }

    transactions.push(referralTransaction);
    fs.writeFileSync(transactionsPath, JSON.stringify(transactions, null, 2));

    res.json({
      sellerPaymentLink: sellerPaymentLinks.webLink,
      referralPaymentLink: referrerPaymentLinks.webLink
    });
  } catch (error) {
    console.error('Unexpected error generating referral payment links:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
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
