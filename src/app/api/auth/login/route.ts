import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/schemas/auth-schema'
import { comparePassword } from '@/utils/hash'
import { signToken } from '@/utils/jwt'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid email or password' },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id, email, password, role, name, phone, createdAt')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'RESTAURANT_OWNER',
      name: user.name,
    })

    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
    }

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      token,
    })

    // Set httpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
