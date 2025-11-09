export async function generatePaymentLink(amount, buyerWallet, sellerWallet, config) {
  // Manual payment process: Return payment URL for buyer to manually send money
  // Format: https://pay.interledger-test.dev/payment-choice?receiver={sellerWalletAddress}
  // The buyer can use this URL to manually send money to the seller's wallet
  
  const paymentUrl = `https://pay.interledger-test.dev/payment-choice?receiver=${encodeURIComponent(sellerWallet)}`;
  
  return paymentUrl;
}

