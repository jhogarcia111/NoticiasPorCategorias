import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import LinkedIn from "next-auth/providers/linkedin"
import Google from "next-auth/providers/google"
import { getDb, profiles, linkedinProfiles, subscriptions } from "@noticias/database"
import { eq, and, inArray } from "drizzle-orm"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    LinkedIn({
      clientId: process.env.VITE_LINKEDIN_CLIENT_ID || process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.VITE_LINKEDIN_CLIENT_SECRET || process.env.LINKEDIN_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid profile email w_member_social",
        },
      },
    }),
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
    async signIn({ user, account }) {
      if ((account?.provider === "google" || account?.provider === "linkedin") && user.email && user.id) {
        const db = getDb()
        const [existing] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.id, user.id))
          .limit(1)

        if (!existing) {
          await db.insert(profiles).values({
            id: user.id,
            username: user.name || user.email.split("@")[0],
            role: "user",
          })
        }

        if (account.provider === "linkedin" && account.access_token) {
          const [existingLinkedIn] = await db
            .select()
            .from(linkedinProfiles)
            .where(eq(linkedinProfiles.userId, user.id))
            .limit(1)

          if (existingLinkedIn) {
            await db
              .update(linkedinProfiles)
              .set({
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                tokenExpiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
                linkedinId: account.providerAccountId || user.id,
              })
              .where(eq(linkedinProfiles.id, existingLinkedIn.id))
          } else {
            await db.insert(linkedinProfiles).values({
              userId: user.id,
              linkedinId: account.providerAccountId || user.id,
              firstName: user.name,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              tokenExpiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
              isActive: true,
              isPrimary: true,
            })
          }
        }
      }
      return true
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub

        const db = getDb()

        const [profile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.id, token.sub))
          .limit(1)

        if (profile) {
          session.user.role = profile.role ?? "user"
        }

        const [sub] = await db
          .select({ status: subscriptions.status })
          .from(subscriptions)
          .where(and(
            eq(subscriptions.userId, token.sub),
            inArray(subscriptions.status, ["active", "trialing"]),
          ))
          .limit(1)

        session.user.subscriptionStatus = sub?.status ?? null
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
