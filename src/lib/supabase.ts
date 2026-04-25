import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Trailer = {
  id: string
  name: string
  type: string
  description: string
  price_per_day: number
  capacity: number
  images: string[]
  status: 'available' | 'maintenance' | 'reserved'
  features: string[]
  created_at: string
}

export type Booking = {
  id: string
  trailer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  start_date: string
  end_date: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_price: number
  notes: string
  created_at: string
}

export type AvailabilityBlock = {
  id: string
  trailer_id: string
  start_date: string
  end_date: string
  reason: string
  created_at: string
}
