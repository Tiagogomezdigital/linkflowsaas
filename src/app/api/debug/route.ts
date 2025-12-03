import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const debug = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` : null,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...` : null,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` : null,
    },
    supabase: {
      clientCreated: false,
      groupsViewQuery: null as any,
      numbersViewQuery: null as any,
    },
    error: null as string | null,
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    // Usar ANON_KEY para operações públicas
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      debug.error = `Missing Supabase credentials - URL: ${!!url}, KEY: ${!!key}`
      return NextResponse.json(debug)
    }

    const supabase = createClient(url, key, {
      db: { schema: 'public' }
    })
    debug.supabase.clientCreated = true

    // Test groups_view query
    const { data: groups, error: groupsError } = await supabase
      .from('groups_view')
      .select('id, name, slug')
      .limit(5)

    debug.supabase.groupsViewQuery = {
      success: !groupsError,
      count: groups?.length || 0,
      error: groupsError ? groupsError.message : null,
      data: groups,
    }

    // Test specific slug
    const { data: testGroup, error: testError } = await supabase
      .from('groups_view')
      .select('id, name, slug, is_active, company_id')
      .eq('slug', 'teste-trial')
      .single()

    debug.supabase.numbersViewQuery = {
      slug: 'teste-trial',
      success: !testError,
      error: testError ? testError.message : null,
      data: testGroup,
    }

    // If group found, test numbers
    if (testGroup) {
      const { data: numbers, error: numbersError } = await supabase
        .from('whatsapp_numbers_view')
        .select('id, phone, is_active')
        .eq('group_id', testGroup.id)
        .limit(5)

      debug.supabase.numbersViewQuery = {
        ...debug.supabase.numbersViewQuery,
        numbers: {
          success: !numbersError,
          count: numbers?.length || 0,
          error: numbersError ? numbersError.message : null,
          data: numbers,
        }
      }
    }

  } catch (error) {
    debug.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json(debug, { status: 200 })
}

