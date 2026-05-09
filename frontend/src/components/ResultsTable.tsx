"use client"
import { useState } from "react"
import { Listing } from "@/types/listing"
import FlagBadge from "./FlagBadge"

// ── Score badge colours ───────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 80) return { bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.4)",  text: "#22c55e" }
  if (score >= 65) return { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.4)", text: "#3b82f6" }
  if (score >= 50) return { bg: "rgba(234,179,8,0.15)",  border: "rgba(234,179,8,0.4)",  text: "#eab308" }
  if (score >= 30) return { bg: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.4)", text: "#f97316" }
  return               { bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.4)",  text: "#ef4444" }
}

function rowBg(l: Listing) {
  if (l.flags.some(f => f.severity === "HIGH")) return "rgba(239,68,68,0.04)"
  if (l.score >= 80)                             return "rgba(34,197,94,0.04)"
  return "var(--bg-card)"
}

function pctColor(pct: number) {
  return pct < 0 ? "#22c55e" : "#ef4444"
}

function reactBadgeStyle(verdict?: string) {
  switch (verdict) {
    case "clean":          return { bg: "rgba(34,197,94,0.15)",  color: "#22c55e",  icon: "✅" }
    case "suspicious":     return { bg: "rgba(245,158,11,0.15)", color: "#f59e0b",  icon: "⚠️" }
    case "likely_damaged": return { bg: "rgba(249,115,22,0.15)", color: "#f97316",  icon: "🔧" }
    case "possible_scam":  return { bg: "rgba(239,68,68,0.15)",  color: "#ef4444",  icon: "🚫" }
    case "inconclusive":   return { bg: "rgba(107,114,128,0.15)",color: "#9ca3af",  icon: "❓" }
    default:               return { bg: "rgba(107,114,128,0.15)",color: "#9ca3af",  icon: "—" }
  }
}

// ── Column header ─────────────────────────────────────────────────────────────
function Th({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th style={{
      padding: "10px 14px",
      textAlign: "left",
      fontSize: 11,
      fontWeight: 600,
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      whiteSpace: "nowrap",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-surface)",
      ...style,
    }}>
      {children}
    </th>
  )
}

