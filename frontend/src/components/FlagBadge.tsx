import { Flag } from "@/types/listing"

const SEVERITY_CONFIG = {
  HIGH: {
    bg:     "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.35)",
    color:  "#ef4444",
    icon:   "🔴",
  },
  MEDIUM: {
    bg:     "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.35)",
    color:  "#f59e0b",
    icon:   "🟡",
  },
  LOW: {
    bg:     "rgba(107,114,128,0.15)",
    border: "rgba(107,114,128,0.25)",
    color:  "#9ca3af",
    icon:   "⚪",
  },
}

export default function FlagBadge({ flag, compact = false }: { flag: Flag; compact?: boolean }) {
  const cfg = SEVERITY_CONFIG[flag.severity]

  if (compact) {
    return (
      <span
        data-tooltip={flag.label}
        className={flag.severity === "HIGH" ? "badge-high-pulse" : ""}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 8px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          color: cfg.color,
          cursor: "help",
          whiteSpace: "nowrap",
        }}
      >
        {cfg.icon} {flag.id.replace(/_/g, " ")}
      </span>
    )
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 8,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
    }}>
      <span style={{ fontSize: 14, marginTop: 1 }}>{cfg.icon}</span>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>
          {flag.severity}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 2 }}>
          {flag.label}
        </div>
      </div>
    </div>
  )
}
