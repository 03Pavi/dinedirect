import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dinedirect-default-secret-2026'

export interface JwtUserPayload {
  id: string
  email: string
  role: 'CUSTOMER' | 'RESTAURANT_OWNER'
  name: string
}

export function signToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtUserPayload
  } catch {
    return null
  }
}
