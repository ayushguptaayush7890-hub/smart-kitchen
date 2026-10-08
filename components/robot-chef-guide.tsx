"use client"

import { useEffect, useState, useCallback } from "react"
import { Play, Pause, ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RobotChef } from "@/components/robot-chef"
import { API_BASE_URL } from "@/lib/api"

type ChefAnimation = "idle" | "chop" | "stir" | "heat"

interface RobotChefGuideProps {
  recipeId: string
  onStepChange?: (index: number, instruction: string, animation: ChefAnimation) => void
}

interface ChefResponse {
  recipe: string
  instructions: string[]
  tip: string | null
}

export function RobotChefGuide({ recipeId, onStepChange }: RobotChefGuideProps) {
  const [data, setData] = useState<ChefResponse | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  const currentInstruction =
    data && data.instructions[currentIndex] ? data.instructions[currentIndex] : ""

  const computeAnimation = (text: string): ChefAnimation => {
    const lower = text.toLowerCase()
    if (lower.includes("chop") || lower.includes("slice") || lower.includes("cut")) {
      return "chop"
    }
    if (lower.includes("stir") || lower.includes("mix") || lower.includes("whisk")) {
      return "stir"
    }
    if (lower.includes("heat") || lower.includes("preheat") || lower.includes("pan")) {
      return "heat"
    }
    return "idle"
  }

  const emitStepChange = useCallback(
    (index: number, text: string) => {
      const anim = computeAnimation(text)
      onStepChange?.(index, text, anim)
    },
    [onStepChange]
  )

  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled || typeof window === "undefined" || !text) return

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1.05
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    },
    [voiceEnabled]
  )

  // Fetch instructions from backend when recipeId changes
  useEffect(() => {
    if (!recipeId) return

    let cancelled = false
    const fetchInstructions = async () => {
      try {
        setLoading(true)
        setError(null)
        setData(null)
        setCurrentIndex(0)

        const res = await fetch(`${API_BASE_URL}/chef`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipe_id: Number(recipeId) }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.detail || `Chef API error (${res.status})`)
        }

        const json = (await res.json()) as ChefResponse
        if (cancelled) return

        const safeInstructions = Array.isArray(json.instructions)
          ? json.instructions.filter((s) => typeof s === "string" && s.trim().length > 0)
          : []

        const payload: ChefResponse = {
          recipe: json.recipe,
          instructions: safeInstructions,
          tip: json.tip ?? null,
        }

        setData(payload)

        if (safeInstructions.length > 0) {
          emitStepChange(0, safeInstructions[0])
          speak(safeInstructions[0])
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load chef instructions.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchInstructions()

    return () => {
      cancelled = true
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel()
      }
    }
  }, [recipeId, emitStepChange, speak])

  const goToStep = (nextIndex: number) => {
    if (!data || data.instructions.length === 0) return
    const clamped = Math.max(0, Math.min(nextIndex, data.instructions.length - 1))
    setCurrentIndex(clamped)
    const text = data.instructions[clamped]
    emitStepChange(clamped, text)
    speak(text)
  }

  const handleNext = () => {
    if (!data || data.instructions.length === 0) return
    if (currentIndex < data.instructions.length - 1) {
      goToStep(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (!data || data.instructions.length === 0) return
    if (currentIndex > 0) {
      goToStep(currentIndex - 1)
    }
  }

  const allDone = !!data && data.instructions.length > 0 && currentIndex === data.instructions.length - 1

  const robotMessage =
    currentInstruction ||
    "Hello! I'm your AI chef assistant. Let's start cooking this recipe together step by step."

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Robot Chef Guide
          </h3>
          {data?.recipe && (
            <p className="text-xs text-muted-foreground">Recipe: {data.recipe}</p>
          )}
        </div>

        <Button
          size="icon"
          variant="outline"
          className="rounded-full"
          onClick={() => setVoiceEnabled((v) => !v)}
          title={voiceEnabled ? "Disable voice" : "Enable voice"}
        >
          {voiceEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Fetching chef instructions...
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive border border-destructive/30 rounded-md px-3 py-2 bg-destructive/10">
          {error}
        </div>
      )}

      <RobotChef
        message={
          allDone
            ? `Your dish is ready! Enjoy your meal. ${
                data?.tip ? `Tip: ${data.tip}` : ""
              }`
            : robotMessage
        }
        isTalking={isSpeaking}
        showInput={false}
        variant="dark"
      />

      {data && data.instructions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Step {currentIndex + 1} of {data.instructions.length}
            </span>
            {allDone && <span className="font-medium text-primary">Dish complete!</span>}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              variant="outline"
              className="flex-1 py-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Previous Step
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex >= (data.instructions.length - 1)}
              className="flex-1 py-2 gradient-button text-primary-foreground"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {data.tip && allDone && (
            <div className="text-xs text-muted-foreground border border-border rounded-md px-3 py-2 bg-card/60">
              <span className="font-semibold text-foreground">Chef Tip: </span>
              {data.tip}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

