// ============================================================
// PeduliAnak — Midtrans Payment Service
// ============================================================

import midtransClient from "midtrans-client";

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

// Snap client untuk pembayaran
const snap = new midtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

// Core API untuk pengecekan status
const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export interface CreateTransactionParams {
  orderId: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  itemName: string;
}

/**
 * Membuat transaksi Midtrans Snap.
 * Mengembalikan token dan redirect URL untuk pembayaran.
 */
export async function createTransaction(params: CreateTransactionParams) {
  const { orderId, amount, donorName, donorEmail, itemName } = params;

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    item_details: [
      {
        id: orderId,
        price: amount,
        quantity: 1,
        name: itemName,
      },
    ],
    customer_details: {
      first_name: donorName,
      email: donorEmail,
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/donate/success?order_id=${orderId}`,
    },
  };

  const transaction = await snap.createTransaction(parameter);

  return {
    token: transaction.token,
    redirectUrl: transaction.redirect_url,
  };
}

/**
 * Cek status transaksi Midtrans.
 */
export async function getTransactionStatus(orderId: string) {
  return await coreApi.transaction.status(orderId);
}

export { snap, coreApi };