// ── Expanded row detail ───────────────────────────────────────────────────────
function ExpandedRow({ listing }: { listing: Listing }) {
  return (
    <tr>
      <td colSpan={11} style={{ padding: 0, background: "var(--bg-surface)" }}>
        <div className="animate-slide-down" style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20,
        }}>
          {/* Column 1 — Summary + Tip */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                AI Summary
              </div>
              <div style={{ fontSize: 13, color: "var(--text-subtle)", lineHeight: 1.6, fontStyle: "italic" }}>
                "{listing.summary_fr || "No summary available."}"
              </div>
            </div>

            {listing.negotiation_tip && (
              <div style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: 10, padding: "12px 14px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#22c55e", marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
                  💡 Negotiation Tip
                </div>
                <div style={{ fontSize: 12, color: "var(--text-subtle)", lineHeight: 1.6 }}>
                  {listing.negotiation_tip}
                </div>
              </div>
            )}

            {listing.react_ran && listing.react_reason && (
              <div style={{
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.25)",
                borderRadius: 10, padding: "12px 14px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#8b5cf6", marginBottom: 5 }}>
                  🤖 AI Investigation
                </div>
                <div style={{ fontSize: 12, color: "var(--text-subtle)", lineHeight: 1.6 }}>
                  {listing.react_reason}
                </div>
              </div>
            )}
          </div>

          {/* Column 2 — All flags */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Flags ({listing.flags.length})
            </div>
            {listing.flags.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>✅ No flags raised</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {listing.flags.map(f => <FlagBadge key={f.id} flag={f} />)}
              </div>
            )}
          </div>

          {/* Column 3 — Photos */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Photos ({listing.photos.length})
            </div>
            {listing.photos.length === 0 ? (
              <div style={{
                width: "100%", height: 100, borderRadius: 10,
                background: "var(--bg-hover)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-muted)", fontSize: 13,
              }}>
                📷 No photos
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {listing.photos.slice(0, 3).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Photo ${i + 1}`}
                    style={{
                      width: 120, height: 90, objectFit: "cover",
                      borderRadius: 8, border: "1px solid var(--border)",
                    }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                  />
                ))}
              </div>
            )}

            {/* Extra info */}
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                { label: "Condition",       value: listing.condition },
                { label: "Transmission",    value: listing.transmission },
                { label: "Seller type",     value: listing.seller_type || "—" },
                { label: "Prev. owners",    value: listing.previous_owners != null ? String(listing.previous_owners) : "Unknown" },
                { label: "Service history", value: listing.service_history_mentioned ? "✅ Mentioned" : "❌ Not mentioned" },
                { label: "Import car",      value: listing.import_car ? "Yes" : "No" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
                  <span style={{ color: "var(--text-subtle)", fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ── Main table ────────────────────────────────────────────────────────────────
export default function ResultsTable({ listings }: { listings: Listing[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id)

  if (listings.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "60px 0",
        color: "var(--text-muted)", fontSize: 14,
      }}>
        No listings match this filter.
      </div>
    )
  }

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      overflow: "hidden",
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Car</Th>
              <Th>Price</Th>
              <Th>vs Market</Th>
              <Th>Mileage</Th>
              <Th>City</Th>
              <Th>Score</Th>
              <Th>Flags</Th>
              <Th>AI Check</Th>
              <Th>Tip</Th>
              <Th style={{ textAlign: "center" }}>Link</Th>
            </tr>
          </thead>
          <tbody>
            {listings.map(l => {
              const sc       = scoreColor(l.score)
              const isOpen   = expanded === l.id
              const reactCfg = reactBadgeStyle(l.react_verdict)
              const hasHigh  = l.flags.some(f => f.severity === "HIGH")

              return (
                <>
                  <tr
                    key={l.id}
                    id={`row-${l.id}`}
                    className="table-row-hover"
                    onClick={() => toggle(l.id)}
                    style={{
                      background: rowBg(l),
                      borderBottom: "1px solid var(--border)",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Rank */}
                    <td style={{ padding: "12px 14px", width: 44 }}>
                      <div style={{
                        width: 28, height: 28,
                        borderRadius: "50%",
                        background: l.rank <= 3 ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "var(--bg-hover)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700,
                        color: l.rank <= 3 ? "#fff" : "var(--text-muted)",
                      }}>
                        {l.rank}
                      </div>
                    </td>

                    {/* Car */}
                    <td style={{ padding: "12px 14px", minWidth: 200 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
                        {l.year} · {l.fuel_type}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {l.title?.slice(0, 55) || "—"}
                      </div>
                      <div style={{ marginTop: 4, display: "flex", gap: 4 }}>
                        {l.negotiable && (
                          <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(34,197,94,0.1)", color: "#22c55e", fontWeight: 600 }}>
                            NEGO
                          </span>
                        )}
                        {l.import_car && (
                          <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(139,92,246,0.1)", color: "#8b5cf6", fontWeight: 600 }}>
                            IMPORT
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                        {l.price_mad.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                        fair: {l.fair_price_mad?.toLocaleString() ?? "—"}
                      </div>
                    </td>

                    {/* vs Market */}
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        fontWeight: 700, fontSize: 13,
                        color: pctColor(l.price_vs_market_pct),
                      }}>
                        {l.price_vs_market_pct >= 0 ? "+" : ""}
                        {(l.price_vs_market_pct * 100).toFixed(1)}%
                      </span>
                    </td>

                    {/* Mileage */}
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontSize: 13,
                        color: l.missing_mileage ? "var(--text-muted)" : "var(--text-subtle)",
                        fontStyle: l.missing_mileage ? "italic" : "normal",
                      }}>
                        {l.missing_mileage ? "~" : ""}{l.mileage_km?.toLocaleString() ?? "—"} km
                      </span>
                    </td>

                    {/* City */}
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>{l.city || "—"}</span>
                    </td>

                    {/* Score badge */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{
                        display: "inline-flex", flexDirection: "column",
                        alignItems: "center",
                        padding: "6px 12px",
                        borderRadius: 10,
                        background: sc.bg,
                        border: `1px solid ${sc.border}`,
                        minWidth: 52,
                      }}>
                        <span style={{ fontWeight: 800, fontSize: 16, color: sc.text }}>
                          {l.score}
                        </span>
                        <span style={{ fontSize: 9, color: sc.text, opacity: 0.7, letterSpacing: "0.04em" }}>
                          /100
                        </span>
                      </div>
                    </td>

                    {/* Flags */}
                    <td style={{ padding: "12px 14px", maxWidth: 200 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {l.flags.slice(0, 3).map(f => (
                          <FlagBadge key={f.id} flag={f} compact />
                        ))}
                        {l.flags.length > 3 && (
                          <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center" }}>
                            +{l.flags.length - 3}
                          </span>
                        )}
                        {l.flags.length === 0 && (
                          <span style={{ fontSize: 12, color: "#22c55e" }}>✅ Clean</span>
                        )}
                      </div>
                    </td>

                    {/* ReAct badge */}
                    <td style={{ padding: "12px 14px" }}>
                      {l.react_ran ? (
                        <span
                          data-tooltip={l.react_reason || ""}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "3px 8px", borderRadius: 6,
                            background: reactCfg.bg, color: reactCfg.color,
                            fontSize: 11, fontWeight: 600, cursor: "help",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {reactCfg.icon} {l.react_verdict}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Tip icon */}
                    <td style={{ padding: "12px 14px" }}>
                      {l.negotiation_tip ? (
                        <span
                          data-tooltip={l.negotiation_tip}
                          style={{ fontSize: 16, cursor: "help" }}
                        >
                          💡
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Link */}
                    <td style={{ padding: "12px 14px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        id={`link-${l.id}`}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "5px 10px", borderRadius: 6,
                          background: "rgba(59,130,246,0.12)",
                          border: "1px solid rgba(59,130,246,0.3)",
                          color: "#3b82f6",
                          fontSize: 12, fontWeight: 600,
                          textDecoration: "none",
                          transition: "background 0.15s",
                        }}
                      >
                        View ↗
                      </a>
                    </td>
                  </tr>

                  {isOpen && <ExpandedRow key={`exp-${l.id}`} listing={l} />}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{
        padding: "12px 20px",
        borderTop: "1px solid var(--border)",
        fontSize: 12,
        color: "var(--text-muted)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span>Click any row to expand details · Hover 💡 for negotiation tips</span>
        <span>{listings.length} listings shown</span>
      </div>
    </div>
  )
}
