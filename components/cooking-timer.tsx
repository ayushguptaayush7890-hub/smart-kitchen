"use client"

import { useState, useEffect, useCallback } from "react"
import { Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CookingTimerProps {
  initialMinutes?: number
  label?: string
  onComplete?: () => void
}

export function CookingTimer({ 
  initialMinutes = 5, 
  label = "Cooking Timer",
  onComplete 
}: CookingTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [initialTotalSeconds] = useState(initialMinutes * 60)

  const progress = ((initialTotalSeconds - totalSeconds) / initialTotalSeconds) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  const handleComplete = useCallback(() => {
    onComplete?.()
  }, [onComplete])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, totalSeconds, handleComplete])

  const toggleTimer = () => setIsRunning(!isRunning)
  
  const resetTimer = () => {
    setIsRunning(false)
    setTotalSeconds(initialTotalSeconds)
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
      <h3 className="text-lg font-semibold text-foreground text-center mb-4">{label}</h3>
      
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className="text-primary transition-all duration-300"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button
          onClick={toggleTimer}
          className={isRunning ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "gradient-button text-primary-foreground"}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button variant="outline" onClick={resetTimer}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
