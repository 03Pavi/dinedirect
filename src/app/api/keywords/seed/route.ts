import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { DEFAULT_KEYWORDS } from '@/utils/keywords-data'
import fs from 'fs'
import path from 'path'

const LOCAL_STORE_PATH = path.join(process.cwd(), 'src', 'data', 'trending-keywords.json')

export async function POST() {
  try {
    let seededToSupabase = false

    // 1. Attempt to seed to Supabase
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

      if (!error && data) {
        seededToSupabase = true
      }
    } catch {
      // Continue with local seeding
    }

    // 2. Ensure local collection is seeded
    const dir = path.dirname(LOCAL_STORE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(DEFAULT_KEYWORDS, null, 2), 'utf8')

    return NextResponse.json({
      success: true,
      message: 'Keywords collection successfully seeded',
      seededToSupabase,
      count: DEFAULT_KEYWORDS.length,
      keywords: DEFAULT_KEYWORDS,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
