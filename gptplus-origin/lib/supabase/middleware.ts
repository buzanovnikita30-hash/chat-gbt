import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Обновляем сессию — важно не удалять этот вызов
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase недоступен (нет .env.local) — продолжаем без сессии
  }

  return { supabaseResponse, user };
}
