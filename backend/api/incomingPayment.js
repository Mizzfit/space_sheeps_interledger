import { httpGet, httpPost } from './httpClient.js';

/**
 * Create an incoming payment
 * Creates a new incoming payment on the specified wallet address.
 * 
 * @param {string} resourceServerUrl - The resource server URL from wallet address
 * @param {string} accessToken - Access token from incoming payment grant
 * @param {Object} paymentDetails - Payment details
 * @param {string} paymentDetails.walletAddress - Wallet address ID
 * @param {Object} paymentDetails.incomingAmount - Amount to receive
 * @param {string} paymentDetails.description - Optional payment description
 * @param {string} paymentDetails.externalRef - Optional external reference
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Created incoming payment
 */
export async function createIncomingPayment(resourceServerUrl, accessToken, paymentDetails, config) {
  try {
    const baseUrl = new URL(resourceServerUrl);
    baseUrl.pathname = `${baseUrl.pathname.replace(/\/$/, '')}/incoming-payments`;
    const url = baseUrl.href;

    const incomingPaymentRequest = {
      walletAddress: paymentDetails.walletAddress,
      incomingAmount: paymentDetails.incomingAmount
    };

    if (paymentDetails.description) {
      incomingPaymentRequest.metadata = {
        description: paymentDetails.description
      };
    }

    if (paymentDetails.externalRef) {
      incomingPaymentRequest.externalRef = paymentDetails.externalRef;
    }

    const incomingPayment = await httpPost(
      url,
      incomingPaymentRequest,
      {
        config,
        accessToken
      }
    );

    console.log("INCOMING PAYMENT CREATED:", incomingPayment);
    
    return {
      success: true,
      data: incomingPayment
    };
  } catch (error) {
    console.error("Error creating incoming payment:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get an incoming payment
 * Retrieves details of a specific incoming payment.
 * 
 * @param {string} incomingPaymentUrl - The incoming payment URL
 * @param {string} accessToken - Access token from incoming payment grant
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Incoming payment details
 */
export async function getIncomingPayment(incomingPaymentUrl, accessToken, config) {
  try {
    const incomingPayment = await httpGet(incomingPaymentUrl, {
      config,
      accessToken,
      sign: true
    });

    console.log("INCOMING PAYMENT:", incomingPayment);
    
    return {
      success: true,
      data: incomingPayment
    };
  } catch (error) {
    console.error("Error getting incoming payment:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * List incoming payments
 * Lists incoming payments for a wallet address.
 * 
 * @param {string} walletAddressUrl - The wallet address URL
 * @param {string} accessToken - Access token from incoming payment grant
 * @param {Object} config - Configuration object
 * @param {Object} pagination - Optional pagination parameters
 * @returns {Promise<Object>} List of incoming payments
 */
export async function listIncomingPayments(walletAddressUrl, accessToken, config, pagination = {}) {
  try {
    const baseUrl = new URL(walletAddressUrl);
    baseUrl.pathname = `${baseUrl.pathname.replace(/\/$/, '')}/incoming-payments`;

    const listUrl = baseUrl;

    listUrl.searchParams.set('wallet-address', walletAddressUrl);

    if (pagination.first) {
      listUrl.searchParams.set('first', pagination.first);
    }

    if (pagination.last) {
      listUrl.searchParams.set('last', pagination.last);
    }

    if (pagination.cursor) {
      listUrl.searchParams.set('cursor', pagination.cursor);
    }

    const incomingPayments = await httpGet(listUrl.href, {
      config,
      accessToken,
      sign: true
    });

    console.log("INCOMING PAYMENTS LIST:", incomingPayments);
    
    return {
      success: true,
      data: incomingPayments
    };
  } catch (error) {
    console.error("Error listing incoming payments:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Complete an incoming payment
 * Marks an incoming payment as complete, preventing further payments to it.
 * 
 * @param {string} incomingPaymentUrl - The incoming payment URL
 * @param {string} accessToken - Access token from incoming payment grant
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Completed incoming payment
 */
export async function completeIncomingPayment(incomingPaymentUrl, accessToken, config) {
  try {
    const url = `${incomingPaymentUrl.replace(/\/$/, '')}/complete`;
    const completedPayment = await httpPost(
      url,
      {},
      {
        config,
        accessToken
      }
    );

    console.log("INCOMING PAYMENT COMPLETED:", completedPayment);
    
    return {
      success: true,
      data: completedPayment
    };
  } catch (error) {
    console.error("Error completing incoming payment:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

