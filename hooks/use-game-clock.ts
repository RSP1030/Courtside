"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export function useGameClock(initialSeconds = 12 * 60) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return clearTimer
  }, [running, clearTimer])

  useEffect(() => {
    if (secondsLeft === 0) {
      setRunning(false)
    }
  }, [secondsLeft])

  const toggle = useCallback(() => {
    setRunning((r) => (secondsLeft === 0 ? false : !r))
  }, [secondsLeft])

  const reset = useCallback(
    (seconds = initialSeconds) => {
      setRunning(false)
      setSecondsLeft(seconds)
    },
    [initialSeconds],
  )

  return { secondsLeft, running, toggle, reset, setSecondsLeft }
}
