"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowLeft, Dumbbell } from "lucide-react"

const STORAGE_LOGGED_IN = "isLoggedIn"
const STORAGE_USER = "user"

export type GymFood = {
  name: string
  calories: number
  protein: number
  diet: string
  goal: string
}

type GoalOption = "Weight Loss" | "Muscle Gain" | "Maintenance"
type DietOption = "Veg" | "Non-Veg"

function parseGymFoodsCsv(text: string): GymFood[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
  if (lines.length < 2) return []

  const rows: GymFood[] = []
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",")
    if (parts.length < 5) continue
    const [name, calStr, protStr, diet, goal] = parts
    const calories = Number.parseInt(calStr, 10)
    const protein = Number.parseInt(protStr, 10)
    if (!name?.trim() || Number.isNaN(calories) || Number.isNaN(protein)) continue
    rows.push({
      name: name.trim(),
      calories,
      protein,
      diet: diet.trim(),
      goal: goal.trim(),
    })
  }
  return rows
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function pickRandomCount(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function dailyCalories(weightKg: number, goal: GoalOption): number {
  const maintenance = weightKg * 30
  if (goal === "Weight Loss") return Math.round(maintenance - 500)
  if (goal === "Muscle Gain") return Math.round(maintenance + 300)
  return Math.round(maintenance)
}

export default function GymDietPlannerPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [authorized, setAuthorized] = useState(false)

  const [foods, setFoods] = useState<GymFood[]>([])
  const [csvError, setCsvError] = useState<string | null>(null)

  const [weight, setWeight] = useState("")
  const [goal, setGoal] = useState<GoalOption>("Maintenance")
  const [diet, setDiet] = useState<DietOption>("Veg")
  const [mealsPerDay, setMealsPerDay] = useState("3")

  const [calculatedDailyCalories, setCalculatedDailyCalories] = useState<number | null>(null)
  const [recommended, setRecommended] = useState<GymFood[]>([])
  const [highProteinNames, setHighProteinNames] = useState<string[]>([])
  const [perMealCalories, setPerMealCalories] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    if (typeof window === "undefined") return
    if (localStorage.getItem(STORAGE_LOGGED_IN) !== "true" || !localStorage.getItem(STORAGE_USER)) {
      router.replace("/")
      return
    }
    setAuthorized(true)
  }, [router])

  useEffect(() => {
    if (!authorized) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/gym_foods.csv", { cache: "no-store" })
        if (!res.ok) throw new Error("Could not load gym_foods.csv")
        const text = await res.text()
        if (cancelled) return
        const parsed = parseGymFoodsCsv(text)
        if (parsed.length === 0) throw new Error("No food rows found in CSV")
        setFoods(parsed)
        setCsvError(null)
      } catch (e) {
        if (!cancelled) {
          setCsvError(e instanceof Error ? e.message : "Failed to load dataset")
          setFoods([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [authorized])

  const generatePlan = useCallback(() => {
    setFormError(null)
    const w = Number.parseFloat(weight)
    if (!weight.trim() || Number.isNaN(w) || w <= 0 || w > 500) {
      setFormError("Enter a valid weight (kg), between 1 and 500.")
      return
    }
    const meals = Number.parseInt(mealsPerDay, 10)
    if (!mealsPerDay.trim() || Number.isNaN(meals) || meals < 1 || meals > 10) {
      setFormError("Meals per day must be between 1 and 10.")
      return
    }

    const filtered = foods.filter((f) => f.goal === goal && f.diet === diet)
    if (filtered.length === 0) {
      setFormError("No dishes match your goal and diet. Try different filters.")
      setCalculatedDailyCalories(null)
      setRecommended([])
      setHighProteinNames([])
      setPerMealCalories(null)
      return
    }

    const count = Math.min(pickRandomCount(4, 6), filtered.length)
    const picked = shuffle(filtered).slice(0, count)

    const daily = dailyCalories(w, goal)
    setCalculatedDailyCalories(daily)
    setPerMealCalories(Math.round(daily / meals))
    setRecommended(picked)

    const maxP = Math.max(...picked.map((p) => p.protein))
    const threshold = Math.max(20, maxP - 5)
    const highlights = picked.filter((p) => p.protein >= threshold).map((p) => p.name)
    setHighProteinNames(highlights.length > 0 ? highlights : picked.map((p) => p.name))
  }, [foods, weight, goal, diet, mealsPerDay])

  const proteinNote = useMemo(() => {
    if (recommended.length === 0) return ""
    const top = recommended.reduce((a, b) => (a.protein >= b.protein ? a : b))
    return `Strongest pick for protein right now: ${top.name} (${top.protein}g).`
  }, [recommended])

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </main>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="rounded-xl shadow-md border border-border bg-card p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gym Diet Planner 🏋️‍♂️</h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Set your stats, pick a goal and diet type, and get a daily calorie target plus meal ideas from our gym
            foods list.
          </p>
        </div>

        {csvError && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-sm p-4 mb-6">
            {csvError}
          </div>
        )}

        <form
          className="rounded-xl shadow-md border border-border bg-card p-6 sm:p-8 space-y-5 mb-8"
          onSubmit={(e) => {
            e.preventDefault()
            generatePlan()
          }}
        >
          <h2 className="text-lg font-semibold text-foreground">Your plan inputs</h2>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-foreground mb-1.5">
              Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              min={1}
              step={0.1}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 70"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-foreground mb-1.5">
              Goal
            </label>
            <select
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value as GoalOption)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
            >
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label htmlFor="diet" className="block text-sm font-medium text-foreground mb-1.5">
              Diet type
            </label>
            <select
              id="diet"
              value={diet}
              onChange={(e) => setDiet(e.target.value as DietOption)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
            >
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
            </select>
          </div>

          <div>
            <label htmlFor="meals" className="block text-sm font-medium text-foreground mb-1.5">
              Meals per day
            </label>
            <input
              id="meals"
              type="number"
              min={1}
              max={10}
              value={mealsPerDay}
              onChange={(e) => setMealsPerDay(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
            />
          </div>

          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={foods.length === 0}
            className="w-full sm:w-auto rounded-xl bg-primary text-primary-foreground px-8 py-3 font-semibold shadow-md hover:opacity-95 transition-all disabled:opacity-50"
          >
            Build my plan
          </button>
        </form>

        {calculatedDailyCalories !== null && recommended.length > 0 && (
          <div className="space-y-6">
            <section className="rounded-xl shadow-md border border-border bg-card p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span aria-hidden>🔥</span> Calories
              </h2>
              <p className="text-3xl font-bold text-primary mb-2">{calculatedDailyCalories} kcal</p>
              <p className="text-sm text-muted-foreground">
                Daily target based on weight × 30 (maintenance), adjusted for your goal.
                {perMealCalories !== null && (
                  <>
                    {" "}
                    Roughly <span className="font-medium text-foreground">{perMealCalories} kcal</span> per meal (
                    {mealsPerDay} meals).
                  </>
                )}
              </p>
            </section>

            <section className="rounded-xl shadow-md border border-border bg-card p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span aria-hidden>🍽️</span> Recommended dishes
              </h2>
              <ul className="space-y-3">
                {recommended.map((f) => (
                  <li
                    key={`${f.name}-${f.calories}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-lg border border-border/60 bg-background/50 px-4 py-3"
                  >
                    <span className="font-medium text-foreground">{f.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {f.calories} kcal · {f.protein}g protein
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl shadow-md border border-border bg-primary/5 p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span aria-hidden>💪</span> Protein highlight
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                These picks are especially strong on protein for your selection:
              </p>
              <ul className="list-disc list-inside text-foreground text-sm space-y-1">
                {highProteinNames.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4">{proteinNote}</p>
            </section>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
