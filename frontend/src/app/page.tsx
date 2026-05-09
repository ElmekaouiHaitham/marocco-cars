"use client"
import { useEffect, useState } from "react"
import { Listing, Baseline } from "@/types/listing"
import BaselineStats from "@/components/BaselineStats"
import ResultsTable from "@/components/ResultsTable"

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [baseline, setBaseline] = useState<Baseline | null>(null)
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<"all" | "deals" | "risky">("all")
  const [search, setSearch]     = useState("")
  const [sort, setSort]         = useState<"score" | "price" | "year">("score")

  useEffect(() => {
    fetch("/api/results")
      .then(r => r.json())
      .then(data => {
        setListings(data.results || [])
        setBaseline(data.baseline || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = listings
    .filter(l => {
      if (filter === "deals" && l.score < 65) return false
      if (filter === "risky" && !l.flags.some(f => f.severity === "HIGH")) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          l.title?.toLowerCase().includes(q) ||
          l.city?.toLowerCase().includes(q) ||
          l.fuel_type?.toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sort === "price") return a.price_mad - b.price_mad
      if (sort === "year")  return b.year - a.year
      return b.score - a.score
    })

  const highFlags  = listings.filter(l => l.flags.some(f => f.severity === "HIGH")).length
  const greatDeals = listings.filter(l => l.score >= 80).length

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      {/* ── Top nav ─────────────────────────────────────────────── */}
      <header style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>🚗</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }} className="gradient-text">
                  Cars Mar
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: -2 }}>
                  AI Used Car Agent · Morocco
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                id="search-input"
                type="text"
                placeholder="Search model or city…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  width: 220,
                  transition: "border-color 0.15s",
                }}
              />
              <select
                id="filter-select"
                value={filter}
                onChange={e => setFilter(e.target.value as typeof filter)}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <option value="all">All listings</option>
                <option value="deals">Deals (65+)</option>
                <option value="risky">High-risk flags</option>
              </select>
              <select
                id="sort-select"
                value={sort}
                onChange={e => setSort(e.target.value as typeof sort)}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <option value="score">Sort: Score</option>
                <option value="price">Sort: Price ↑</option>
                <option value="year">Sort: Year ↓</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px" }}>
        {loading ? (
          <LoadingState />
        ) : listings.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Summary chips */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <Chip icon="📋" label={`${listings.length} listings scraped`} color="#3b82f6" />
              <Chip icon="✅" label={`${greatDeals} great deals`}            color="#22c55e" />
              <Chip icon="🔴" label={`${highFlags} high-risk flags`}          color="#ef4444" />
              <Chip icon="🔍" label={`${filtered.length} shown`}              color="#8b5cf6" />
            </div>

            {baseline && <BaselineStats baseline={baseline} total={listings.length} />}
            <ResultsTable listings={filtered} />
          </>
        )}
      </div>
    </main>
  )
}

function Chip({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: `${color}18`,
      border: `1px solid ${color}40`,
      borderRadius: 20,
      padding: "4px 12px",
      fontSize: 12,
      color: color,
      fontWeight: 500,
    }}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 120, gap: 20 }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        border: "3px solid var(--border)",
        borderTopColor: "#3b82f6",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading results…</div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", paddingTop: 100, gap: 16,
    }}>
      <div style={{ fontSize: 56 }}>🏎️</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>No results yet</div>
      <div style={{ color: "var(--text-muted)", textAlign: "center", maxWidth: 380, lineHeight: 1.7 }}>
        Run the Python backend to scrape and analyse listings, then refresh this page.
      </div>
      <code style={{
        marginTop: 8, padding: "10px 18px",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 8, fontSize: 13, color: "#22c55e",
        fontFamily: "monospace",
      }}>
        cd backend && python main.py
      </code>
    </div>
  )
}
