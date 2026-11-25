"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Crown, Plane, Star } from "lucide-react";

import { ConnectCheckoutButton } from "@/components/checkout/ConnectCheckoutButton";
import { PlusReadyNotice } from "@/components/landing/PlusReadyNotice";
import type { ExtendedPlan } from "@/lib/chatgpt-data";
import {
  matchesGptPlanQuery,
  readGptPlanSearchFromUrl,
  subscribeGptPlanSearch,
} from "@/lib/landing/gpt-plan-search";
import { mergeGptStorefrontPlans } from "@/lib/landing/gpt-storefront-plans";
import { cn } from "@/lib/utils";

type PlanRow = ExtendedPlan & {
  original_price?: number;
  landing_discount_name?: string | null;
};

function formatRub(price: number): string {
  const n = Number(price);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("ru")} ₽`;
}

function PlanPrice({ plan }: { plan: PlanRow }) {
  const original = plan.original_price;
  const showOld = typeof original === "number" && original > plan.price;
  return (
    <div className="mt-3">
      {showOld ? (
        <p className="text-xs font-semibold text-gray-400 line-through">{formatRub(original)}</p>
      ) : null}
      <p className="font-heading text-2xl font-bold text-[#10a37f]">{formatRub(plan.price)}</p>
      {plan.landing_discount_name ? (
        <p className="mt-0.5 text-[11px] font-medium text-[#0f7d62]">{plan.landing_discount_name}</p>
      ) : null}
    </div>
  );
}

function ConnectBtn({ plan, skipAuthGate }: { plan: PlanRow; skipAuthGate: boolean }) {
  return (
    <ConnectCheckoutButton
      siteSlug="gpt-store"
      planId={plan.id}
      planName={plan.name}
      trackSource="landing_simple_plans"
      skipAuthGate={skipAuthGate}
      className="mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#10a37f] px-3 text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(16,163,127,0.28)] transition-opacity hover:opacity-90"
    >
      Подключить за {formatRub(plan.price)}
    </ConnectCheckoutButton>
  );
}

export function GptSimplePlans({
  initialPlans,
  skipAuthGate = false,
}: {
  initialPlans: ExtendedPlan[];
  skipAuthGate?: boolean;
}) {
  const plans = useMemo(() => mergeGptStorefrontPlans(initialPlans) as PlanRow[], [initialPlans]);
  const go = plans.find((p) => p.id === "go-1m");
  const plusStd = plans.find((p) => p.id === "plus-std");
  const plusFast = plans.find((p) => p.id === "plus-fast");
  const plusReady = plans.find((p) => p.id === "plus-ready");
  const pro5 = plans.find((p) => p.id === "pro-5x");
  const pro20 = plans.find((p) => p.id === "pro-20x");

  const [plusId, setPlusId] = useState<"plus-std" | "plus-fast" | "plus-ready">("plus-std");
  const [proId, setProId] = useState<"pro-5x" | "pro-20x">("pro-5x");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(readGptPlanSearchFromUrl());
    return subscribeGptPlanSearch(setQuery);
  }, []);

  const plusPlan =
    plusId === "plus-ready" ? plusReady : plusId === "plus-fast" ? plusFast : plusStd;
  const proPlan = proId === "pro-20x" ? pro20 : pro5;

  const showGo = Boolean(go) && matchesGptPlanQuery("chatgpt go go повседневных", query);
  const showPlus =
    Boolean(plusPlan && plusStd && plusFast) &&
    matchesGptPlanQuery("chatgpt plus plus готовый аккаунт возможностей", query);
  const showPro =
    Boolean(proPlan && pro5 && pro20) &&
    matchesGptPlanQuery("chatgpt pro pro производительность 5x 20x", query);

  return (
    <section id="plans" className="scroll-mt-16 px-4 pb-6 pt-8 md:px-6 md:pb-10 md:pt-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-gray-900 md:text-4xl">Тарифы</h2>
          <p className="mt-2 text-base leading-6 text-gray-600">Выберите вариант под свои задачи</p>
        </div>

        {!showGo && !showPlus && !showPro ? (
          <p className="rounded-[1.35rem] bg-white px-5 py-8 text-center text-sm text-gray-500">
            Нет тарифов по запросу «{query.trim()}»
          </p>
        ) : null}

        <div className="plans-grid grid items-start gap-3 md:grid-cols-3 md:gap-4">
          {showGo && go ? (
            <article className="flex flex-col rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm">
              <Plane className="h-8 w-8 text-[#10a37f]" strokeWidth={2} aria-hidden />
              <h2 className="font-heading mt-2 text-xl font-bold text-gray-900">ChatGPT Go</h2>
              <p className="mt-1 text-[15px] leading-6 text-gray-600">
                Больше, чем бесплатный ChatGPT. Со входом в ваш аккаунт.
              </p>
              <PlanPrice plan={go} />
              <div className="mt-3">
                <ConnectBtn plan={go} skipAuthGate={skipAuthGate} />
              </div>
            </article>
          ) : null}

          {showPlus && plusPlan && plusStd && plusFast ? (
            <article className="relative flex flex-col rounded-2xl border-2 border-[#10a37f] bg-white p-5 shadow-md">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#b8f05c] px-3 py-1 text-[12px] font-semibold text-[#1f3d12]">
                Самый популярный
              </span>
              <Star className="mt-1 h-8 w-8 rounded-md bg-[#10a37f] p-1.5 text-white" strokeWidth={2} aria-hidden />
              <h2 className="font-heading mt-2 text-xl font-bold text-gray-900">ChatGPT Plus</h2>
              <p className="mt-1 text-[15px] leading-6 text-gray-600">
                На ваш ChatGPT, без входа или готовый аккаунт.
              </p>
              <div className="mt-3 space-y-2">
                {plusReady ? (
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5",
                      plusId === "plus-ready" ? "border-[#10a37f] bg-[#10a37f]/6" : "border-black/[0.08]",
                    )}
                  >
                    <input
                      type="radio"
                      name="plus-mode"
                      className="mt-1 h-4 w-4 accent-[#10a37f]"
                      checked={plusId === "plus-ready"}
                      onChange={() => setPlusId("plus-ready")}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-[14px] font-semibold leading-5 text-gray-900">Готовый аккаунт</span>
                        <span className="shrink-0 text-[14px] font-bold text-gray-900">
                          {formatRub(plusReady.price)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-5 text-gray-600">
                        Выдаём готовый ChatGPT Plus на 30 дней
                      </span>
                    </span>
                  </label>
                ) : null}
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5",
                    plusId === "plus-std" ? "border-[#10a37f] bg-[#10a37f]/6" : "border-black/[0.08]",
                  )}
                >
                  <input
                    type="radio"
                    name="plus-mode"
                    className="mt-1 h-4 w-4 accent-[#10a37f]"
                    checked={plusId === "plus-std"}
                    onChange={() => setPlusId("plus-std")}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-[14px] font-semibold leading-5 text-gray-900">
                        Подключение со входом в аккаунт
                      </span>
                      <span className="shrink-0 text-[14px] font-bold text-gray-900">{formatRub(plusStd.price)}</span>
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-gray-600">Нужен вход в ваш ChatGPT</span>
                  </span>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5",
                    plusId === "plus-fast" ? "border-[#10a37f] bg-[#10a37f]/6" : "border-black/[0.08]",
                  )}
                >
                  <input
                    type="radio"
                    name="plus-mode"
                    className="mt-1 h-4 w-4 accent-[#10a37f]"
                    checked={plusId === "plus-fast"}
                    onChange={() => setPlusId("plus-fast")}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-[14px] font-semibold leading-5 text-gray-900">
                        Подключение без входа в аккаунт
                      </span>
                      <span className="shrink-0 text-[14px] font-bold text-gray-900">{formatRub(plusFast.price)}</span>
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-gray-600">Вход в ваш ChatGPT не нужен</span>
                  </span>
                </label>
              </div>
              {plusId === "plus-ready" ? <PlusReadyNotice className="mt-3" /> : null}
              <div className="mt-3">
                <ConnectBtn plan={plusPlan} skipAuthGate={skipAuthGate} />
              </div>
            </article>
          ) : null}

          {showPro && proPlan && pro5 && pro20 ? (
            <article className="flex flex-col rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm">
              <Crown className="h-8 w-8 text-[#7c3aed]" strokeWidth={2} aria-hidden />
              <h2 className="font-heading mt-2 text-xl font-bold text-gray-900">ChatGPT Pro</h2>
              <p className="mt-1 text-[15px] leading-6 text-gray-600">Максимум лимитов. Со входом в ваш аккаунт.</p>
              <div className="mt-3 space-y-2">
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5",
                    proId === "pro-20x" ? "border-[#10a37f] bg-[#10a37f]/6" : "border-black/[0.08]",
                  )}
                >
                  <input
                    type="radio"
                    name="pro-mode"
                    className="mt-1 h-4 w-4 accent-[#10a37f]"
                    checked={proId === "pro-20x"}
                    onChange={() => setProId("pro-20x")}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-[14px] font-semibold leading-5 text-gray-900">
                        ChatGPT Pro 20x — Максимальный
                      </span>
                      <span className="shrink-0 text-[14px] font-bold text-gray-900">{formatRub(pro20.price)}</span>
                    </span>
                  </span>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5",
                    proId === "pro-5x" ? "border-[#10a37f] bg-[#10a37f]/6" : "border-black/[0.08]",
                  )}
                >
                  <input
                    type="radio"
                    name="pro-mode"
                    className="mt-1 h-4 w-4 accent-[#10a37f]"
                    checked={proId === "pro-5x"}
                    onChange={() => setProId("pro-5x")}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-[14px] font-semibold leading-5 text-gray-900">
                        ChatGPT Pro 5x — Популярный
                      </span>
                      <span className="shrink-0 text-[14px] font-bold text-gray-900">{formatRub(pro5.price)}</span>
                    </span>
                  </span>
                </label>
              </div>
              <details className="group mt-2 rounded-xl border border-black/[0.08] px-3 py-2.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[14px] font-medium text-gray-800 marker:content-none [&::-webkit-details-marker]:hidden">
                  Чем отличается 5× от 20×?
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="mt-2 border-t border-black/[0.06] pt-2 text-[13px] leading-6 text-gray-600">
                  Одинаковые функции Pro. 5× — для активной работы, 20× — для постоянной нагрузки.
                </p>
              </details>
              <div className="mt-3">
                <ConnectBtn plan={proPlan} skipAuthGate={skipAuthGate} />
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}
