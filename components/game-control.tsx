"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type GameControlProps = {
  quarter: number
  secondsLeft: number
  running: boolean
  onToggleClock: () => void
  onSetClock: (seconds: number) => void
  onResetClock: () => void
  onNextQuarter: () => void
  onPrevQuarter: () => void
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function parseClock(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parts = trimmed.split(":")
  let minutes = 0
  let seconds = 0
  if (parts.length === 1) {
    minutes = Number(parts[0])
  } else if (parts.length === 2) {
    minutes = Number(parts[0])
    seconds = Number(parts[1])
  } else {
    return null
  }
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null
  if (minutes < 0 || seconds < 0 || seconds > 59) return null
  const total = Math.round(minutes) * 60 + Math.round(seconds)
  if (total < 0 || total > 99 * 60 + 59) return null
  return total
}

export function GameControl({
  quarter,
  secondsLeft,
  running,
  onToggleClock,
  onSetClock,
  onResetClock,
  onNextQuarter,
  onPrevQuarter,
}: GameControlProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const startEditing = () => {
    if (running) return
    setDraft(formatClock(secondsLeft))
    setEditing(true)
  }

  const commit = () => {
    const parsed = parseClock(draft)
    if (parsed !== null) onSetClock(parsed)
    setEditing(false)
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-neutral-900/60 p-4 ring-1 ring-white/5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrevQuarter}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
          aria-label="Previous quarter"
        >
          {"−"}
        </button>
        <div className="min-w-24 text-center">
          <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Quarter</div>
          <div className="font-mono text-2xl font-bold text-neutral-100">{quarter > 4 ? `OT${quarter - 4}` : `Q${quarter}`}</div>
        </div>
        <button
          type="button"
          onClick={onNextQuarter}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
          aria-label="Next quarter"
        >
          {"+"}
        </button>
      </div>

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit()
            if (e.key === "Escape") setEditing(false)
          }}
          aria-label="Edit game clock (minutes:seconds)"
          placeholder="MM:SS"
          className="w-40 rounded-xl bg-neutral-800 px-2 py-1 text-center font-mono text-5xl font-bold tabular-nums text-neutral-100 outline-none ring-2 ring-orange-500/60 sm:text-6xl"
        />
      ) : (
        <button
          type="button"
          onClick={startEditing}
          disabled={running}
          aria-label={running ? "Game clock" : "Game clock, tap to edit"}
          className={cn(
            "rounded-xl px-2 font-mono text-5xl font-bold tabular-nums transition-colors sm:text-6xl",
            !running && "cursor-text hover:bg-neutral-800/60",
            secondsLeft <= 10 && secondsLeft > 0 ? "text-red-400" : "text-neutral-100",
            secondsLeft === 0 && "text-red-500",
          )}
        >
          {formatClock(secondsLeft)}
        </button>
      )}

      <div className="flex w-full gap-2">
        <button
          type="button"
          onClick={onToggleClock}
          className={cn(
            "flex-1 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors active:scale-[0.98]",
            running
              ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
              : "bg-green-500/20 text-green-300 hover:bg-green-500/30",
          )}
        >
          {running ? "Stop" : "Start"}
        </button>
        <button
          type="button"
          onClick={onResetClock}
          className="flex-1 rounded-xl bg-neutral-800 px-4 py-3 text-sm font-bold uppercase tracking-wide text-neutral-300 hover:bg-neutral-700 active:scale-[0.98]"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
