import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCryptoPayment } from "@/lib/payments/crypto";
import { notifyNewOrder } from "@/lib/telegram/notifications";
import { getAllPlans } from "@/lib/chatgpt-data";
import { z } from "zod";

const schema = z.object({
  planId: z.string(),
  accountEmail: z.string().email(),
});

const ALL_PLANS = getAllPlans();
// Курс USD/RUB для конвертации (обновлять периодически)
const USD_RATE = Number(process.env.USD_RATE ?? "90");

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { planId, accountEmail } = parsed.data;
  const plan = ALL_PLANS.find((p) => p.id === planId);
  if (!plan || plan.price <= 0) {
    return NextResponse.json({ error: "Plan not found" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://subrf.ru";
  const amountUsd = Math.ceil((plan.price / USD_RATE) * 100) / 100;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      product: plan.productId,
      plan_id: plan.id,
      price: plan.price,
      currency: "RUB",
      payment_method: "crypto",
      payment_provider: "cryptocloud",
      account_email: accountEmail,
      status: "pending",
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  try {
    const payment = await createCryptoPayment({
      orderId: order.id,
      amount: amountUsd,
      description: `GBT STORE — ${plan.name}`,
      returnUrl: `${appUrl}/checkout/success?order=${order.id}`,
    });

    await supabase
      .from("orders")
      .update({ payment_id: payment.invoiceId })
      .eq("id", order.id);

    await notifyNewOrder(order, user).catch(() => {});

    return NextResponse.json({ paymentUrl: payment.paymentUrl, orderId: order.id });
  } catch (err) {
    console.error("CryptoCloud payment create error:", err);
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: "Payment service unavailable" }, { status: 502 });
  }
}
