import { getDb } from "@/lib/db"
import { linkedinProfiles } from "@noticias/database"
import { eq, and } from "drizzle-orm"

const LINKEDIN_CLIENT_ID = process.env.VITE_LINKEDIN_CLIENT_ID || process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || ""
const LINKEDIN_CLIENT_SECRET = process.env.VITE_LINKEDIN_CLIENT_SECRET || process.env.LINKEDIN_CLIENT_SECRET || ""
const LINKEDIN_REDIRECT_URI = process.env.VITE_LINKEDIN_REDIRECT_URI || process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI || ""

export function getLinkedInAuthUrl() {
  const state = Math.random().toString(36).substring(7)
  const scope = "openid,profile,email,w_member_social,r_1st_connections_size,r_organization_social,r_organization_admin,w_organization_social"

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
    .onConflictDoUpdate({
      target: [linkedinProfiles.userId, linkedinProfiles.linkedinId],
      set: {
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
        updatedAt: new Date(),
      },
    })
    .returning()

  return profile
}

export async function getLinkedInOrganizations(accessToken: string) {
  const resp = await fetch(
    `https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&projection=(elements*(*,organization~(localizedName,logoV2(original~:playableStreams))))`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    },
  )

  if (!resp.ok) {
    console.error(`[linkedin] organizationAcls fallo (${resp.status})`)
    return []
  }

  const data = await resp.json().catch(() => ({ elements: [] }))
  return (data.elements || [])
    .filter((e: any) => e.organization)
    .map((e: any) => {
      const org = e.organization
      const orgId = org.includes(":") ? org.split(":").pop() : org
      const streams =
        e["organization~"]?.logoV2?.["original~"]?.elements?.[0]?.identifiers?.[0]?.identifier || null
      return {
        urn: org,
        id: orgId,
        name: e["organization~"]?.localizedName || `Página ${orgId}`,
        logoUrl: streams,
        role: e.role,
      }
    })
}

export async function saveLinkedInOrganization(
  org: { urn: string; id: string; name: string; logoUrl?: string | null },
  tokens: any,
  userId: string,
) {
  const db = getDb()
  const [profile] = await db
    .insert(linkedinProfiles)
    .values({
      userId,
      linkedinId: org.id,
      firstName: org.name,
      lastName: null,
      profileName: org.name,
      profilePictureUrl: org.logoUrl || null,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : null,
      profileType: "company",
      isActive: true,
      isPrimary: false,
    })
    .onConflictDoUpdate({
      target: [linkedinProfiles.userId, linkedinProfiles.linkedinId],
      set: {
        firstName: org.name,
        profileName: org.name,
        profilePictureUrl: org.logoUrl || null,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        isActive: true,
        updatedAt: new Date(),
      },
    })
    .returning()

  return profile
}

export async function uploadImageToLinkedIn(profileId: number, imageUrlOrBase64: string, isBase64?: boolean, imageMime?: string): Promise<string | null> {
  const db = getDb()
  const [profile] = await db
    .select()
    .from(linkedinProfiles)
    .where(eq(linkedinProfiles.id, profileId))
    .limit(1)
  if (!profile) throw new Error("LinkedIn profile not found")

  const isOrg = profile.profileType === "company" || profile.profileType === "organization"

  let imageBody: ArrayBuffer
  let mimeType = imageMime || "image/jpeg"
  if (isBase64) {
    const buf = Buffer.from(imageUrlOrBase64, "base64")
    imageBody = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  } else {
    const imageResp = await fetch(imageUrlOrBase64)
    if (!imageResp.ok) throw new Error("Failed to fetch image")
    imageBody = await imageResp.arrayBuffer()
  }

  const registerResp = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${profile.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "Linkedin-Version": "202607",
    },
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: isOrg
          ? `urn:li:organization:${profile.linkedinId}`
          : `urn:li:person:${profile.linkedinId}`,
      },
    }),
  })

  const registerRaw = await registerResp.text()
  if (!registerResp.ok) {
    let msg: string
    try { msg = `LinkedIn initializeUpload failed (${registerResp.status}): ${JSON.parse(registerRaw).message}` } catch { msg = `LinkedIn initializeUpload failed (${registerResp.status}): ${registerRaw || "empty response"}` }
    console.error(msg)
    throw new Error(msg)
  }

  const registerData = JSON.parse(registerRaw)
  const uploadUrl = registerData.value?.uploadUrl || null
  const assetUrn = registerData.value?.image

  if (!uploadUrl || !assetUrn) {
    throw new Error(`LinkedIn upload failed. Response: ${JSON.stringify(registerData).substring(0, 500)}`)
  }

  const uploadResp = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: imageBody,
  })

  if (!uploadResp.ok) {
    const uploadErr = await uploadResp.text().catch(() => "unknown")
    const msg = `LinkedIn image upload failed (${uploadResp.status}): ${uploadErr}`
    console.error(msg)
    throw new Error(msg)
  }

  await waitForImageAvailable(profile.accessToken, assetUrn)

  return assetUrn
}

async function waitForImageAvailable(accessToken: string, imageUrn: string, maxAttempts = 30) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const resp = await fetch(`https://api.linkedin.com/rest/images?ids=List(${encodeURIComponent(imageUrn)})`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "Linkedin-Version": "202607",
      },
    })
    if (!resp.ok) {
      if (resp.status === 403 || resp.status === 401) {
        console.error(`LinkedIn image status GET rejected (${resp.status}); proceeding optimistically after PUT`)
        await sleep(3000)
        return
      }
      await sleep(1500)
      continue
    }
    const data = await resp.json().catch(() => null)
    const image = data?.results?.[imageUrn] ?? data?.results?.[imageUrn]?.value
    if (image?.status === "AVAILABLE") return
    if (image?.status === "PROCESSING_FAILED" || image?.status === "CLIENT_ERROR") {
      throw new Error(`LinkedIn image ${image.status}: ${JSON.stringify(data).substring(0, 500)}`)
    }
    await sleep(1500)
  }
  throw new Error(`LinkedIn image not AVAILABLE after ${maxAttempts * 1.5}s`)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

  let commentary = content
  if (sourceUrl) {
    commentary = commentary.replace(sourceUrl, "")
    commentary = `${commentary.trim()}\n\nFuente: ${sourceUrl}`
  }

  const body: any = {
    author: profile.profileType === "company" || profile.profileType === "organization"
      ? `urn:li:organization:${profile.linkedinId}`
      : `urn:li:person:${profile.linkedinId}`,
    commentary,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
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

  const bodyStr = JSON.stringify(body)
  console.error("LinkedIn post body:", bodyStr.substring(0, 2000))
  const response = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${profile.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "Linkedin-Version": "202607",
    },
    body: bodyStr,
  })

  const raw = await response.text()
  const restliId = response.headers.get("x-restli-id")

  if (!response.ok) {
    let msg: string
    try { msg = `LinkedIn post failed (${response.status}): ${JSON.parse(raw).message}` } catch { msg = `LinkedIn post failed (${response.status}): ${raw || "empty response"}` }
    console.error(msg)
    throw new Error(msg)
  }

  const parsed = raw ? JSON.parse(raw) : { id: null }
  if (restliId) {
    parsed.id = restliId
    parsed.urn = restliId
  }
  return parsed
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
