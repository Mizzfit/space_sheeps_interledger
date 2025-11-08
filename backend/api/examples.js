/**
 * Examples of using the Open Payments API modules
 * This file demonstrates common use cases and patterns
 */

import { getWalletAddressInfo, validateWalletAddresses } from './walletAddress.js';
import {
  requestIncomingPaymentGrant,
  requestQuoteGrant,
  requestOutgoingPaymentGrant,
  continueGrant
} from './grants.js';
import {
  createIncomingPayment,
  getIncomingPayment,
  listIncomingPayments
} from './incomingPayment.js';
import { createQuote, getQuote } from './quotes.js';
import { createOutgoingPayment, getOutgoingPayment } from './outgoingPayment.js';
import { rotateAccessToken } from './tokens.js';

// Example configuration
const config = {
  walletAddressUrl: "https://ilp.interledger-test.dev/chinotest",
  privateKeyPath: "private.key",
  keyId: "e695f69a-877d-4885-a908-1935b754ecb1"
};

/**
 * Example 1: Simple wallet address lookup
 */
export async function example1_getWalletInfo() {
  console.log("\n=== Example 1: Get Wallet Address Info ===\n");
  
  const walletUrl = "https://ilp.interledger-test.dev/chinotest";
  const result = await getWalletAddressInfo(walletUrl, config);
  
  if (result.success) {
    console.log("Wallet ID:", result.data.id);
    console.log("Auth Server:", result.data.authServer);
    console.log("Resource Server:", result.data.resourceServer);
    console.log("Asset:", result.data.assetCode);
    console.log("Asset Scale:", result.data.assetScale);
  } else {
    console.error("Error:", result.error);
  }
}

/**
 * Example 2: Validate multiple wallet addresses at once
 */
export async function example2_validateMultipleWallets() {
  console.log("\n=== Example 2: Validate Multiple Wallets ===\n");
  
  const wallets = [
    "https://ilp.interledger-test.dev/chinotest",
    "https://ilp.interledger-test.dev/user2test",
    "https://ilp.interledger-test.dev/invalid-wallet" // This one should fail
  ];
  
  const result = await validateWalletAddresses(wallets, config);
  
  if (result.success) {
    result.results.forEach(wallet => {
      console.log(`\n${wallet.url}:`);
      console.log(`  Valid: ${wallet.valid}`);
      if (wallet.valid) {
        console.log(`  Asset: ${wallet.data.assetCode}`);
      } else {
        console.log(`  Error: ${wallet.error}`);
      }
    });
  }
}

/**
 * Example 3: Create an incoming payment (request payment)
 */
export async function example3_createIncomingPayment() {
  console.log("\n=== Example 3: Create Incoming Payment ===\n");
  
  const receiverUrl = "https://ilp.interledger-test.dev/chinotest";
  
  // Step 1: Get wallet info
  const walletInfo = await getWalletAddressInfo(receiverUrl, config);
  if (!walletInfo.success) {
    console.error("Failed to get wallet info");
    return;
  }
  
  // Step 2: Request grant
  const grant = await requestIncomingPaymentGrant(
    walletInfo.data.authServer,
    config
  );
  
  if (!grant.success || !grant.isFinalized) {
    console.error("Failed to get grant");
    return;
  }
  
  // Step 3: Create incoming payment
  const payment = await createIncomingPayment(
    walletInfo.data.resourceServer,
    grant.data.access_token.value,
    {
      walletAddress: walletInfo.data.id,
      incomingAmount: {
        assetCode: walletInfo.data.assetCode,
        assetScale: walletInfo.data.assetScale,
        value: "10000" // $100.00
      },
      description: "Payment for services",
      externalRef: "INV-2025-001"
    },
    config
  );
  
  if (payment.success) {
    console.log("Incoming Payment Created!");
    console.log("Payment URL:", payment.data.id);
    console.log("Amount:", payment.data.incomingAmount.value);
    return payment.data;
  } else {
    console.error("Error:", payment.error);
  }
}

/**
 * Example 4: Create a quote (estimate payment cost)
 */
