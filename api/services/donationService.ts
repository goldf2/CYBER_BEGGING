import { getSupabase } from '../lib/supabase.js'

export interface Donation {
  id: string
  amount: number
  donor_name: string
  transaction_id: string
  created_at: string
}

export interface CreateDonationData {
  amount: number
  donor_name: string
  transaction_id: string
}

interface DonationRow {
  id: string
  amount: number
  donor_name: string
  transaction_id: string
  created_at: string
}

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export const createDonationRecord = async (data: CreateDonationData): Promise<Donation | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping donation record')
    return null
  }

  try {
    const supabase = getSupabase()
    const insertData = {
      amount: data.amount,
      donor_name: data.donor_name,
      transaction_id: data.transaction_id,
    }
    const { data: record, error } = await (supabase
      .from('donations') as any)
      .insert(insertData)
      .select()
      .single()

    if (error) throw error
    return record as unknown as Donation
  } catch (error) {
    console.error('Failed to create donation record:', error)
    return null
  }
}

export const getDonations = async (): Promise<Donation[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty donations')
    return []
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('donations')
      .select('id, amount, donor_name, transaction_id, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    const rows = (data || []) as unknown as DonationRow[]
    return rows.map((row) => ({
      ...row,
      amount: row.amount / 100,
    })) as Donation[]
  } catch (error) {
    console.error('Failed to get donations:', error)
    return []
  }
}

export const getTotalDonations = async (): Promise<number> => {
  if (!isSupabaseConfigured()) {
    return 0
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('donations')
      .select('amount')

    if (error) throw error
    const rows = (data || []) as unknown as { amount: number }[]
    const total = rows.reduce((sum, row) => sum + (row.amount || 0), 0)
    return total / 100
  } catch (error) {
    console.error('Failed to get total donations:', error)
    return 0
  }
}

export const initDonationsTable = async (): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping table initialization')
    return
  }

  // Supabase 表结构需要通过 SQL Editor 手动创建
  // 参考 supabase/init.sql 文件
  console.log('Supabase configured. Make sure donations table exists (see supabase/init.sql)')
}
