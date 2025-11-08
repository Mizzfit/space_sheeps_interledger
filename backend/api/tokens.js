import { createAuthenticatedClient } from "@interledger/open-payments";
import fs from 'fs';

/**
 * Rotate an access token
 * Rotates an existing access token to get a new one before it expires.
 * 
 * @param {string} tokenManagementUrl - The token management URL from the grant
 * @param {string} currentAccessToken - Current access token to be rotated
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} New access token
 */
export async function rotateAccessToken(tokenManagementUrl, currentAccessToken, config) {
  try {
    const client = await createAuthenticatedClient({
      walletAddressUrl: config.walletAddressUrl,
      privateKey: config.privateKeyPath,
      keyId: config.keyId
    });

    const rotatedToken = await client.token.rotate({
      url: tokenManagementUrl,
      accessToken: currentAccessToken
    });

    console.log("TOKEN ROTATED:", rotatedToken);
    
    return {
      success: true,
      data: rotatedToken
    };
  } catch (error) {
    console.error("Error rotating access token:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Revoke an access token
 * Revokes an existing access token, making it invalid immediately.
 * 
 * @param {string} tokenManagementUrl - The token management URL from the grant
 * @param {string} accessToken - Access token to be revoked
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Revocation response
 */
export async function revokeAccessToken(tokenManagementUrl, accessToken, config) {
  try {
    const client = await createAuthenticatedClient({
      walletAddressUrl: config.walletAddressUrl,
      privateKey: config.privateKeyPath,
      keyId: config.keyId
    });

    await client.token.revoke({
      url: tokenManagementUrl,
      accessToken: accessToken
    });

    console.log("TOKEN REVOKED:", tokenManagementUrl);
    
    return {
      success: true,
      message: "Access token successfully revoked"
    };
  } catch (error) {
    console.error("Error revoking access token:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

