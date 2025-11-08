/**
 * Utility functions for Open Payments API operations
 */

import { getWalletAddressInfo } from './walletAddress.js';

/**
 * Format amount for display
 * Converts smallest unit amount to human-readable format
 * 
 * @param {string} value - Amount in smallest unit
 * @param {number} assetScale - Number of decimal places
 * @param {string} assetCode - Currency code
 * @returns {string} Formatted amount
 */
export function formatAmount(value, assetScale, assetCode = '') {
  const amount = parseInt(value) / Math.pow(10, assetScale);
  return `${assetCode} ${amount.toFixed(assetScale)}`;
}

/**
 * Parse amount from human-readable to smallest unit
 * 
 * @param {number} amount - Human-readable amount (e.g., 50.00)
 * @param {number} assetScale - Number of decimal places
 * @returns {string} Amount in smallest unit
 */
export function parseAmount(amount, assetScale) {
  return Math.round(amount * Math.pow(10, assetScale)).toString();
}

/**
 * Create amount object from decimal value
 * 
 * @param {number} decimalAmount - Amount in decimal format
 * @param {string} assetCode - Currency code
 * @param {number} assetScale - Number of decimal places
 * @returns {Object} Amount object
 */
export function createAmountObject(decimalAmount, assetCode, assetScale) {
  return {
    assetCode,
    assetScale,
    value: parseAmount(decimalAmount, assetScale)
  };
}

/**
 * Validate wallet address format
 * 
 * @param {string} walletAddress - Wallet address URL to validate
 * @returns {boolean} True if valid format
 */
export function isValidWalletAddressFormat(walletAddress) {
  try {
    const url = new URL(walletAddress);
    return url.protocol === 'https:' && url.pathname.length > 1;
  } catch {
    return false;
  }
}

/**
 * Calculate payment fee
 * 
 * @param {Object} quote - Quote object with debitAmount and receiveAmount
 * @returns {Object} Fee information
 */
export function calculateFee(quote) {
  const debitValue = parseInt(quote.debitAmount.value);
  const receiveValue = parseInt(quote.receiveAmount.value);
  const feeValue = debitValue - receiveValue;
  
  return {
    value: feeValue.toString(),
    assetCode: quote.debitAmount.assetCode,
    assetScale: quote.debitAmount.assetScale,
    percentage: ((feeValue / debitValue) * 100).toFixed(2)
  };
}

/**
 * Check if payment is complete
 * 
 * @param {Object} payment - Payment object
 * @returns {boolean} True if payment is complete
 */
export function isPaymentComplete(payment) {
  if (payment.completed) return true;
  
  const expected = parseInt(payment.incomingAmount.value);
  const received = parseInt(payment.receivedAmount.value);
  
  return received >= expected;
}

/**
 * Get payment progress
 * 
 * @param {Object} payment - Payment object with incomingAmount and receivedAmount
 * @returns {Object} Progress information
 */
export function getPaymentProgress(payment) {
  const expected = parseInt(payment.incomingAmount.value);
  const received = parseInt(payment.receivedAmount?.value || '0');
  const percentage = (received / expected) * 100;
  
  return {
    expected,
    received,
    remaining: expected - received,
    percentage: percentage.toFixed(2),
    isComplete: percentage >= 100 || payment.completed
  };
}

/**
 * Wait for payment completion with polling
 * 
 * @param {Function} getPaymentFn - Function to get payment status
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} intervalMs - Polling interval in milliseconds
 * @returns {Promise<Object>} Final payment status
 */
export async function waitForPaymentCompletion(getPaymentFn, maxAttempts = 30, intervalMs = 2000) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getPaymentFn();
    
    if (!result.success) {
      throw new Error(`Failed to get payment status: ${result.error}`);
    }
    
    const progress = getPaymentProgress(result.data);
    console.log(`Payment progress: ${progress.percentage}%`);
    
    if (progress.isComplete) {
      return result;
    }
    
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error('Payment did not complete within expected time');
}

/**
 * Extract wallet name from wallet address URL
 * 
 * @param {string} walletAddress - Full wallet address URL
 * @returns {string} Wallet name
 */
export function getWalletName(walletAddress) {
  try {
    const url = new URL(walletAddress);
    return url.pathname.substring(1); // Remove leading slash
  } catch {
    return walletAddress;
  }
}

/**
 * Build wallet address URL
 * 
 * @param {string} baseUrl - Base URL (e.g., "https://ilp.interledger-test.dev")
 * @param {string} walletName - Wallet name
 * @returns {string} Complete wallet address URL
 */
export function buildWalletAddress(baseUrl, walletName) {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const name = walletName.startsWith('/') ? walletName : '/' + walletName;
  return base + name;
}

/**
 * Retry function with exponential backoff
 * 
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelayMs - Initial delay in milliseconds
 * @returns {Promise<any>} Function result
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelayMs = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        const delay = initialDelayMs * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Compare two amounts
 * 
 * @param {Object} amount1 - First amount object
 * @param {Object} amount2 - Second amount object
 * @returns {number} -1 if amount1 < amount2, 0 if equal, 1 if amount1 > amount2
 */
export function compareAmounts(amount1, amount2) {
  if (amount1.assetCode !== amount2.assetCode) {
    throw new Error('Cannot compare amounts with different asset codes');
  }
  
  const value1 = parseInt(amount1.value);
  const value2 = parseInt(amount2.value);
  
  if (value1 < value2) return -1;
  if (value1 > value2) return 1;
  return 0;
}

/**
 * Validate configuration object
 * 
 * @param {Object} config - Configuration object to validate
 * @returns {Object} Validation result
 */
export function validateConfig(config) {
  const errors = [];
  
  if (!config.walletAddressUrl) {
    errors.push('walletAddressUrl is required');
  } else if (!isValidWalletAddressFormat(config.walletAddressUrl)) {
    errors.push('walletAddressUrl must be a valid HTTPS URL');
  }
  
  if (!config.privateKeyPath) {
    errors.push('privateKeyPath is required');
  }
  
  if (!config.keyId) {
    errors.push('keyId is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create a simple logger
 * 
 * @param {boolean} verbose - Enable verbose logging
 * @returns {Object} Logger object
 */
export function createLogger(verbose = true) {
  return {
    info: (message, ...args) => {
      if (verbose) console.log(`ℹ️  ${message}`, ...args);
    },
    success: (message, ...args) => {
      if (verbose) console.log(`✅ ${message}`, ...args);
    },
    error: (message, ...args) => {
      console.error(`❌ ${message}`, ...args);
    },
    warn: (message, ...args) => {
      if (verbose) console.warn(`⚠️  ${message}`, ...args);
    },
    debug: (message, ...args) => {
      if (verbose) console.debug(`🔍 ${message}`, ...args);
    }
  };
}

/**
 * Extract base URL from wallet address
 * 
 * @param {string} walletAddress - Wallet address URL
 * @returns {string} Base URL
 */
export function getBaseUrl(walletAddress) {
  try {
    const url = new URL(walletAddress);
    return `${url.protocol}//${url.host}`;
  } catch {
    return '';
  }
}

