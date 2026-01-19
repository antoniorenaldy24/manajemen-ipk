import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/db";
import { logLoginAttempt } from "./lib/logging/auth-logger";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "Monitoring IPK Login",
            credentials: {
                username: { label: "NIP / NIM", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const identifier = credentials.username as string;
                const password = credentials.password as string;

                logLoginAttempt(identifier, "ATTEMPT");

                try {
                    // Check if identifier is likely a NIM (digits)
                    const isNIM = /^\d+$/.test(identifier);

                    let user = null;

                    if (isNIM) {
                        // NIM Login Strategy:
                        // 1. Hash NIM -> Find Student
                        // 2. Get User ID from Student -> Find User
                        const { hashNIM } = await import("./lib/security/crypto");
                        const nimHash = hashNIM(identifier);

                        const student = await prisma.student.findUnique({
                            where: { nim_hash: nimHash },
                            select: { user_id: true }
                        });

                        if (student && student.user_id) {
                            user = await prisma.user.findUnique({
                                where: { id: student.user_id }
                            });
                        }
                    }

                    // Fallback: If not found as Student (or not NIM), try direct User lookup (Staff NIP or Email)
                    if (!user) {
                        user = await prisma.user.findUnique({
                            where: { email: identifier },
                        });
                    }

                    if (!user) {
                        logLoginAttempt(identifier, "FAILURE", "User not found");
                        return null;
                    }

                    const isMatch = await compare(password, user.password_hash);

                    if (!isMatch) {
                        logLoginAttempt(identifier, "FAILURE", "Invalid password");
                        return null;
                    }

                    logLoginAttempt(identifier, "SUCCESS");

                    return {
                        id: user.id,
                        name: identifier, // Display NIM or Email
                        email: user.email,
                        role: user.role,
                    };
                } catch (error) {
                    logLoginAttempt(identifier, "FAILURE", "System Error");
                    console.error("Auth Error:", error);
                    return null;
                }
            },
        }),
    ],
});
