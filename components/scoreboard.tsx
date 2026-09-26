"use client"

import { useState, useEffect } from "react"
import { GameControl } from "@/components/game-control"
import { TeamPanel, initialStats, type TeamStats } from "@/components/team-panel"
import { useGameClock } from "@/hooks/use-game-clock"

const QUARTER_SECONDS = 12 * 60

export function Scoreboard() {
  const [home, setHome] = useState<TeamStats>(initialStats)
  const [away, setAway] = useState<TeamStats>(initialStats)
  const [quarter, setQuarter] = useState(1)
const [commentary, setCommentary] = useState("")
const [loadingComment, setLoadingComment] = useState(false)
const [clutchActivated, setClutchActivated] = useState(false)
  const { secondsLeft, running, toggle, reset, setSecondsLeft } = useGameClock(QUARTER_SECONDS)

  const scoreDiff = Math.abs(home.score - away.score)
const isClutch = clutchActivated || (quarter === 4 && secondsLeft <= 180 && scoreDiff <= 6)
useEffect(() => {
  if (quarter === 4 && secondsLeft <= 180 && scoreDiff <= 6) {
    setClutchActivated(true)
  }
}, [quarter, secondsLeft, scoreDiff])
const playEffect = (url: string, volume: number = 0.3) => {
  const audio = new Audio(url)
  audio.volume = volume
  audio.play()
  setTimeout(() => {
    const fadeOut = setInterval(() => {
      if (audio.volume > 0.05) {
        audio.volume = Math.max(0, audio.volume - 0.05)
      } else {
        audio.pause()
        clearInterval(fadeOut)
      }
    }, 100)
  }, 4000)
}

  const resetGame = () => {
    setHome(initialStats)
    setAway(initialStats)
    setQuarter(1)
    reset(QUARTER_SECONDS)
  } 
const fetchCommentary = async (event: string, team: string) => {
  setLoadingComment(true)

  // Calculate the NEW score based on the event BEFORE state updates
  const pts = event === "Shot +2" ? 2 : event === "Shot +3" ? 3 : event === "Free Throw" ? 1 : 0
  const homeAdj = team === "Home" ? home.score + pts : home.score
  const awayAdj = team === "Away" ? away.score + pts : away.score

  try {
    const res = await fetch("/api/commentary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event, team,
        homeScore: homeAdj,
        awayScore: awayAdj,
        quarter, secondsLeft
      })
    })
    const data = await res.json()
    const text = data.commentary
setCommentary(text)

const rand = Math.random()

if (isClutch) {
  // MAXIMUM HYPE - always all 3 sounds layered
  playEffect("StompCheer.mp3", 0.5)
  playEffect("Applause.mp3", 0.3)
  playEffect("Cheer.mp3", 0.6)
} else if (event === "Shot +3") {
  // HIGH HYPE - always 2 sounds, occasionally all 3
  if (rand > 0.4) {
    playEffect("Cheer.mp3", 0.35)
    playEffect("Applause.mp3", 0.2)
    playEffect("StompCheer.mp3", 0.4)
  } else {
    playEffect("Cheer.mp3", 0.2)
    playEffect("Applause.mp3", 0.1)
  }
} else if (event === "Shot +2" || event === "Free Throw") {
  // MEDIUM - randomly alternates
  if (rand > 0.5) {
    playEffect("Applause.mp3", 0.15)
    playEffect("Cheer.mp3", 0.08)
  } else {
    playEffect("Applause.mp3", 0.2)
  }
} else if (event === "Foul" || event === "Turnover") {
  // LOW - subtle reaction
  playEffect("Cheer.mp3", 0.1)
}

const ttsRes = await fetch("/api/tts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text,
    voiceId: "AU8c5GCkkbjL3AZK0Vbu"
  })
})
console.log("TTS status:", ttsRes.status)
const arrayBuffer = await ttsRes.arrayBuffer()
try {
  // Method 1: AudioContext (more reliable)
  const audioContext = new AudioContext()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  const source = audioContext.createBufferSource()
  source.buffer = audioBuffer
  source.connect(audioContext.destination)
  source.start()
} catch (e) {
  // Method 2: Audio element fallback
  console.log("AudioContext failed, trying Audio element:", e)
  const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" })
  const audioUrl = URL.createObjectURL(audioBlob)
  const audio = new Audio(audioUrl)
  audio.load()
  audio.play().catch(e2 => console.log("Audio element also failed:", e2))
}
  } catch {
    setCommentary("What a play!")
  } finally {
    setLoadingComment(false)
  }
}
  return (
    <main className={`mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-4 px-4 py-6 transition-all duration-1000 ${isClutch ? "bg-red-950" : ""}`}>
      <header className="flex items-center justify-between">
        <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-400">Courtside</h1>
        <button
          type="button"
          onClick={resetGame}
          className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-700"
        >
          New Game
        </button>
      </header>

      <GameControl
        quarter={quarter}
        secondsLeft={secondsLeft}
        running={running}
        onToggleClock={toggle}
        onSetClock={setSecondsLeft}
        onResetClock={() => reset(QUARTER_SECONDS)}
        onNextQuarter={() => setQuarter((q) => Math.min(q + 1, 8))}
        onPrevQuarter={() => setQuarter((q) => Math.max(q - 1, 1))}
      />

      <div className="flex flex-col gap-4 sm:flex-row">
        <TeamPanel defaultName="Home" accent="orange" stats={home} onStat={setHome} onAction={(label) => fetchCommentary(label, "Home")} />
<TeamPanel defaultName="Away" accent="blue" stats={away} onStat={setAway} onAction={(label) => fetchCommentary(label, "Away")} />
      </div>
    <div className={`mx-auto w-full max-w-3xl rounded-xl p-4 ring-1 text-center transition-all duration-1000 ${isClutch ? "bg-red-900/60 ring-red-500 animate-pulse" : "bg-neutral-900/60 ring-white/5"}`}>
  {loadingComment ? (
    <p className="text-neutral-400 animate-pulse">Generating commentary...</p>
  ) : (
    <p className="text-neutral-100 text-lg font-medium">{commentary || "Commentary will appear here..."}</p>
  )}
</div>
    </main>
  )
}
