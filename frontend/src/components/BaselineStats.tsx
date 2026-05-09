import { Baseline } from "@/types/listing"

export default function BaselineStats({ baseline, total }: { baseline: Baseline; total: number }) {
  const stats = [
    {
      icon: "📊", label: "Listings found",
      value: total.toString(),
      sub: `${baseline.valid_for_baseline} used for baseline`,
      color: "#3b82f6",
    },
    {
      icon: "📈", label: "Market median",
      value: `${baseline.median_price_mad.toLocaleString()} MAD`,
      sub: `Avg: ${baseline.average_price_mad.toLocaleString()} MAD`,
      color: "#8b5cf6",
    },
    {
      icon: "📉", label: "Price spread",
      value: `±${baseline.price_std_dev.toLocaleString()} MAD`,
      sub: `P25: ${baseline.price_25th_percentile?.toLocaleString() ?? "—"} · P75: ${baseline.price_75th_percentile?.toLocaleString() ?? "—"}`,
      color: "#06b6d4",
    },
    {
      icon: "🛣️", label: "Avg mileage",
      value: `${baseline.average_mileage_km.toLocaleString()} km`,
      sub: `Median: ${baseline.median_mileage_km.toLocaleString()} km`,
      color: "#22c55e",
    },
  ]

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 14,
      }}>
        {stats.map(s => (
          <div
            key={s.label}
            className="stat-card"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "18px 20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top color accent bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${s.color}, ${s.color}88)`,
              borderRadius: "14px 14px 0 0",
            }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {s.label}
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Year breakdown */}
      {Object.keys(baseline.by_year).length > 0 && (
        <div style={{
          marginTop: 14,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "16px 20px",
        }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Price by Year · {baseline.model}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {Object.entries(baseline.by_year)
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([year, data]) => (
                <div key={year} style={{
                  display: "flex", flexDirection: "column", gap: 3,
                  padding: "10px 16px",
                  background: "var(--bg-hover)",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  minWidth: 120,
                }}>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>{year}</div>
                  <div style={{ color: "#3b82f6", fontWeight: 600, fontSize: 13 }}>
                    {data.avg_price.toLocaleString()} MAD
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11 }}>
                    {data.avg_mileage.toLocaleString()} km · {data.count} listings
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
