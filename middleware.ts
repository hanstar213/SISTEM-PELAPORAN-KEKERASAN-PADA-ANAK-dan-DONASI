import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth?.token?.role;

    // Admin routes: hanya ADMIN dan MODERATOR
    if (pathname.startsWith("/admin") && !["ADMIN", "MODERATOR"].includes(role)) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Report route: semua user yang sudah login bisa akses
    // (withAuth sudah memastikan user sudah login)

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Admin routes: harus punya role ADMIN/MODERATOR
        if (pathname.startsWith("/admin")) {
          return Boolean(token?.role && ["ADMIN", "MODERATOR"].includes(token.role));
        }

        // Report route: harus login (token harus ada)
        if (pathname.startsWith("/report")) {
          return Boolean(token);
        }

        return true;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/report", "/report/:path*"],
};
