import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

import { DEFAULT_KEYWORDS } from '@/utils/keywords-data'

const LOCAL_STORE_PATH = path.join(process.cwd(), 'src', 'data', 'trending-keywords.json')

function getLocalKeywords() {
  try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      const data = fs.readFileSync(LOCAL_STORE_PATH, 'utf8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Error reading local keywords:', e)
  }
  return DEFAULT_KEYWORDS
}

function saveLocalKeywords(keywords: any[]) {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(keywords, null, 2), 'utf8')
  } catch (e) {
    console.error('Error writing local keywords:', e)
  }
}

// GET /api/keywords - Fetch all trending keywords
export async function GET() {
  try {
    // 1. Try Supabase first
    const { data, error } = await supabase
      .from('TrendingKeyword')
      .select('*')
      .eq('isTrending', true)
      .order('sortOrder', { ascending: true })

    if (!error && data && data.length > 0) {
      return NextResponse.json({ keywords: data })
    }

    // 2. If table doesn't exist yet or is empty, fallback to local seeded collection
    const localKeywords = getLocalKeywords()
    return NextResponse.json({ keywords: localKeywords })
  } catch (err: any) {
    const localKeywords = getLocalKeywords()
    return NextResponse.json({ keywords: localKeywords })
  }
}

// POST /api/keywords - Admin add new keyword to collection
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { keyword, category = 'trending', sortOrder = 0 } = body

    if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
      return NextResponse.json({ error: 'Valid keyword is required' }, { status: 400 })
    }

    const trimmedKeyword = keyword.trim()

    // 1. Try inserting into Supabase
    try {
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

      if (!error && data) {
        return NextResponse.json({ keyword: data, message: 'Keyword added successfully' })
      }
    } catch {
      // Continue to local fallback
    }

    // 2. Update local collection
    const local = getLocalKeywords()
    const existing = local.find((k: any) => k.keyword.toLowerCase() === trimmedKeyword.toLowerCase())
    if (existing) {
      return NextResponse.json({ keyword: existing, message: 'Keyword already exists' })
    }

    const newKeyword = {
      id: String(Date.now()),
      keyword: trimmedKeyword,
      category,
      sortOrder: sortOrder || local.length + 1,
      isTrending: true,
      createdAt: new Date().toISOString(),
    }
    local.push(newKeyword)
    saveLocalKeywords(local)

    return NextResponse.json({
      keyword: newKeyword,
      message: 'Keyword added to collection successfully',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// DELETE /api/keywords - Admin remove keyword from collection
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const keyword = searchParams.get('keyword')

    if (!id && !keyword) {
      return NextResponse.json({ error: 'ID or keyword required' }, { status: 400 })
    }

    // Try Supabase delete
    try {
      if (id) {
        await supabase.from('TrendingKeyword').delete().eq('id', id)
      } else if (keyword) {
        await supabase.from('TrendingKeyword').delete().eq('keyword', keyword)
      }
    } catch {
      // Ignore Supabase error if table doesn't exist
    }

    // Update local store
    let local = getLocalKeywords()
    local = local.filter((k: any) => {
      if (id && k.id === id) return false
      if (keyword && k.keyword.toLowerCase() === keyword.toLowerCase()) return false
      return true
    })
    saveLocalKeywords(local)

    return NextResponse.json({ success: true, message: 'Keyword removed successfully' })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
