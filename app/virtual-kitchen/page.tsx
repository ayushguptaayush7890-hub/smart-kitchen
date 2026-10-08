"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { CookingTimer } from "@/components/cooking-timer"
import { RobotChef } from "@/components/robot-chef"
import { ArrowLeft, ArrowRight, Check, MessageSquare, Timer, ChefHat, Sparkles, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/api"
import { getKitchenActionFromStepText } from "@/components/three/kitchenAction"

// Dynamic import for 3D scene to avoid SSR issues
const KitchenScene = dynamic(
  () => import("@/components/three/KitchenScene").then(mod => ({ default: mod.KitchenScene })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-card/20 to-card/5">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-button flex items-center justify-center animate-pulse">
            <ChefHat className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading 3D Kitchen...</p>
        </div>
      </div>
    )
  }
)

interface BackendRecipe {
  id: string
  name: string
  ingredients: string
  steps: string
  cooking_time?: string
  difficulty?: string
  image?: string
}

interface UIStep {
  step: number
  title: string
  description: string
}

export default function VirtualKitchenPage() {
  const searchParams = useSearchParams()
  const recipeId = searchParams.get("recipe") ?? "1"

  const [recipe, setRecipe] = useState<BackendRecipe | null>(null)
  const [steps, setSteps] = useState<UIStep[]>([])
  const [uiStepIndex, setUiStepIndex] = useState(0)
  const [isTalking, setIsTalking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const currentStepData = steps[uiStepIndex]

  const kitchenAction = useMemo(
    () => getKitchenActionFromStepText(currentStepData?.description ?? ""),
    [currentStepData?.description]
  )

  const parseCookingMinutes = (value?: string) => {
    if (!value) return 20
    const match = String(value).match(/(\d+)/)
    return match ? Number(match[1]) : 20
  }

  const totalMinutes = parseCookingMinutes(recipe?.cooking_time)
  const perStepMinutes =
    steps.length > 0 ? Math.max(1, Math.round(totalMinutes / steps.length)) : 5

  // Load recipe and steps from backend so the virtual kitchen
  // always reflects the selected recipe.
  useEffect(() => {
    if (!recipeId) return

    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        setRecipe(null)
        setSteps([])
        setUiStepIndex(0)

        const res = await fetch(`${API_BASE_URL}/recipe/${recipeId}`, {
          cache: "no-store",
        })
        if (!res.ok) {
          throw new Error("Recipe not found")
        }
        const data: BackendRecipe = await res.json()
        if (cancelled) return

        setRecipe(data)

        const rawSteps =
          typeof data.steps === "string"
            ? data.steps
                .split("|")
                .map((s) => s.trim())
                .filter(Boolean)
            : []

        const mapped: UIStep[] = rawSteps.map((text, index) => ({
          step: index + 1,
          title: text,
          description: text,
        }))

        setSteps(mapped)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load recipe for virtual kitchen.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [recipeId])

  const goToUiStep = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(nextIndex, steps.length - 1))
    setUiStepIndex(clamped)
    const text = steps[clamped]?.description || ""
    if (text) {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.95
        utterance.pitch = 1.05
        utterance.onstart = () => setIsTalking(true)
        utterance.onend = () => setIsTalking(false)
        window.speechSynthesis.speak(utterance)
      }
    }
  }

  const handlePrevStep = () => {
    if (uiStepIndex > 0) goToUiStep(uiStepIndex - 1)
  }

  const handleNextStep = () => {
    if (uiStepIndex < steps.length - 1) goToUiStep(uiStepIndex + 1)
  }

  const handlePlayInstructions = () => {
    if (typeof window === "undefined" || !currentStepData) return
    const text = currentStepData.description
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.05
    utterance.onstart = () => setIsTalking(true)
    utterance.onend = () => setIsTalking(false)
    window.speechSynthesis.speak(utterance)
  }

  const handleStopInstructions = () => {
    if (typeof window === "undefined") return
    window.speechSynthesis.cancel()
    setIsTalking(false)
  }

  if (loading && !recipe) {
    return (
      <main className="min-h-screen gradient-dark text-foreground">
        <Navbar />
        <section className="pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-muted-foreground">Loading virtual kitchen for this recipe...</p>
          </div>
        </section>
      </main>
    )
  }

  if (error || !recipe || steps.length === 0) {
    return (
      <main className="min-h-screen gradient-dark text-foreground">
        <Navbar />
        <section className="pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold">
              {error || "Recipe not found for virtual kitchen"}
            </h1>
            <Link
              href="/recipes"
              className="inline-block mt-4 text-primary hover:underline"
            >
              Back to recipes
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen gradient-dark text-foreground">
      <Navbar />
      
      <section className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/recipes"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Kitchen
            </Link>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary">Virtual Kitchen Mode</span>
            </div>
          </div>

          {/* Recipe Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-card-foreground mb-2">
              {recipe.name}
            </h1>
            <p className="text-muted-foreground">
              Step {uiStepIndex + 1} of {steps.length}
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left Side - Step Tracker */}
            <div className="lg:col-span-1">
              <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
                <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  Cooking Steps
                </h3>
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <button
                      key={step.step}
                      onClick={() => goToUiStep(index)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                        index === uiStepIndex
                          ? "bg-primary/20 border border-primary"
                          : index < uiStepIndex
                          ? "bg-accent/10 border border-accent/30"
                          : "bg-card/5 border border-border/30 hover:bg-card/10"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        index < uiStepIndex
                          ? "bg-accent text-accent-foreground"
                          : index === uiStepIndex
                          ? "gradient-button text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground"
                      }`}>
                        {index < uiStepIndex ? <Check className="w-3 h-3" /> : step.step}
                      </div>
                      <span className={`text-sm truncate ${
                        index === uiStepIndex ? "text-primary font-medium" : "text-card-foreground/80"
                      }`}>
                        {step.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center - 3D Kitchen Canvas */}
              <div className="lg:col-span-2">
              <div className="relative rounded-3xl overflow-hidden border border-primary/30">
                {/* 3D Kitchen Scene */}
                <div className="aspect-video bg-gradient-to-b from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800">
                  <KitchenScene
                    kitchenAction={kitchenAction}
                    isTalking={isTalking}
                    robotMessage={
                      currentStepData
                        ? currentStepData.description
                        : "Hello! I'm your AI chef assistant. Let's start cooking!"
                    }
                  />
                </div>
                
                {/* Current Step Overlay */}
                {currentStepData && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-card/90 backdrop-blur-md rounded-2xl p-4 border border-border/50 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-button flex items-center justify-center font-bold text-primary-foreground flex-shrink-0">
                          {currentStepData.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-card-foreground">{currentStepData.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">{currentStepData.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Control Buttons (visual only for now) */}
              <div className="flex justify-center gap-4 mt-6">
                <Button
                  onClick={handlePrevStep}
                  disabled={uiStepIndex === 0}
                  variant="outline"
                  className="px-6 py-6 bg-card/10 border-border/50 text-card-foreground hover:bg-card/20"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={uiStepIndex >= steps.length - 1}
                  className="px-8 py-6 gradient-button text-primary-foreground"
                >
                  {uiStepIndex >= steps.length - 1 ? "Complete" : "Next Step"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            {/* Right Side - Robot Chef Panel */}
            <div className="lg:col-span-1 space-y-6">
              <RobotChef
                message={
                  currentStepData
                    ? currentStepData.description
                    : "Hello! I'm your AI chef assistant. Let's start cooking!"
                }
                isTalking={isTalking}
                showInput={false}
                variant="dark"
              />

              <CookingTimer
                key={uiStepIndex}
                initialMinutes={perStepMinutes + (uiStepIndex % 3)}
                label={currentStepData?.title || `Step ${uiStepIndex + 1}`}
              />

              {/* Quick Actions */}
              <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
                <h3 className="font-semibold text-card-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 bg-card/5 border-border/50 text-card-foreground hover:bg-card/10"
                  >
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Ask Chef
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 bg-card/5 border-border/50 text-card-foreground hover:bg-card/10"
                    onClick={handlePlayInstructions}
                  >
                    <Timer className="w-4 h-4 text-accent" />
                    Play Instructions
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 bg-card/5 border-border/50 text-card-foreground hover:bg-card/10"
                    onClick={handleStopInstructions}
                  >
                    <Timer className="w-4 h-4 text-destructive" />
                    Stop Instructions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
