import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
    // Matcher excluding API routes, static assets, and favicon to prevent redirect loops
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
