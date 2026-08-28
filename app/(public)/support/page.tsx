"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Home, MessageCircle, ShoppingBag, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { OperatorChat } from "@/components/chat/OperatorChat";
import { GuestOperatorChat } from "@/components/chat/GuestOperatorChat";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type Tab = "ai" | "operator";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

const getTime = () =>
  new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

const QUICK = [
  { label: "Как оформить заказ", msg: "Как оформить заказ?" },
  { label: "Сколько стоит", msg: "Сколько стоит подписка?" },
  { label: "Срок активации", msg: "За какое время выполняете активацию?" },
  { label: "Гарантия", msg: "Какая гарантия на подписку?" },
  { label: "Оплата не проходит", msg: "Не проходит оплата, что делать?" },
  { label: "Как продлить", msg: "Как продлить подписку?" },
];

const FAQ_ITEMS = [
  "Как оформить заказ?",
  "Сколько стоит подписка?",
  "Есть ли гарантия на подписку?",
  "Как активировать ChatGPT Plus?",
  "Чем отличается Plus от Pro?",
  "Как передать данные для активации?",
  "Когда будет готова подписка?",
  "Можно ли оплатить картой РФ?",
  "Работаете ли вы в выходные?",
  "Как связаться с поддержкой?",
  "Что делать если не работает вход?",
  "Есть ли скидки на продление?",
  "Как отменить автопродление?",
  "Где посмотреть статус заказа?",
  "Как оформить возврат средств?",
];

const NAV = [
  { Icon: Home, label: "Главная", href: "/" },
  { Icon: MessageCircle, label: "Поддержка", href: "/support" },
  { Icon: ShoppingBag, label: "Мои заказы", href: "/dashboard/orders" },
  { Icon: User, label: "Профиль", href: "/dashboard/profile" },
];

export default function SupportPage() {
  const pathname = usePathname();
  const [tab, setTab] = useState<Tab>("ai");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Здравствуйте! Я отвечу на вопросы о ChatGPT Go, Plus и Pro. Чем могу помочь?",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [operatorSessionId, setOperatorSessionId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setOperatorSessionId(null);
      return;
    }

    let isCancelled = false;
    const supabase = createClient();

    const loadOrCreateOperatorSession = async () => {
      setSessionLoading(true);

      const { data: existing, error: selectError } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (isCancelled) return;

      if (selectError && selectError.code !== "PGRST116") {
        console.error("[Support] Не удалось загрузить chat_session:", selectError);
      }

      if (existing?.id) {
        setOperatorSessionId(existing.id);
        setSessionLoading(false);
        return;
      }

      const { data: created, error: createError } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          type: "operator",
          status: "open",
        })
        .select("id")
        .single();

      if (isCancelled) return;

      if (createError) {
        console.error("[Support] Не удалось создать chat_session:", createError);
        setOperatorSessionId(null);
      } else {
        setOperatorSessionId(created.id);
      }

      setSessionLoading(false);
    };

    loadOrCreateOperatorSession();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text, time: getTime() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsTyping(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "", time: getTime() }]);

    try {
      const apiMessages = updated
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }))
        .filter((m) => m.content.trim());

      const res = await fetch("/api/chat/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("no reader");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            copy[copy.length - 1] = { ...last, content: last.content + chunk };
          }
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content:
            "Не удалось получить ответ. Напишите нам в Telegram или повторите попытку позже.",
          time: getTime(),
        };
        return copy;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const showQuickReplies = messages.length <= 1;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-30 flex h-full w-60 flex-col bg-[#111827] transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-4 py-5">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10a37f] text-sm font-bold text-white">
              G
            </div>
            <span className="font-heading text-sm font-bold text-white">GBT STORE</span>
          </a>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.Icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? "border-l-2 border-[#10a37f] bg-[#10a37f]/15 pl-2.5 text-[#10a37f]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16} className="shrink-0 opacity-90" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#10a37f]" />
            <span className="text-xs text-gray-400">На связи</span>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Открыть меню"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900">Поддержка</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="bg-[#10a37f] px-4 pb-0 pt-4">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white">
                  G
                </div>
                <div>
                  <p className="font-semibold text-white">GBT STORE — поддержка</p>
                  <p className="flex items-center gap-1 text-xs text-white/80">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    На связи
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-0 mb-3 flex gap-1 rounded-lg bg-white/15 p-0.5">
              {(["ai", "operator"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className="flex-1 rounded-md py-1.5 text-xs font-medium transition-all"
                  style={{
                    backgroundColor: tab === t ? "white" : "transparent",
                    color: tab === t ? "#10a37f" : "rgba(255,255,255,0.85)",
                  }}
                >
                  {t === "ai" ? "ИИ-ассистент" : "Оператор"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
            {tab === "ai" ? (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={`${i}-${msg.time}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className="max-w-[75%]">
                        <div
                          className={`p-3 text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-[#10a37f] text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                          style={{
                            borderRadius:
                              msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          }}
                        >
                          {msg.content}
                          {msg.role === "assistant" && msg.content === "" && isTyping && (
                            <div className="flex gap-1 py-0.5">
                              {[0, 1, 2].map((j) => (
                                <motion.div
                                  key={j}
                                  className="h-2 w-2 rounded-full bg-gray-400"
                                  animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                                  transition={{ duration: 0.7, repeat: Infinity, delay: j * 0.15 }}
                                />
                              ))}
                            </div>
                          )}
                          {msg.role === "assistant" &&
                            msg.content !== "" &&
                            i === messages.length - 1 &&
                            isTyping && (
                              <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-gray-500 align-middle" />
                            )}
                        </div>
                        <p className="mt-1 px-1 text-[10px] text-gray-400">{msg.time}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {showQuickReplies && (
                  <div className="border-t border-gray-100 px-3 py-2">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                      {QUICK.map((q) => (
                        <button
                          key={q.msg}
                          type="button"
                          onClick={() => sendMessage(q.msg)}
                          className="shrink-0 rounded-full border border-[#10a37f]/30 px-3 py-1.5 text-xs text-[#10a37f] transition-colors hover:bg-[#10a37f]/10"
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 p-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage(input);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Введите сообщение"
                      className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-[#10a37f]/20"
                    />
                    <button
                      type="submit"
                      disabled={isTyping || !input.trim()}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10a37f] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {authLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#10a37f] border-t-transparent" />
                  </div>
                ) : sessionLoading ? (
                  <div className="flex h-full items-center justify-center gap-3 text-sm text-gray-500">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#10a37f] border-t-transparent" />
                    Подключаем чат с оператором...
                  </div>
                ) : user && operatorSessionId ? (
                  <OperatorChat sessionId={operatorSessionId} userId={user.id} />
                ) : (
                  <GuestOperatorChat />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="hidden w-72 flex-col overflow-y-auto border-l border-gray-200 bg-white xl:flex">
        <div className="border-b border-gray-100 px-4 py-4">
          <p className="text-sm font-semibold text-gray-900">Частые вопросы</p>
          <p className="mt-0.5 text-xs text-gray-400">Нажмите вопрос чтобы отправить его в чат</p>
        </div>
        <div className="flex-1 px-2 py-2">
          {FAQ_ITEMS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setTab("ai");
                sendMessage(q);
              }}
              className="group flex w-full items-center justify-between rounded-lg border-b border-gray-100 px-3 py-2.5 text-left text-sm text-gray-600 transition-all duration-150 last:border-0 hover:bg-[#10a37f]/8 hover:text-[#10a37f]"
            >
              <span>{q}</span>
              <span className="ml-2 shrink-0 text-[#10a37f] opacity-0 transition-opacity group-hover:opacity-100">
                →
              </span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
