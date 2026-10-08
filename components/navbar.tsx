"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X, ChefHat, Home, BookOpen, Tv, Info, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

const STORAGE_LOGGED_IN = "isLoggedIn"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setMounted(true)
    const read = () =>
      setIsLoggedIn(typeof window !== "undefined" && localStorage.getItem(STORAGE_LOGGED_IN) === "true")
    read()
    window.addEventListener("storage", read)
    window.addEventListener("cookmate-auth", read)
    return () => {
      window.removeEventListener("storage", read)
      window.removeEventListener("cookmate-auth", read)
    }
  }, [])

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/recipes", label: "Recipes", icon: BookOpen },
    { href: "/virtual-kitchen", label: "Virtual Kitchen", icon: Tv },
    { href: "/about", label: "About", icon: Info },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gradient-button flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              CookMate <span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors font-medium"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {mounted && !isLoggedIn && (
            <div className="hidden md:flex items-center gap-4">
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Link href="/">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Link>
              </Button>
            </div>
          )}

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden glass border-t border-border">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon className="w-5 h-5 text-primary" />
                {link.label}
              </Link>
            ))}
            {mounted && !isLoggedIn && (
              <Button asChild className="w-full gradient-button text-primary-foreground mt-4">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
