export interface JwtUserPayload {
  id: string
  email: string
  role: 'CUSTOMER' | 'RESTAURANT_OWNER'
  name: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'dinedirect-default-secret-2026'

/**
 * Edge-runtime compatible token verification (uses standard Web Crypto API)
 */
export async function verifyTokenEdge(token: string): Promise<JwtUserPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, signatureB64] = parts

    // Decode payload
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf8')
    const payload = JSON.parse(payloadStr)

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }

    // Verify HMAC-SHA256 signature using Web Crypto API
    const encoder = new TextEncoder()
    const keyData = encoder.encode(JWT_SECRET)
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const data = encoder.encode(`${headerB64}.${payloadB64}`)
    const signature = Buffer.from(signatureB64, 'base64url')

    const isValid = await crypto.subtle.verify('HMAC', key, signature, data)
    if (!isValid) return null

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    }
  } catch {
    return null
  }
}
