import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    // pages: { signIn: "/api/auth/signin" }, // Using default for now to access debugging
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnStudent = nextUrl.pathname.startsWith("/student");
            const userRole = auth?.user?.role;

            if (isOnDashboard) {
                if (isLoggedIn) {
                    // RBAC: Students cannot access Admin Dashboard
                    if (userRole === "MAHASISWA") {
                        // Redirect to student page
                        return Response.redirect(new URL("/student/dashboard", nextUrl));
                    }
                    return true;
                }
                return false; // Redirect unauthenticated users to login page
            } else if (isOnStudent) {
                if (isLoggedIn) return true;
                return false;
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    providers: [], // Providers configured in auth.ts
    session: {
        strategy: "jwt",
    },
} satisfies NextAuthConfig;