export async function example4_createQuote() {
  console.log("\n=== Example 4: Create Quote ===\n");
  
  const senderUrl = "https://ilp.interledger-test.dev/chinotest";
  
  // First create an incoming payment (from example 3)
  const incomingPayment = await example3_createIncomingPayment();
  if (!incomingPayment) {
    console.error("Failed to create incoming payment");
    return;
  }
  
  // Get sender wallet info
  const senderWallet = await getWalletAddressInfo(senderUrl, config);
  if (!senderWallet.success) return;
  
  // Request quote grant
  const quoteGrant = await requestQuoteGrant(
    senderWallet.data.authServer,
    config
  );
  
  if (!quoteGrant.success || !quoteGrant.isFinalized) {
    console.error("Failed to get quote grant");
    return;
  }
  
  // Create quote
  const quote = await createQuote(
    senderWallet.data.resourceServer,
    quoteGrant.data.access_token.value,
    {
      walletAddress: senderWallet.data.id,
      receiver: incomingPayment.id,
      method: "ilp"
    },
    config
  );
  
  if (quote.success) {
    console.log("Quote Created!");
    console.log("Receive Amount:", quote.data.receiveAmount.value);
    console.log("Debit Amount:", quote.data.debitAmount.value);
    console.log("Fee:", parseInt(quote.data.debitAmount.value) - parseInt(quote.data.receiveAmount.value));
    return quote.data;
  } else {
    console.error("Error:", quote.error);
  }
}

/**
 * Example 5: List incoming payments (payment history)
 */
export async function example5_listIncomingPayments() {
  console.log("\n=== Example 5: List Incoming Payments ===\n");
  
  const walletUrl = "https://ilp.interledger-test.dev/chinotest";
  
  const walletInfo = await getWalletAddressInfo(walletUrl, config);
  if (!walletInfo.success) return;
  
  const grant = await requestIncomingPaymentGrant(
    walletInfo.data.authServer,
    config
  );
  
  if (!grant.success || !grant.isFinalized) return;
  
  const payments = await listIncomingPayments(
    walletInfo.data.id,
    grant.data.access_token.value,
    config,
    { first: 5 } // Get first 5 payments
  );
  
  if (payments.success) {
    console.log(`Found ${payments.data.result.length} payments:`);
    payments.data.result.forEach((payment, index) => {
      console.log(`\n${index + 1}. Payment ${payment.id}`);
      console.log(`   Amount: ${payment.incomingAmount.value}`);
      console.log(`   Received: ${payment.receivedAmount.value}`);
      console.log(`   Completed: ${payment.completed || false}`);
    });
  }
}

/**
 * Example 6: Check payment status
 */
export async function example6_checkPaymentStatus(paymentUrl) {
  console.log("\n=== Example 6: Check Payment Status ===\n");
  
  const walletUrl = "https://ilp.interledger-test.dev/chinotest";
  
  const walletInfo = await getWalletAddressInfo(walletUrl, config);
  if (!walletInfo.success) return;
  
  const grant = await requestIncomingPaymentGrant(
    walletInfo.data.authServer,
    config
  );
  
  if (!grant.success || !grant.isFinalized) return;
  
  const payment = await getIncomingPayment(
    paymentUrl,
    grant.data.access_token.value,
    config
  );
  
  if (payment.success) {
    console.log("Payment Status:");
    console.log("  ID:", payment.data.id);
    console.log("  Expected:", payment.data.incomingAmount.value);
    console.log("  Received:", payment.data.receivedAmount.value);
    console.log("  Completed:", payment.data.completed || false);
    
    const expectedAmount = parseInt(payment.data.incomingAmount.value);
    const receivedAmount = parseInt(payment.data.receivedAmount.value);
    const percentReceived = (receivedAmount / expectedAmount) * 100;
    
    console.log(`  Progress: ${percentReceived.toFixed(2)}%`);
  }
}

/**
 * Example 7: Token rotation (keep tokens fresh)
 */
export async function example7_rotateToken() {
  console.log("\n=== Example 7: Rotate Access Token ===\n");
  
  const walletUrl = "https://ilp.interledger-test.dev/chinotest";
  
  const walletInfo = await getWalletAddressInfo(walletUrl, config);
  if (!walletInfo.success) return;
  
  const grant = await requestIncomingPaymentGrant(
    walletInfo.data.authServer,
    config
  );
  
  if (!grant.success || !grant.isFinalized) return;
  
  const currentToken = grant.data.access_token.value;
  console.log("Current Token (first 20 chars):", currentToken.substring(0, 20) + "...");
  
  // Rotate the token
  const rotated = await rotateAccessToken(
    grant.data.access_token.manage,
    currentToken,
    config
  );
  
  if (rotated.success) {
    const newToken = rotated.data.access_token.value;
    console.log("New Token (first 20 chars):", newToken.substring(0, 20) + "...");
    console.log("Token successfully rotated!");
  }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║   Open Payments API Examples                          ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  
  try {
    await example1_getWalletInfo();
    await example2_validateMultipleWallets();
    await example3_createIncomingPayment();
    await example4_createQuote();
    await example5_listIncomingPayments();
    await example7_rotateToken();
    
    console.log("\n✅ All examples completed!\n");
  } catch (error) {
    console.error("\n❌ Error running examples:", error);
  }
}

// Uncomment to run examples:
// runAllExamples();

