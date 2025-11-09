export async function generatePaymentLink(amount, buyerWallet, receiver, config) {
  const encodedReceiver = encodeURIComponent(receiver);
  const amountParam = amount ? `&amount=${encodeURIComponent(amount)}` : '';

  const deepLink = `openpayments://pay?receiver=${encodedReceiver}${amountParam}`;
  const webLink = `https://pay.interledger-test.dev/payment-choice?receiver=${encodedReceiver}${amountParam}`;

  return {
    deepLink,
    webLink,
    receiver
  };
}

