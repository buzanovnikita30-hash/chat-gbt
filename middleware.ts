import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { withTimeout } from "@/lib/auth/withTimeout";

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/checkout"];
const AUTH_PREFIXES = ["/login", "/register"];
const AUTH_TIMEOUT_MS = 2500;

function isProtected(path: string) {
  return PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function isAuthPage(path: string) {
  return AUTH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function redirectToLogin(request: NextRequest, returnPath: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("returnUrl", returnPath);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const needsSession = isProtected(path) || isAuthPage(path);

  // Публичные страницы не ходят в Supabase.
  // Иначе пауза/таймаут БД (часто в день списания) вешает middleware → nginx 502 на всём сайте.
  if (!needsSession) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseAnonKey) {
    return isProtected(path) ? redirectToLogin(request, path) : NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const user = await withTimeout(
      supabase.auth.getUser().then((result) => result.data.user),
      AUTH_TIMEOUT_MS
    );

    if (isProtected(path) && !user) {
      return redirectToLogin(request, path);
    }

    const canSwitchAccount = request.nextUrl.searchParams.get("switch") === "1";
    if (isAuthPage(path) && user && !canSwitchAccount) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (path.startsWith("/admin")) {
      if (!user) return redirectToLogin(request, path);
      const { data: profile } = await withTimeout(
        supabase.from("profiles").select("role").eq("id", user.id).single(),
        AUTH_TIMEOUT_MS
      );
      if (!profile || !["admin", "operator"].includes(profile.role ?? "")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return supabaseResponse;
  } catch {
    return isProtected(path) ? redirectToLogin(request, path) : NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|robots.txt|sitemap.xml).*)"],
};
