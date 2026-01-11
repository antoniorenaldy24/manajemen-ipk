import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            role: string // Add role to session type
        } & DefaultSession["user"]
    }

    interface User {
        role: string // Add role to user type
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        id: string
    }
}
