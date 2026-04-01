import { authConfig } from "@/lib/auth.config";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "parzivaleu@gmail.com";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const { pathname } = req.nextUrl;

  console.log("MIDDLEWARE:", pathname, "| email:", session?.user?.email ?? "null");

  // /admin — réservé à l'email admin uniquement
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    if (session?.user?.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/dashboard/bot", req.url));
    }
  }

  // /dashboard — doit être connecté
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  // /signin — redirige vers le dashboard si déjà connecté
  if (pathname.startsWith("/signin") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard/bot", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/signin"],
};
