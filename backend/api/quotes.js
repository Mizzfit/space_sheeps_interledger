import { createAuthenticatedClient } from "@interledger/open-payments";
import fs from 'fs';

/**
 * Create a quote
 * Creates a quote for a payment from sender to receiver.
 * 
 * @param {string} resourceServerUrl - The resource server URL from wallet address
 * @param {string} accessToken - Access token from quote grant
 * @param {Object} quoteDetails - Quote details
 * @param {string} quoteDetails.walletAddress - Sender's wallet address ID
 * @param {string} quoteDetails.receiver - Receiver's incoming payment URL
 * @param {string} quoteDetails.method - Payment method (e.g., "ilp")
 * @param {Object} quoteDetails.debitAmount - Optional fixed debit amount
 * @param {Object} quoteDetails.receiveAmount - Optional fixed receive amount
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Created quote
 */
export async function createQuote(resourceServerUrl, accessToken, quoteDetails, config) {
  try {
    const client = await createAuthenticatedClient({
      walletAddressUrl: config.walletAddressUrl,
      privateKey: config.privateKeyPath,
      keyId: config.keyId
    });

    const quoteRequest = {
      walletAddress: quoteDetails.walletAddress,
      receiver: quoteDetails.receiver,
      method: quoteDetails.method || "ilp"
    };

    // Either debitAmount or receiveAmount can be specified, not both
    if (quoteDetails.debitAmount) {
      quoteRequest.debitAmount = quoteDetails.debitAmount;
    } else if (quoteDetails.receiveAmount) {
      quoteRequest.receiveAmount = quoteDetails.receiveAmount;
    }

    const quote = await client.quote.create(
      {
        url: resourceServerUrl,
        accessToken: accessToken
      },
      quoteRequest
    );

    console.log("QUOTE CREATED:", quote);
    
    return {
      success: true,
      data: quote
    };
  } catch (error) {
    console.error("Error creating quote:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get a quote
 * Retrieves details of a specific quote.
 * 
 * @param {string} quoteUrl - The quote URL
 * @param {string} accessToken - Access token from quote grant
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Quote details
 */
export async function getQuote(quoteUrl, accessToken, config) {
  try {
    const client = await createAuthenticatedClient({
      walletAddressUrl: config.walletAddressUrl,
      privateKey: config.privateKeyPath,
      keyId: config.keyId
    });

    const quote = await client.quote.get({
      url: quoteUrl,
      accessToken: accessToken
    });

    console.log("QUOTE:", quote);
    
    return {
      success: true,
      data: quote
    };
  } catch (error) {
    console.error("Error getting quote:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create a quote with fixed send amount
 * Helper function to create a quote where the sender wants to send a specific amount.
 * 
 * @param {string} resourceServerUrl - The resource server URL
 * @param {string} accessToken - Access token from quote grant
 * @param {string} walletAddress - Sender's wallet address ID
 * @param {string} receiver - Receiver's incoming payment URL
 * @param {Object} debitAmount - Amount to be debited from sender
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Created quote
 */
export async function createQuoteWithFixedSend(resourceServerUrl, accessToken, walletAddress, receiver, debitAmount, config) {
  return createQuote(
    resourceServerUrl,
    accessToken,
    {
      walletAddress,
      receiver,
      method: "ilp",
      debitAmount
    },
    config
  );
}

/**
 * Create a quote with fixed receive amount
 * Helper function to create a quote where the receiver needs to receive a specific amount.
 * 
 * @param {string} resourceServerUrl - The resource server URL
 * @param {string} accessToken - Access token from quote grant
 * @param {string} walletAddress - Sender's wallet address ID
 * @param {string} receiver - Receiver's incoming payment URL
 * @param {Object} receiveAmount - Amount to be received
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Created quote
 */
export async function createQuoteWithFixedReceive(resourceServerUrl, accessToken, walletAddress, receiver, receiveAmount, config) {
  return createQuote(
    resourceServerUrl,
    accessToken,
    {
      walletAddress,
      receiver,
      method: "ilp",
      receiveAmount
    },
    config
  );
}

