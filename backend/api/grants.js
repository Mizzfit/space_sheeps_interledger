import { httpPost, httpRequest } from './httpClient.js';

const isFinalizedGrant = (grant) => Boolean(grant?.access_token?.value);
const isPendingGrant = (grant) => Boolean(grant?.continue);

const withClient = (config, body) => ({
  ...body,
  client: config.walletAddressUrl
});

/**
 * Request an incoming payment grant
 * Creates a grant request for creating incoming payments on a wallet.
 * 
 * @param {string} authServerUrl - The authorization server URL from wallet address
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Grant response
 */
export async function requestIncomingPaymentGrant(authServerUrl, config) {
  try {
    const grant = await httpPost(
      authServerUrl,
      withClient(config, {
        access_token: {
          access: [
            {
              type: "incoming-payment",
              actions: ["create", "read", "list", "complete"]
            }
          ]
        }
      }),
      { config }
    );

    if (!isFinalizedGrant(grant)) {
      console.warn("Grant is not finalized. May require user interaction.");
    }

    console.log("INCOMING PAYMENT GRANT:", grant);
    
    return {
      success: true,
      data: grant,
      isFinalized: isFinalizedGrant(grant)
    };
  } catch (error) {
    console.error("Error requesting incoming payment grant:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Request a quote grant
 * Creates a grant request for creating quotes.
 * 
 * @param {string} authServerUrl - The authorization server URL from wallet address
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Grant response
 */
export async function requestQuoteGrant(authServerUrl, config) {
  try {
    const grant = await httpPost(
      authServerUrl,
      withClient(config, {
        access_token: {
          access: [
            {
              type: "quote",
              actions: ["create", "read"]
            }
          ]
        }
      }),
      { config }
    );

    if (!isFinalizedGrant(grant)) {
      console.warn("Grant is not finalized. May require user interaction.");
    }

    console.log("QUOTE GRANT:", grant);
    
    return {
      success: true,
      data: grant,
      isFinalized: isFinalizedGrant(grant)
    };
  } catch (error) {
    console.error("Error requesting quote grant:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Request an outgoing payment grant
 * Creates a grant request for creating outgoing payments with specified limits.
 * 
 * @param {string} authServerUrl - The authorization server URL from wallet address
 * @param {string} walletAddressId - The wallet address identifier
 * @param {Object} debitAmount - The debit amount limit
 * @param {Object} config - Configuration object
 * @param {boolean} requireInteraction - Whether to require user interaction
 * @returns {Promise<Object>} Grant response
 */
export async function requestOutgoingPaymentGrant(authServerUrl, walletAddressId, debitAmount, config, requireInteraction = true) {
  try {
    const grantRequest = {
      access_token: {
        access: [
          {
            type: "outgoing-payment",
            actions: ["create", "read", "list"],
            limits: {
              debitAmount: debitAmount
            },
            identifier: walletAddressId
          }
        ]
      }
    };

    if (requireInteraction) {
      grantRequest.interact = {
        start: ["redirect"]
      };
    }

    const grant = await httpPost(
      authServerUrl,
      withClient(config, grantRequest),
      { config }
    );

    console.log("OUTGOING PAYMENT GRANT:", grant);
    
    return {
      success: true,
      data: grant,
      isFinalized: isFinalizedGrant(grant),
      isPending: isPendingGrant(grant)
    };
  } catch (error) {
    console.error("Error requesting outgoing payment grant:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Continue a grant request
 * Continues a pending grant request after user interaction.
 * 
 * @param {string} continueUri - The continue URI from the grant
 * @param {string} continueAccessToken - The continue access token from the grant
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Finalized grant response
 */
export async function continueGrant(continueUri, continueAccessToken, config) {
  try {
    const finalizedGrant = await httpPost(
      continueUri,
      {},
      {
        config,
        accessToken: continueAccessToken
      }
    );

    if (!isFinalizedGrant(finalizedGrant)) {
      throw new Error("Grant continuation did not result in finalized grant");
    }

    console.log("FINALIZED GRANT:", finalizedGrant);
    
    return {
      success: true,
      data: finalizedGrant
    };
  } catch (error) {
    console.error("Error continuing grant:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Revoke/cancel a grant
 * Cancels an existing grant.
 * 
 * @param {string} grantUrl - The grant management URL
 * @param {string} accessToken - The access token for the grant
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Cancellation response
 */
export async function revokeGrant(grantUrl, accessToken, config) {
  try {
    await httpRequest({
      method: 'DELETE',
      url: grantUrl,
      config,
      accessToken
    });

    console.log("GRANT REVOKED:", grantUrl);
    
    return {
      success: true,
      message: "Grant successfully revoked"
    };
  } catch (error) {
    console.error("Error revoking grant:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

