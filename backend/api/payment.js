import { createAuthenticatedClient, isFinalizedGrant } from "@interledger/open-payments";
import fs from 'fs';
import Readline from "readline/promises"


export async function initiatePayment(amount, user) {
  const privateKey = fs.readFileSync("private.key", "utf-8");
  const client = await createAuthenticatedClient({
    walletAddressUrl: "https://ilp.interledger-test.dev/chinotest",
    privateKey: 'private.key',
    keyId: "e695f69a-877d-4885-a908-1935b754ecb1"
  });

  // 1. Obtener una concesiÃ³n para un pago entrante)

  const sendingWalletAddress = await client.walletAddress.get({
    url: user
  });

  const receivingWalletAddress = await client.walletAddress.get({
    url: "https://ilp.interledger-test.dev/user2test"
  });

  console.log({ sendingWalletAddress, receivingWalletAddress })

  // 2. Obtener una concesiÃ³n para un pago entrante

  const incomingPaymentGrant = await client.grant.request(
    {
      url: receivingWalletAddress.authServer,
    },
    {
      access_token: {
        access: [
          {
            type: "incoming-payment",
            actions: ["create"]
          }
        ]
      }
    }
  );

  if (!isFinalizedGrant(incomingPaymentGrant)) {
    throw new Error("Se espera bla bla bla")
  }

  console.log(incomingPaymentGrant);

  // 3. Crear un pago entrante para el receptor

  const incomingPayment = await client.incomingPayment.create(
    {
      url: receivingWalletAddress.resourceServer,
      accessToken: incomingPaymentGrant.access_token.value,
    },
    {
      walletAddress: receivingWalletAddress.id,
      incomingAmount: {
        assetCode: receivingWalletAddress.assetCode,
        assetScale: receivingWalletAddress.assetScale,
        value: amount,
      },
    }
  );

  console.log({ incomingPayment })

  // 4. Crear un concesiÃ³n para una cotizaciÃ³n
  const quoteGrant = await client.grant.request(
    {
      url: sendingWalletAddress.authServer,
    },
    {
      access_token: {
        access: [
          {
            type: "quote",
            actions: ["create"],
          }

        ]
      }
    }
  );

  if (!isFinalizedGrant(quoteGrant)) {
    throw new Error("Se espera bla bla bla")
  }

  console.log(quoteGrant)

  // 5. Obtener una cotizaciÃ³n para el remitente

  const quote = await client.quote.create(
    {
      url: receivingWalletAddress.resourceServer,
      accessToken: quoteGrant.access_token.value,
    },
    {
      walletAddress: sendingWalletAddress.id,
      receiver: incomingPayment.id,
      method: "ilp",
    }
  );
  console.log({ quote })

  // 6. Obtener una concesiÃ³n para un pago saliente

  const outgoingPaymentGrant = await client.grant.request(
    {
      url: sendingWalletAddress.authServer,
    },
    {
      access_token: {
        access: [
          {
            type: "outgoing-payment",
            actions: ["create"],
            limits: {
              debitAmount: quote.debitAmount,
            },
            identifier: sendingWalletAddress.id,
          }
        ]
      },
      interact: {
        start: ["redirect"]
      },
    }
  );

  console.log({ outgoingPaymentGrant });

  // 7. Continuar con la concesiÃ³n del pago saliente

  await Readline
    .createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    .question("Presione Enter para continuar con el pago saliente...")

  // 8. Finalizar la concesiÃ³n del pago saliente

  const finzlizedOutgoingPaymentGrant = await client.grant.continue({
    url: outgoingPaymentGrant.continue.uri,
    accessToken: outgoingPaymentGrant.continue.access_token.value,
  });

  if (!isFinalizedGrant(finzlizedOutgoingPaymentGrant)) {
    throw new Error("Se espera bla bla bla")
  }

  // 9. Continuar con la cotizaciÃ³n de pago saliente

  const outgoingPayment = await client.outgoingPayment.create(
    {
      url: sendingWalletAddress.resourceServer,
      accessToken: finzlizedOutgoingPaymentGrant.access_token.value,
    },
    {
      walletAddress: sendingWalletAddress.id,
      quoteId: quote.id,
    }
  );

  console.log({ outgoingPayment })
}


