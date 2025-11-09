import { httpGet } from './httpClient.js';

/**
 * Get wallet address information
 * Retrieves public information about a wallet address including auth server URL,
 * resource server URL, asset code, and asset scale.
 * 
 * @param {string} walletAddressUrl - The wallet address URL to query
 * @param {Object} config - Configuration object
 * @param {string} config.walletAddressUrl - Client's wallet address URL for authentication
 * @param {string} config.privateKeyPath - Path to private key file
 * @param {string} config.keyId - Key ID for authentication
 * @returns {Promise<Object>} Wallet address information
 */
export async function getWalletAddressInfo(walletAddressUrl, config) {
  try {
    const walletAddress = await httpGet(walletAddressUrl);

    console.log("WALLET ADDRESS INFO:", walletAddress);
    
    return {
      success: true,
      data: walletAddress
    };
  } catch (error) {
    console.error("Error getting wallet address info:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get keys bound to a wallet address
 * Retrieves the public keys associated with a wallet address for verification purposes.
 * 
 * @param {string} walletAddressUrl - The wallet address URL to query
 * @param {Object} config - Configuration object
 * @param {string} config.walletAddressUrl - Client's wallet address URL for authentication
 * @param {string} config.privateKeyPath - Path to private key file
 * @param {string} config.keyId - Key ID for authentication
 * @returns {Promise<Object>} Keys information
 */
export async function getWalletAddressKeys(walletAddressUrl, config) {
  try {
    const url = `${walletAddressUrl.replace(/\/$/, '')}/jwks.json`;
    const keys = await httpGet(url);

    console.log("WALLET ADDRESS KEYS:", keys);
    
    return {
      success: true,
      data: keys
    };
  } catch (error) {
    console.error("Error getting wallet address keys:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate multiple wallet addresses
 * Checks if multiple wallet addresses are valid and returns their basic info.
 * 
 * @param {Array<string>} walletAddressUrls - Array of wallet address URLs to validate
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Validation results for all addresses
 */
export async function validateWalletAddresses(walletAddressUrls, config) {
  try {
    const results = await Promise.all(
      walletAddressUrls.map(async (url) => {
        try {
          const walletAddress = await httpGet(url);
          return {
            url,
            valid: true,
            data: walletAddress
          };
        } catch (error) {
          return {
            url,
            valid: false,
            error: error.message
          };
        }
      })
    );

    console.log("WALLET ADDRESS VALIDATION RESULTS:", results);
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error("Error validating wallet addresses:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

