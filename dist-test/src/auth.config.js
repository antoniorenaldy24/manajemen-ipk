"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authConfig = void 0;
exports.authConfig = {
    pages: {
        signIn: "/api/auth/signin",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            var _a;
            const isLoggedIn = !!(auth === null || auth === void 0 ? void 0 : auth.user);
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnStudent = nextUrl.pathname.startsWith("/student");
            const userRole = (_a = auth === null || auth === void 0 ? void 0 : auth.user) === null || _a === void 0 ? void 0 : _a.role;
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
            }
            else if (isOnStudent) {
                if (isLoggedIn)
                    return true;
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
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        },
    },
    providers: [], // Providers configured in auth.ts
    session: {
        strategy: "jwt",
    },
};
