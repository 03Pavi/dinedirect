import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/utils/require-auth'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req)

    if (!authUser) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const { data: user, error } = await supabase
      .from('User')
      .select('id, email, name, role, phone, createdAt')
      .eq('id', authUser.id)
      .maybeSingle()

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
