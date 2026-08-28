import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPallyPayment } from "@/lib/payments/pally";
import { getAllPlans } from "@/lib/chatgpt-data";
import { notifyNewOrder } from "@/lib/telegram/notifications";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const body = (await request.json()) as { planId?: string; accountEmail?: string };
    const { planId, accountEmail } = body;

    if (!planId || !accountEmail) {
      return NextResponse.json(
        { error: "Укажите тариф и email аккаунта ChatGPT" },
        { status: 400 }
      );
    }

    const allPlans = getAllPlans();
    const plan = allPlans.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: "Тариф не найден" }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        product: plan.productId ?? "chatgpt-plus",
        plan_id: plan.id,
        price: plan.price,
        status: "pending",
        account_email: accountEmail,
        payment_provider: "pally",
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("[Checkout] Ошибка создания заказа:", orderError);
      return NextResponse.json({ error: "Ошибка создания заказа" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const payment = await createPallyPayment({
      orderId: order.id,
      amount: plan.price,
      description: `GBT STORE: ${plan.name}`,
      returnUrl: `${appUrl}/checkout/success`,
      webhookUrl: `${appUrl}/api/payments/pally/webhook`,
      customerEmail: user.email ?? undefined,
    });

    await supabase
      .from("orders")
      .update({ payment_id: payment.paymentId, pally_order_id: payment.paymentId })
      .eq("id", order.id);

    await notifyNewOrder(
      { id: order.id, plan_name: plan.name, price: plan.price, account_email: accountEmail },
      { email: user.email ?? null }
    );

    return NextResponse.json({ paymentUrl: payment.paymentUrl, orderId: order.id });
  } catch (err) {
    console.error("[Checkout] Ошибка:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Внутренняя ошибка" },
      { status: 500 }
    );
  }
}
