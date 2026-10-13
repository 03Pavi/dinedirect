import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/schemas/auth-schema'
import { hashPassword } from '@/utils/hash'
import { signToken } from '@/utils/jwt'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      )
    }

    const { email, password, name, role, phone } = parsed.data

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('User')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (checkError) {
      return NextResponse.json(
        { error: 'Database error checking existing user' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Insert user into Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('User')
      .insert({
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
        phone: phone || null,
      })
      .select('id, email, name, role, phone, createdAt')
      .single()

    if (insertError || !newUser) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Sign JWT token
    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role as 'CUSTOMER' | 'RESTAURANT_OWNER',
      name: newUser.name,
    })

    const response = NextResponse.json({
      success: true,
      user: newUser,
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
