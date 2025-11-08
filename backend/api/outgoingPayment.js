import { createAuthenticatedClient } from "@interledger/open-payments";
import fs from 'fs';

/**
 * Create an outgoing payment
 * Creates a new outgoing payment from the specified wallet address.
 * 
 * @param {string} resourceServerUrl - The resource server URL from wallet address
 * @param {string} accessToken - Access token from outgoing payment grant
 * @param {Object} paymentDetails - Payment details
 * @param {string} paymentDetails.walletAddress - Sender's wallet address ID
 * @param {string} paymentDetails.quoteId - Quote ID for the payment
 * @param {Object} paymentDetails.metadata - Optional payment metadata
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Created outgoing payment
 */
export async function createOutgoingPayment(resourceServerUrl, accessToken, paymentDetails, config) {
  try {
    const client = await createAuthenticatedClient({
      walletAddressUrl: config.walletAddressUrl,
      privateKey: config.privateKeyPath,
      keyId: config.keyId
    });

    const outgoingPaymentRequest = {
      walletAddress: paymentDetails.walletAddress,
      quoteId: paymentDetails.quoteId
    };

    if (paymentDetails.metadata) {
      outgoingPaymentRequest.metadata = paymentDetails.metadata;
    }

    const outgoingPayment = await client.outgoingPayment.create(
      {
        url: resourceServerUrl,
        accessToken: accessToken
      },
      outgoingPaymentRequest
    );

    console.log("OUTGOING PAYMENT CREATED:", outgoingPayment);
    
    return {
      success: true,
      data: outgoingPayment
    };
  } catch (error) {
    console.error("Error creating outgoing payment:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get an outgoing payment
 * Retrieves details of a specific outgoing payment.
 * 
 * @param {string} outgoingPaymentUrl - The outgoing payment URL
 * @param {string} accessToken - Access token from outgoing payment grant
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Outgoing payment details
 */
export async function getOutgoingPayment(outgoingPaymentUrl, accessToken, config) {
  try {
    const client = await createAuthenticatedClient({
      walletAddressUrl: config.walletAddressUrl,
      privateKey: config.privateKeyPath,
      keyId: config.keyId
    });

    const outgoingPayment = await client.outgoingPayment.get({
      url: outgoingPaymentUrl,
      accessToken: accessToken
    });

    console.log("OUTGOING PAYMENT:", outgoingPayment);
    
    return {
      success: true,
      data: outgoingPayment
    };
  } catch (error) {
    console.error("Error getting outgoing payment:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * List outgoing payments
 * Lists outgoing payments for a wallet address.
 * 
 * @param {string} walletAddressUrl - The wallet address URL
 * @param {string} accessToken - Access token from outgoing payment grant
 * @param {Object} config - Configuration object
 * @param {Object} pagination - Optional pagination parameters
 * @returns {Promise<Object>} List of outgoing payments
 */
export async function listOutgoingPayments(walletAddressUrl, accessToken, config, pagination = {}) {
  try {
    const client = await createAuthenticatedClient({
      walletAddressUrl: config.walletAddressUrl,
      privateKey: config.privateKeyPath,
      keyId: config.keyId
    });

    const listParams = {
      url: walletAddressUrl,
      accessToken: accessToken
    };

    if (pagination.first) {
      listParams.first = pagination.first;
    }

    if (pagination.last) {
      listParams.last = pagination.last;
    }

    if (pagination.cursor) {
      listParams.cursor = pagination.cursor;
    }

    const outgoingPayments = await client.outgoingPayment.list(listParams);

    console.log("OUTGOING PAYMENTS LIST:", outgoingPayments);
    
    return {
      success: true,
      data: outgoingPayments
    };
  } catch (error) {
    console.error("Error listing outgoing payments:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

