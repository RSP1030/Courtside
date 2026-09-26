"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export type TeamStats = {
  score: number
  rebounds: number
  assists: number
  fouls: number
  turnovers: number
}

export const initialStats: TeamStats = {
  score: 0,
  rebounds: 0,
  assists: 0,
  fouls: 0,
  turnovers: 0,
}

type StatAction = {
  label: string
  onClick: () => void
  variant: "score" | "stat" | "warn"
}

type TeamPanelProps = {
  defaultName: string
  accent: "orange" | "blue"
  stats: TeamStats
  onStat: (updater: (prev: TeamStats) => TeamStats) => void
  onAction?: (label: string) => void
}

export function TeamPanel({ defaultName, accent, stats, onStat, onAction }: TeamPanelProps) {
  const [name, setName] = useState(defaultName)

  const accentText = accent === "orange" ? "text-orange-400" : "text-sky-400"
  const accentRing = accent === "orange" ? "focus:ring-orange-500/50" : "focus:ring-sky-500/50"

  const actions: StatAction[] = [
    { label: "Shot +2", variant: "score", onClick: () => onStat((p) => ({ ...p, score: p.score + 2 })) },
    { label: "Shot +3", variant: "score", onClick: () => onStat((p) => ({ ...p, score: p.score + 3 })) },
    { label: "Free Throw", variant: "score", onClick: () => onStat((p) => ({ ...p, score: p.score + 1 })) },
    { label: "Rebound", variant: "stat", onClick: () => onStat((p) => ({ ...p, rebounds: p.rebounds + 1 })) },
    { label: "Assist", variant: "stat", onClick: () => onStat((p) => ({ ...p, assists: p.assists + 1 })) },
    { label: "Foul", variant: "warn", onClick: () => onStat((p) => ({ ...p, fouls: p.fouls + 1 })) },
    { label: "Turnover", variant: "warn", onClick: () => onStat((p) => ({ ...p, turnovers: p.turnovers + 1 })) },
  ]

  return (
    <section className="flex flex-1 flex-col gap-4 rounded-2xl bg-neutral-900/60 p-4 ring-1 ring-white/5">
      <div className="flex flex-col items-center gap-3">
        <input
          aria-label={`${defaultName} name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cn(
            "w-full rounded-lg bg-transparent text-center text-lg font-semibold uppercase tracking-wide text-neutral-100 outline-none",
            "focus:bg-neutral-800/60 focus:ring-2",
            accentRing,
          )}
        />
        <div
          className={cn("font-mono text-6xl font-bold tabular-nums sm:text-7xl", accentText)}
          aria-label={`${name} score`}
        >
          {stats.score}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => { action.onClick(); onAction?.(action.label); }}
            className={cn(
              "rounded-xl px-3 py-4 text-sm font-semibold transition-colors active:scale-[0.98]",
              action.variant === "score" &&
                (accent === "orange"
                  ? "bg-orange-500/15 text-orange-300 hover:bg-orange-500/25"
                  : "bg-sky-500/15 text-sky-300 hover:bg-sky-500/25"),
              action.variant === "stat" && "bg-neutral-800 text-neutral-200 hover:bg-neutral-700",
              action.variant === "warn" && "bg-red-500/10 text-red-300 hover:bg-red-500/20",
              action.label === "Turnover" && "col-span-2",
            )}
          >
            {action.label}
          </button>
        ))}
      </div>

      <dl className="grid grid-cols-4 gap-2 text-center">
        <Stat label="REB" value={stats.rebounds} />
        <Stat label="AST" value={stats.assists} />
        <Stat label="FOUL" value={stats.fouls} />
        <Stat label="TO" value={stats.turnovers} />
      </dl>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-neutral-800/50 py-2">
      <dt className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">{label}</dt>
      <dd className="font-mono text-lg font-semibold text-neutral-200">{value}</dd>
    </div>
  )
}
