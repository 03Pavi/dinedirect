import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/coupons
 * Returns active coupons created by restaurants for customer offers discovery.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const restaurantId = searchParams.get('restaurantId')

    let query = supabase
      .from('Coupon')
      .select('*, restaurant:Restaurant(id, name, imageUrl, city)')
      .eq('isActive', true)
      .order('createdAt', { ascending: false })

    if (restaurantId) {
      query = query.eq('restaurantId', restaurantId)
    }

    const { data: coupons, error } = await query

    if (error) {
      console.error('Error fetching active coupons:', error)
      return NextResponse.json({ coupons: [] })
    }

    // Filter out expired coupons
    const now = Date.now()
    const activeCoupons = (coupons || []).filter((c) => {
      if (c.expiresAt && new Date(c.expiresAt).getTime() < now) {
        return false
      }
      return true
    })

    return NextResponse.json({ coupons: activeCoupons })
  } catch (err: any) {
    console.error('Unexpected error in GET /api/coupons:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
