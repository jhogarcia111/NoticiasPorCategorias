import { db } from "@/lib/db"
import { linkedinProfiles, scheduledPosts } from "@noticias/database"
import { eq, and } from "drizzle-orm"

const LINKEDIN_CLIENT_ID = process.env.VITE_LINKEDIN_CLIENT_ID || process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || ""
const LINKEDIN_CLIENT_SECRET = process.env.VITE_LINKEDIN_CLIENT_SECRET || process.env.LINKEDIN_CLIENT_SECRET || ""
const LINKEDIN_REDIRECT_URI = process.env.VITE_LINKEDIN_REDIRECT_URI || process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI || ""
const LINKEDIN_API_URL = "https://api.linkedin.com/v2"

export function getLinkedInAuthUrl() {
  const state = Math.random().toString(36).substring(7)
  const scope = "openid,profile,email,w_member_social"

  const params = new URLSearchParams({
    response_type: "code",
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    state,
    scope,
  })

  return `https://www.linkedin.com/oauth/v2/authorization?${params}`
}

export async function exchangeCodeForTokens(code: string) {
  const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
      redirect_uri: LINKEDIN_REDIRECT_URI,
    }),
  })

  if (!response.ok) throw new Error("LinkedIn token exchange failed")
  return response.json()
}

export async function getLinkedInProfile(accessToken: string) {
  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) throw new Error("Failed to fetch LinkedIn profile")
  return response.json()
}

export async function saveLinkedInProfile(profileData: any, tokens: any, userId: string) {
  const [profile] = await db
    .insert(linkedinProfiles)
    .values({
      userId,
      linkedinId: profileData.sub,
      firstName: profileData.given_name,
      lastName: profileData.family_name,
      email: profileData.email,
      profilePictureUrl: profileData.picture,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : null,
      isActive: true,
      isPrimary: false,
    })
    .returning()

  return profile
}

export async function getLinkedInProfiles(userId: string) {
  return db
    .select()
    .from(linkedinProfiles)
    .where(and(eq(linkedinProfiles.userId, userId), eq(linkedinProfiles.isActive, true)))
    .orderBy(linkedinProfiles.isPrimary)
}

export async function disconnectLinkedInProfile(profileId: number) {
  await db
    .update(linkedinProfiles)
    .set({ isActive: false })
    .where(eq(linkedinProfiles.id, profileId))
}
