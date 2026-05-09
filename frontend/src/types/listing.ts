export type Flag = {
  id: string
  label: string
  severity: "HIGH" | "MEDIUM" | "LOW"
  penalty: number
}

export type Listing = {
  rank: number
  id: string
  url: string
  title: string
  city: string
  price_mad: number
  fair_price_mad: number
  price_vs_market_pct: number
  year: number
  mileage_km: number
  fuel_type: string
  transmission: string
  condition: string
  score: number
  verdict: string
  flags: Flag[]
  react_ran: boolean
  react_verdict?: string
  react_reason?: string
  react_adjusted_score?: number
  negotiation_tip?: string
  summary_fr: string
  photos: string[]
  negotiable: boolean
  description_quality: number
  service_history_mentioned: boolean
  missing_mileage?: boolean
  seller_type?: string
  accident_mentioned?: boolean
  accident_denied?: boolean
  urgent_sale?: boolean
  import_car?: boolean
  previous_owners?: number | null
}

export type Baseline = {
  model: string
  total_scraped: number
  valid_for_baseline: number
  average_price_mad: number
  median_price_mad: number
  price_std_dev: number
  price_25th_percentile: number
  price_75th_percentile: number
  average_mileage_km: number
  median_mileage_km: number
  by_year: Record<string, { avg_price: number; avg_mileage: number; count: number }>
  expected_price_per_year: number
  expected_price_per_10k_km: number
}
