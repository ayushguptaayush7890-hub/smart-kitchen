"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { IngredientInput } from "@/components/ingredient-input"
import { Bot, Utensils, Camera, Sparkles, ChefHat, Clock, Heart, Zap, LogOut, Dumbbell, Video, ChevronRight } from "lucide-react"

type StoredUser = {
  name: string
  email: string
  password: string
  location: string
  diet: string
}

const STORAGE_USER = "user"
const STORAGE_LOGGED_IN = "isLoggedIn"

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    if (typeof window === "undefined") return

    const loggedIn = localStorage.getItem(STORAGE_LOGGED_IN)
    if (loggedIn !== "true") {
      router.replace("/")
      return
    }

    const raw = localStorage.getItem(STORAGE_USER)
    if (!raw) {
      router.replace("/")
      return
    }

    try {
      const user = JSON.parse(raw) as StoredUser
      if (!user?.name) {
        router.replace("/")
        return
      }
      setUserName(user.name)
    } catch {
      router.replace("/")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_LOGGED_IN)
    localStorage.removeItem(STORAGE_USER)
    window.dispatchEvent(new Event("cookmate-auth"))
    router.replace("/")
  }

  if (!mounted || !userName) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Welcome + logout — minimal addition above existing homepage */}
      <div className="pt-20 border-b border-border/60 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm sm:text-base text-foreground">
            Welcome, <span className="font-semibold text-primary">{userName}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/recipes?tip=aireview"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/20 transition-colors"
            >
              <Video className="w-4 h-4" />
              AI Dish Review
            </Link>
            <Link
              href="/gym"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/15 transition-colors"
            >
              <Dumbbell className="w-4 h-4" />
              Gym Planner
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-30" />

        <div className="absolute top-32 left-10 w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center animate-float">
          <span className="text-3xl">🍅</span>
        </div>
        <div
          className="absolute top-48 right-20 w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          <span className="text-2xl">🥚</span>
        </div>
        <div
          className="absolute bottom-32 left-1/4 w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center animate-float"
          style={{ animationDelay: "1s" }}
        >
          <span className="text-2xl">🧅</span>
        </div>
        <div
          className="absolute top-64 left-1/3 w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          <span className="text-xl">🧀</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
                CookMate AI
                <span className="block text-primary">Your Virtual Robot Chef</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Enter ingredients or upload a photo and cook delicious meals with step-by-step guidance from your AI
                chef assistant.
              </p>

              <IngredientInput />

              <Link
                href="/recipes?tip=aireview"
                className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-md hover:border-primary/40 hover:shadow-lg transition-all group text-left"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                  <Video className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    CookMate AI Dish Review
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Pehle recipes chuno, phir recipe page par neeche apna cooking video upload karke AI rating lo.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0" />
              </Link>
            </div>

            <div className="hidden lg:flex justify-center items-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-full gradient-button opacity-20 absolute -inset-4 animate-pulse-glow" />
                <div className="w-72 h-72 bg-card rounded-full shadow-2xl flex items-center justify-center relative animate-bounce-slow">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full gradient-button flex items-center justify-center">
                      <Bot className="w-16 h-16 text-primary-foreground" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">Chef Bot</p>
                    <p className="text-sm text-muted-foreground">Ready to cook!</p>
                  </div>
                </div>

                <div
                  className="absolute -top-4 -right-8 bg-secondary rounded-2xl rounded-br-none px-4 py-3 shadow-lg max-w-[200px] animate-bounce-slow"
                  style={{ animationDelay: "0.3s" }}
                >
                  <p className="text-sm text-secondary-foreground font-medium">
                    {"Let's cook something delicious today!"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-primary">CookMate AI</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the future of cooking with our AI-powered kitchen assistant
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {[
              {
                icon: Camera,
                title: "Photo Recognition",
                description: "Upload a photo of your ingredients and our AI will identify them instantly",
                color: "text-primary bg-primary/10",
              },
              {
                icon: Sparkles,
                title: "Smart Recipes",
                description: "Get personalized recipe suggestions based on your available ingredients",
                color: "text-secondary-foreground bg-secondary/30",
              },
              {
                icon: ChefHat,
                title: "Virtual Chef",
                description: "Cook with a friendly AI robot chef in an immersive virtual kitchen",
                color: "text-accent bg-accent/10",
              },
              {
                icon: Clock,
                title: "Step-by-Step",
                description: "Follow easy step-by-step instructions with timers and helpful tips",
                color: "text-destructive bg-destructive/10",
              },
              {
                icon: Video,
                title: "AI Dish Review",
                description: "Upload your cooking clip on any recipe page and get instant presentation & technique scores",
                color: "text-primary bg-primary/10",
                href: "/recipes?tip=aireview" as const,
              },
            ].map((feature, index) => {
              const card = (
                <>
                  <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </>
              )
              const shell =
                "bg-background rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block h-full"
              if ("href" in feature && feature.href) {
                return (
                  <Link key={index} href={feature.href} className={shell}>
                    {card}
                  </Link>
                )
              }
              return (
                <div key={index} className={shell}>
                  {card}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Start cooking in just three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Utensils,
                title: "Enter Ingredients",
                description: "Type your available ingredients or upload a photo of what you have",
              },
              {
                step: "02",
                icon: Heart,
                title: "Choose a Recipe",
                description: "Browse AI-suggested recipes that match your ingredients",
              },
              {
                step: "03",
                icon: Zap,
                title: "Start Cooking",
                description: "Follow step-by-step guidance in normal or virtual kitchen mode",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-card rounded-2xl p-8 shadow-lg border border-border h-full hover:shadow-xl transition-shadow">
                  <span className="text-6xl font-bold text-primary/20 absolute top-4 right-6">{item.step}</span>
                  <div className="w-16 h-16 rounded-2xl gradient-button flex items-center justify-center mb-6">
                    <item.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Start Cooking?</h2>
          <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of home cooks who are already enjoying personalized recipes and step-by-step guidance from
            CookMate AI.
          </p>
          <a
            href="/recipes"
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl font-semibold text-lg hover:bg-foreground/90 transition-colors"
          >
            <ChefHat className="w-5 h-5" />
            Get Started Free
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
