import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/keywords - Fetch all trending keywords dynamically from Supabase
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('TrendingKeyword')
      .select('*')
      .eq('isTrending', true)
      .order('sortOrder', { ascending: true })

    if (error) {
      console.error('Supabase TrendingKeyword error:', error)
      return NextResponse.json({ error: error.message, keywords: [] }, { status: 500 })
    }

    return NextResponse.json({ keywords: data || [] })
  } catch (err: any) {
    console.error('Error fetching keywords:', err)
    return NextResponse.json({ error: err?.message || 'Server error', keywords: [] }, { status: 500 })
  }
}

// POST /api/keywords - Add new keyword to Supabase TrendingKeyword table
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { keyword, category = 'trending', sortOrder = 0 } = body

    if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
      return NextResponse.json({ error: 'Valid keyword is required' }, { status: 400 })
    }

    const trimmedKeyword = keyword.trim()

    const { data, error } = await supabase
      .from('TrendingKeyword')
      .insert({
        keyword: trimmedKeyword,
        category,
        sortOrder,
        isTrending: true,
      })
      .select()
      .maybeSingle()

    if (error) {
      // Check for unique conflict
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('TrendingKeyword')
          .select('*')
          .eq('keyword', trimmedKeyword)
          .maybeSingle()
        return NextResponse.json({ keyword: existing, message: 'Keyword already exists' })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ keyword: data, message: 'Keyword added successfully to Supabase' })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// DELETE /api/keywords - Remove keyword from Supabase TrendingKeyword table
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const keyword = searchParams.get('keyword')

    if (!id && !keyword) {
      return NextResponse.json({ error: 'ID or keyword is required' }, { status: 400 })
    }

    let query = supabase.from('TrendingKeyword').delete()
    if (id) {
      query = query.eq('id', id)
    } else if (keyword) {
      query = query.eq('keyword', keyword)
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Keyword removed successfully from Supabase' })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
