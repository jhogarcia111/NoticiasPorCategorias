import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import LinkedIn from "next-auth/providers/linkedin"
import Google from "next-auth/providers/google"
import { getDb, profiles, linkedinProfiles, subscriptions } from "@noticias/database"
import { eq, and, inArray, sql } from "drizzle-orm"

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
          scope:
            "openid profile email w_member_social r_1st_connections_size r_organization_social r_organization_admin w_organization_social",
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
      if (!user.email || !user.id) return true

      const db = getDb()
      const email = user.email.toLowerCase().trim()
      const emailPrefix = user.email.split("@")[0]

      // Buscar perfil por email primero (columna canónica), luego por username.
      // Evita duplicar cuentas cuando el mismo usuario usa Google/LinkedIn/email-password.
      let [profile] = await db
        .select()
        .from(profiles)
        .where(sql`lower(coalesce(${profiles.email}, '')) = ${email}`)
        .limit(1)

      if (!profile) {
        // Fallback: username = prefijo del email (cuentas viejas sin email registrado)
        ;[profile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.username, emailPrefix))
          .limit(1)
      }

      if (!profile && user.name) {
        // Fallback 2: coincidencia por nombre mostrado (ej. perfiles creados por Google).
        // Prefiere el perfil con suscripción activa; si hay varios, el más antiguo.
        const candidates = await db
          .select()
          .from(profiles)
          .where(sql`lower(trim(${profiles.username})) = ${user.name.toLowerCase().trim()}`)
          .limit(10)
        if (candidates.length > 0) {
          const activeIds = new Set(
            (
              await db
                .select({ userId: subscriptions.userId })
                .from(subscriptions)
                .where(inArray(subscriptions.status, ["active", "trialing"]))
            ).map((row) => row.userId),
          )
          const withActive = candidates.filter((c) => activeIds.has(c.id))
          const pool = withActive.length > 0 ? withActive : candidates
          pool.sort(
            (a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0),
          )
          profile = pool[0]
        }
      }

      let profileId = profile?.id

      if (!profileId) {
        // No hay perfil para este usuario — crear uno nuevo
        const [created] = await db
          .insert(profiles)
          .values({
            id: user.id,
            username: user.name || emailPrefix,
            email,
            role: "user",
          })
          .returning()
        profileId = created.id
      } else {
        // Asegurar que el perfil canónico tenga el email para futuras coincidencias
        if (!profile.email) {
          await db.update(profiles).set({ email }).where(eq(profiles.id, profileId))
        }
      }

      // Si el perfil existente tiene id distinto al user.id del provider,
      // mapear todas las relaciones al id canónico
      if (profileId !== user.id) {
        // El JWT usará el id canónico del perfil existente
        user.id = profileId
      }

      if (account?.provider === "linkedin" && account.access_token) {
        const [existingLinkedIn] = await db
          .select()
          .from(linkedinProfiles)
          .where(eq(linkedinProfiles.userId, profileId))
          .limit(1)

        if (existingLinkedIn) {
          await db
            .update(linkedinProfiles)
            .set({
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              tokenExpiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
              linkedinId: account.providerAccountId || profileId,
            })
            .where(eq(linkedinProfiles.id, existingLinkedIn.id))
        } else {
          await db.insert(linkedinProfiles).values({
            userId: profileId,
            linkedinId: account.providerAccountId || profileId,
            firstName: user.name,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            tokenExpiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
            isActive: true,
            isPrimary: true,
          })
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
        // user.id puede haber sido reasignado en signIn al id canónico
        token.sub = user.id
        // Guardar email en token para búsqueda futura
        token.email = user.email
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
