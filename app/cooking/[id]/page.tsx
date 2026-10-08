"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { RobotChef } from "@/components/robot-chef"
import { CookingTimer } from "@/components/cooking-timer"
import { ArrowLeft, ArrowRight, Check, Lightbulb, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { API_BASE_URL } from "@/lib/api"

interface BackendRecipe {
  id: string
  name: string
  ingredients: string
  steps: string
  cooking_time?: string
  difficulty?: string
  image?: string
}

export default function CookingGuidePage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [recipe, setRecipe] = useState<BackendRecipe | null>(null)
  const [steps, setSteps] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${API_BASE_URL}/recipe/${id}`, {
          cache: "no-store",
        })
        if (!res.ok) {
          throw new Error("Recipe not found")
        }
        const data: BackendRecipe = await res.json()
        if (cancelled) return

        setRecipe(data)
        const parsedSteps =
          typeof data.steps === "string"
            ? data.steps
                .split("|")
                .map((s) => s.trim())
                .filter(Boolean)
            : []
        setSteps(parsedSteps)
        setCurrentStep(0)
        setCompletedSteps([])
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load recipe.")
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
  }, [id])

  if (loading && !recipe) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 text-center">
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </main>
    )
  }

  if (error || !recipe || steps.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            {error || "Recipe not found"}
          </h1>
          <Link
            href="/recipes"
            className="text-primary hover:underline mt-4 inline-block"
          >
            Back to recipes
          </Link>
        </div>
      </main>
    )
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNextStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepText = steps[currentStep]

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link 
              href={`/recipes/${id}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to recipe
            </Link>
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Normal Cooking Mode</span>
            </div>
          </div>

          {/* Recipe Title and Progress */}
          <div className="bg-card rounded-2xl p-6 border border-border mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {recipe.name}
            </h1>
            <div className="flex items-center gap-4">
              <Progress value={progress} className="flex-1 h-3" />
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Side - Steps List */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 border border-border sticky top-24">
                <h3 className="font-semibold text-foreground mb-4">All Steps</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {steps.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 ${
                        index === currentStep
                          ? "bg-primary/10 border border-primary"
                          : completedSteps.includes(index)
                          ? "bg-accent/10 border border-accent/30"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          completedSteps.includes(index)
                            ? "bg-accent text-accent-foreground"
                            : index === currentStep
                            ? "gradient-button text-primary-foreground"
                            : "bg-muted-foreground/20 text-muted-foreground"
                        }`}
                      >
                        {completedSteps.includes(index) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            index === currentStep
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {step}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center - Current Step */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 border border-border mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full gradient-button flex items-center justify-center text-xl font-bold text-primary-foreground">
                    {currentStep + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Step {currentStep + 1}
                    </h2>
                  </div>
                </div>
                
                <p className="text-foreground leading-relaxed mb-6">
                  {currentStepText}
                </p>

                <div className="bg-secondary/20 rounded-xl p-4 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-secondary-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-secondary-foreground text-sm">
                      Pro Tip
                    </p>
                    <p className="text-sm text-secondary-foreground/80">
                      Read the full step carefully before you start, and prepare
                      all ingredients needed for this step.
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="flex-1 py-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="flex-1 gradient-button text-primary-foreground py-6"
                >
                  {currentStep === steps.length - 1 ? "Complete" : "Next Step"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Right Side - Timer and Chef */}
            <div className="lg:col-span-1 space-y-6">
              <CookingTimer 
                initialMinutes={5} 
                label={`Timer: Step ${currentStep + 1}`}
              />
              
              <RobotChef 
                message={currentStepText}
                isTalking={false}
                showInput={true}
              />

              {/* Ingredient Checklist */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">
                  Ingredients
                </h3>
                <p className="text-sm text-muted-foreground">
                  Check the ingredients for this recipe on the previous page
                  while you follow these steps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
