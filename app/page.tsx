"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Mode = "login" | "signup"

type StoredUser = {
  name: string
  email: string
  password: string
  location: string
  diet: string
}

const STORAGE_USER = "user"
const STORAGE_LOGGED_IN = "isLoggedIn"

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export default function LoginPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<Mode>("login")

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [name, setName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [location, setLocation] = useState("")
  const [diet, setDiet] = useState("")

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    if (typeof window === "undefined") return
    if (localStorage.getItem(STORAGE_LOGGED_IN) === "true") {
      router.replace("/dashboard")
    }
  }, [router])

  const resetMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    resetMessages()

    if (!name.trim() || !signupEmail.trim() || !signupPassword || !location.trim() || !diet) {
      setError("All fields are required.")
      return
    }
    if (!isValidEmail(signupEmail)) {
      setError("Please enter a valid email address.")
      return
    }
    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    const user: StoredUser = {
      name: name.trim(),
      email: signupEmail.trim().toLowerCase(),
      password: signupPassword,
      location: location.trim(),
      diet,
    }

    localStorage.setItem(STORAGE_USER, JSON.stringify(user))
    setSuccess("Account created! You can log in now.")
    setMode("login")
    setLoginEmail(user.email)
    setLoginPassword("")
    setName("")
    setSignupEmail("")
    setSignupPassword("")
    setLocation("")
    setDiet("")
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    resetMessages()

    if (!loginEmail.trim() || !loginPassword) {
      setError("Email and password are required.")
      return
    }
    if (!isValidEmail(loginEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    const raw = localStorage.getItem(STORAGE_USER)
    if (!raw) {
      setError("No account found. Please sign up first.")
      return
    }

    let stored: StoredUser
    try {
      stored = JSON.parse(raw) as StoredUser
    } catch {
      setError("Something went wrong. Please sign up again.")
      return
    }

    const emailOk = stored.email === loginEmail.trim().toLowerCase()
    const passOk = stored.password === loginPassword

    if (!emailOk || !passOk) {
      setError("Invalid email or password.")
      return
    }

    localStorage.setItem(STORAGE_LOGGED_IN, "true")
    window.dispatchEvent(new Event("cookmate-auth"))
    router.push("/dashboard")
  }

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-12">
      <div className="w-full max-w-md rounded-xl shadow-lg border border-border bg-card p-8 transition-all duration-300">
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Cookmate AI 🍳
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-8">
          {mode === "login" ? "Sign in to continue" : "Create your account"}
        </p>

        <div className="flex rounded-xl bg-muted/50 p-1 mb-8">
          <button
            type="button"
            onClick={() => {
              setMode("login")
              resetMessages()
            }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
              mode === "login"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup")
              resetMessages()
            }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
              mode === "signup"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Signup
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 text-sm text-primary"
          >
            {success}
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                placeholder="••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-semibold shadow-md hover:opacity-95 hover:shadow-lg active:scale-[0.99] transition-all duration-200"
            >
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1.5">
                Location
              </label>
              <input
                id="location"
                type="text"
                autoComplete="address-level2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                placeholder="City or region"
              />
            </div>
            <div>
              <label htmlFor="diet" className="block text-sm font-medium text-foreground mb-1.5">
                Diet Preference
              </label>
              <select
                id="diet"
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              >
                <option value="">Select…</option>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Gym Diet">Gym Diet</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-semibold shadow-md hover:opacity-95 hover:shadow-lg active:scale-[0.99] transition-all duration-200"
            >
              Sign up
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
