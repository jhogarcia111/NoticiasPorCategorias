import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import { db } from "@noticias/database"
import { profiles } from "@noticias/database"
import { eq } from "drizzle-orm"

export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const { signInWithPassword } = await import("./supabase-auth")
        const { data, error } = await signInWithPassword(
          credentials.email as string,
          credentials.password as string,
        )

        if (error || !data?.user) return null

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.email?.split("@")[0],
        }
      },
    },
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub

        const [profile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.id, token.sub))
          .limit(1)

        if (profile) {
          session.user.role = profile.role ?? "user"
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
