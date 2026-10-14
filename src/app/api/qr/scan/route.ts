import { NextRequest, NextResponse } from 'next/server'
import { recordQRScan } from '@/data/qr-manager'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { qrId } = body

    if (!qrId || typeof qrId !== 'string') {
      return NextResponse.json({ error: 'Missing qrId' }, { status: 400 })
    }

    const result = await recordQRScan(qrId)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
