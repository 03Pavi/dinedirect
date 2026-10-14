import { NextRequest, NextResponse } from 'next/server'
import { getRestaurantTables } from '@/data/qr-manager'

// GET /api/qr/tables?restaurantId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 })
    }

    const tables = await getRestaurantTables(restaurantId)
    return NextResponse.json({ success: true, tables })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
