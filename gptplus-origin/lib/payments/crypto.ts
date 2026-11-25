// CryptoCloud API integration
// Docs: https://docs.cryptocloud.plus/

const CRYPTO_API_URL = "https://api.cryptocloud.plus/v2";
const CRYPTO_API_KEY = process.env.CRYPTOCLOUD_API_KEY ?? "";
const CRYPTO_SHOP_ID = process.env.CRYPTOCLOUD_SHOP_ID ?? "";

export interface CryptoCreatePaymentParams {
  orderId: string;
  amount: number;       // в USD (CryptoCloud принимает USD)
  currency?: string;
  description: string;
  returnUrl: string;
}

export interface CryptoPaymentResponse {
  success: boolean;
  invoiceId: string;
  paymentUrl: string;
  status: string;
  raw?: unknown;
}

export async function createCryptoPayment(
  params: CryptoCreatePaymentParams
): Promise<CryptoPaymentResponse> {
  const body = {
    shop_id: CRYPTO_SHOP_ID,
    amount: params.amount,
    currency: params.currency ?? "USD",
    order_id: params.orderId,
    description: params.description,
    return_url: params.returnUrl,
  };

  const response = await fetch(`${CRYPTO_API_URL}/invoice/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${CRYPTO_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`CryptoCloud error ${response.status}: ${text}`);
  }

  const data = await response.json() as { status: string; result?: { uuid: string; link: string } };

  if (data.status !== "success" || !data.result) {
    throw new Error("CryptoCloud payment creation failed");
  }

  return {
    success: true,
    invoiceId: data.result.uuid,
    paymentUrl: data.result.link,
    status: "pending",
    raw: data,
  };
}

export function mapCryptoStatus(
  status: string
): "pending" | "paid" | "failed" {
  const map: Record<string, "pending" | "paid" | "failed"> = {
    created: "pending",
    partial: "pending",
    paid: "paid",
    overpaid: "paid",
    cancel: "failed",
    expired: "failed",
  };
  return map[status.toLowerCase()] ?? "pending";
}
