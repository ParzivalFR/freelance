import { authConfig } from "@/lib/auth.config";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "parzivaleu@gmail.com";

const { auth } = NextAuth(authConfig);

export async function proxy(request: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const { pathname } = request.nextUrl;

  // /admin — réservé à l'email admin uniquement
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    if (session?.user?.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/dashboard/bot", request.url));
    }
  }

  // /dashboard — doit être connecté
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  // /signin — redirige vers le dashboard si déjà connecté
  if (pathname.startsWith("/signin") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard/bot", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/signin"],
};
