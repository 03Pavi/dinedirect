import { NextRequest, NextResponse } from 'next/server'
import { resetPasswordSchema } from '@/schemas/auth-schema'
import { hashPassword } from '@/utils/hash'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = resetPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      )
    }

    const { email, newPassword } = parsed.data

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id, email, name')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (userError) {
      return NextResponse.json(
        { error: 'Database error searching for user account' },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No account registered with this email address' },
        { status: 404 }
      )
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password in Supabase User table
    const { error: updateError } = await supabase
      .from('User')
      .update({ password: hashedPassword })
      .eq('email', email.toLowerCase().trim())

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Failed to update password' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
