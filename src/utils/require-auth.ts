import { NextRequest } from 'next/server'
import { verifyToken, JwtUserPayload } from './jwt'

export async function requireAuth(req: NextRequest): Promise<JwtUserPayload | null> {
  // Check cookie first (httpOnly)
  const cookieToken = req.cookies.get('token')?.value

  if (cookieToken) {
    const payload = verifyToken(cookieToken)
    if (payload) return payload
  }

  // Fallback to Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    if (payload) return payload
  }

  return null
}
