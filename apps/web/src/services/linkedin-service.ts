import { getDb } from "@/lib/db"
import { linkedinProfiles } from "@noticias/database"
import { eq, and } from "drizzle-orm"

const LINKEDIN_CLIENT_ID = process.env.VITE_LINKEDIN_CLIENT_ID || process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || ""
const LINKEDIN_CLIENT_SECRET = process.env.VITE_LINKEDIN_CLIENT_SECRET || process.env.LINKEDIN_CLIENT_SECRET || ""
const LINKEDIN_REDIRECT_URI = process.env.VITE_LINKEDIN_REDIRECT_URI || process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI || ""

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
  const db = getDb()
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

export async function uploadImageToLinkedIn(profileId: number, imageUrl: string): Promise<string | null> {
  const db = getDb()
  const [profile] = await db
    .select()
    .from(linkedinProfiles)
    .where(eq(linkedinProfiles.id, profileId))
    .limit(1)
  if (!profile) throw new Error("LinkedIn profile not found")

  const imageResp = await fetch(imageUrl)
  if (!imageResp.ok) throw new Error("Failed to fetch image from Pollinations")
  const imageBuffer = await imageResp.arrayBuffer()

  const registerResp = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${profile.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      registerUploadRequest: {
        owner: `urn:li:person:${profile.linkedinId}`,
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        supportedUploadMechanism: ["SYNCHRONOUS_UPLOAD"],
      },
    }),
  })

  const registerRaw = await registerResp.text()
  if (!registerResp.ok) {
    let msg: string
    try { msg = JSON.parse(registerRaw).message } catch { msg = registerRaw || "Register upload failed" }
    throw new Error(msg)
  }

  const registerData = JSON.parse(registerRaw)
  const uploadUrl = registerData.value?.uploadMechanism?.["com.amazonaws.requestUrl"]
  const assetUrn = registerData.value?.asset

  if (!uploadUrl || !assetUrn) throw new Error("Failed to get upload URL from LinkedIn")

  const uploadResp = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: imageBuffer,
  })

  if (!uploadResp.ok) throw new Error("Failed to upload image to LinkedIn")

  return assetUrn
}

export async function postToLinkedIn(
  profileId: number,
  content: string,
  title?: string,
  sourceUrl?: string,
  imageUrn?: string,
) {
  const db = getDb()
  const [profile] = await db
    .select()
    .from(linkedinProfiles)
    .where(eq(linkedinProfiles.id, profileId))
    .limit(1)
  if (!profile) throw new Error("LinkedIn profile not found")

  const commentary = sourceUrl && !content.includes(sourceUrl) ? `${content}\n\n${sourceUrl}` : content

  const body: any = {
    author: `urn:li:person:${profile.linkedinId}`,
    commentary,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
  }

  if (imageUrn) {
    body.content = { media: { id: imageUrn } }
  } else if (sourceUrl) {
    body.content = {
      article: {
        source: sourceUrl,
        title: title || "",
        description: commentary.substring(0, 300),
      },
    }
  }

  const response = await fetch("https://api.linkedin.com/v2/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${profile.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  })

  const raw = await response.text()

  if (!response.ok) {
    let msg: string
    try { msg = JSON.parse(raw).message } catch { msg = raw || "LinkedIn post failed" }
    throw new Error(msg)
  }

  return raw ? JSON.parse(raw) : { id: null }
}

export async function getLinkedInProfiles(userId: string) {
  const db = getDb()
  return db
    .select()
    .from(linkedinProfiles)
    .where(and(eq(linkedinProfiles.userId, userId), eq(linkedinProfiles.isActive, true)))
    .orderBy(linkedinProfiles.isPrimary)
}

export async function disconnectLinkedInProfile(profileId: number) {
  const db = getDb()
  await db
    .update(linkedinProfiles)
    .set({ isActive: false })
    .where(eq(linkedinProfiles.id, profileId))
}
