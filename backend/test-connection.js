/**
 * Quick test script to verify your Open Payments API connection
 * Run with: node test-connection.js
 */

import { getWalletAddressInfo } from './api/walletAddress.js';
import { createLogger } from './api/utils.js';

const logger = createLogger(true);

const config = {
  walletAddressUrl: "https://ilp.interledger-test.dev/eb37db34",
  privateKeyPath: "private.key",
  keyId: "e2903c1f-a02c-4ee2-aa8d-c2ea0d064180"
};

async function testConnection() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║   Testing Open Payments API Connection                ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  logger.info("Testing wallet address:", config.walletAddressUrl);
  
  try {
    const result = await getWalletAddressInfo(config.walletAddressUrl, config);
    
    if (result.success) {
      logger.success("Connection successful!\n");
      
      console.log("📋 Wallet Information:");
      console.log("  ├─ ID:", result.data.id);
      console.log("  ├─ Auth Server:", result.data.authServer);
      console.log("  ├─ Resource Server:", result.data.resourceServer);
      console.log("  ├─ Asset Code:", result.data.assetCode);
      console.log("  ├─ Asset Scale:", result.data.assetScale);
      console.log("  └─ Public Name:", result.data.publicName || "Not set");
      
      console.log("\n✅ Your wallet is ready to use!");
      console.log("\n📚 Next steps:");
      console.log("  1. Check out backend/QUICKSTART.md for more examples");
      console.log("  2. Run: node --input-type=module --eval \"import('./api/examples.js').then(m => m.runAllExamples())\"");
      console.log("  3. Read api/API_DOCUMENTATION.md for complete reference\n");
      
      return true;
    } else {
      logger.error("Connection failed!");
      console.error("\n❌ Error:", result.error);
      console.error("\n🔍 Troubleshooting:");
      console.error("  1. Make sure private.key file exists in the backend/ directory");
      console.error("  2. Verify your credentials at https://ilp.interledger-test.dev/eb37db34");
      console.error("  3. Check your internet connection");
      console.error("  4. Ensure pnpm install has been run\n");
      
      return false;
    }
  } catch (error) {
    logger.error("Unexpected error:", error.message);
    console.error("\n📝 Error details:", error);
    
    if (error.message.includes("private.key")) {
      console.error("\n⚠️  Private key issue detected!");
      console.error("Create the file backend/private.key with this content:\n");
      console.error("-----BEGIN PRIVATE KEY-----");
      console.error("MC4CAQAwBQYDK2VwBCIEIIq7AvSyap022BGGlXzKeIywsxJAwt0m2iP1f4NobVNQ");
      console.error("-----END PRIVATE KEY-----\n");
    }
    
    return false;
  }
}

// Run the test
testConnection().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});

