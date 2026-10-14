import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { DEFAULT_KEYWORDS } from '@/utils/keywords-data'

export async function POST() {
  try {
    const recordsToInsert = DEFAULT_KEYWORDS.map((k) => ({
      keyword: k.keyword,
      category: k.category,
      sortOrder: k.sortOrder,
      isTrending: true,
    }))

    const { data, error } = await supabase
      .from('TrendingKeyword')
      .upsert(recordsToInsert, { onConflict: 'keyword' })
      .select()

    if (error) {
      console.error('Failed to seed keywords in Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Keywords collection successfully seeded to Supabase TrendingKeyword table',
      count: data?.length || 0,
      keywords: data || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
